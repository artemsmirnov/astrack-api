import { Router } from 'express';
import { User } from 'db';
import { sign as signToken } from 'token';
import { wrap } from './utils';
import { HttpError } from 'HttpError';
import _ from 'lodash';
import Ajv from 'ajv';

function validate(schema) {
	const ajv = new Ajv({allErrors: true});
	const validator = ajv.compile(schema.body);

	return function(req, res, next) {
		try {
			const valid = validator(req.body);
			const errors = validator.errors;
			
			if (valid) {
				next();
			} else {
				next(new HttpError(400, 'invalid_input', {errors}))
			}
		} catch (err) {
			next(err);
		}
	}
}

const users = Router();

users.post('/signup',
	validate({
		body: {
			required: ['username', 'password'],
			properties: {
				username: {
					type: 'string',
					pattern: '\\w{4,255}'
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

export default users;