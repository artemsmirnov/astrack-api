import { Router } from 'express';
import { authorizedOnly, validate } from 'middlewares';

import { User } from 'db';

import { sign as signToken } from 'token';
import { HttpError } from 'HttpError';
import { wrap } from './utils';
import _ from 'lodash';

const users = Router();

users.post('/signup',
	validate({
		body: {
			required: ['username', 'password'],
			properties: {
				username: {
					type: 'string',
					pattern: '^\\w{4,255}$'
				},
				password: {
					type: 'string',
					minLength: 6
				}
			}
		}
	}),
	wrap(async function(req, res) {
		try {
			const user = User.build({
				username: req.body.username
			});

			await user.setPassword(req.body.password);
			await user.save();

			const accessToken = signToken({
				username: user.username
			});

			res.status(201).json({
				accessToken, user
			});
		} catch (error) {
			if (
				error.name === 'SequelizeUniqueConstraintError' &&
				_.some(error.errors, _.matches({
					type: 'unique violation',
					path: 'username'
				}))
			) {
				throw new HttpError(422, 'username_is_taken')
			} else {
				throw error;
			}
		}
	})
);

users.post('/signin',
	validate({
		body: {
			required: ['username', 'password'],
			properties: {
				username: {
					type: 'string',
					pattern: '^\\w{4,255}$'
				},
				password: {
					type: 'string',
					minLength: 6
				}
			}
		}
	}),
	wrap(async function(req, res) {
		const user = await User.findOne({
			where: {
				username: req.body.username
			}
		});

		if (user && await user.verifyPassword(req.body.password)) {
			const accessToken = signToken({
				username: user.username
			});

			res.status(200).json({
				accessToken, user
			});
		} else {
			throw new HttpError(400, 'user_not_found');
		}
	})
);

users.use(authorizedOnly);

users.get('/me',
	authorizedOnly,
	wrap(async function(req, res) {
		res.status(200).json({
			user: req.user
		});
	})
);

export default users;