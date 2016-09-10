import { Router } from 'express';
import { User } from 'db';
import { sign as signToken } from 'token';
import { wrap } from './utils';
import { HttpError } from 'HttpError';
import _ from 'lodash';

const users = Router();

users.post('/signup', wrap(async function(req, res) {
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
}));

export default users;