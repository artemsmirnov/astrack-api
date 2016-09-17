import { Router } from 'express';
import { authorizedOnly, validate } from 'middlewares';

import { Activity, Log } from 'db';

import { wrap } from './utils';
import { HttpError } from 'HttpError';

const activities = Router();

activities.use(authorizedOnly);

activities.get('/',
	wrap(async function(req, res) {
		const activities = await Activity.findAll({
			where: {
				userUsername: req.username
			},
			attributes: ['id', 'name'],
			include: [{
				model: Log,
				attributes: ['id', 'summary', 'date', 'duration']
			}]
		});

		res.status(200).json({activities});
	})
);

activities.post('/',
	validate({
		body: {
			required: ['name'],
			properties: {
				name: {
					type: 'string',
					minLength: 1
				}
			}
		}
	}),
	wrap(async function(req, res) {
		const activity = await req.user.createActivity({
			name: req.body.name
		});

		res.status(201).json({
			activity: {
				...(activity.toJSON()),
				logs: [] //@TODO remove this legwork
			}
		});
	})
);

activities.delete('/:activityId',
	wrap(async function(req, res) {
		const destroyCount = await Activity.destroy({
			where: {
				id: req.params.activityId,
				userUsername: req.username
			}
		});

		if (destroyCount) {
			res.status(200).json({});
		} else {
			throw new HttpError(403, 'access_denied');
		}
	})
);

export default activities;