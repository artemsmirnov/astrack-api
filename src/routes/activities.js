import { Router } from 'express';
import { authorizedOnly, validate } from 'middlewares';

import { Activity, Log } from 'db';

import { wrap } from './utils';
import { HttpError } from 'HttpError';

const activities = Router();

activities.use(authorizedOnly);

activities.get('/',
	wrap(async function(req, res) {
		const activities = await Activity.scope('includeLogs').findAll({
			where: {
				userUsername: req.username
			},
			attributes: ['id', 'name']
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
				logs: []
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

		if (destroyCount === 0) {
			throw new HttpError(403, 'access_denied');
		}

		res.status(200).json({});
	})
);

activities.post('/:activityId/logs',
	validate({
		body: {
			required: ['date', 'duration'],
			properties: {
				summary: {
					type: 'string'
				},
				date: {
					type: 'number'
				},
				duration: {
					type: 'number'
				}
			}
		}
	}),
	wrap(async function(req, res) {
		const activity = await Activity.scope('includeLogs').findOne({
			where: {
				id: req.params.activityId,
				userUsername: req.username
			}
		});

		if (!activity) {
			throw new HttpError(403, 'access_denied');
		}

		await activity.createLog({
			summary: req.body.summary,
			date: req.body.date,
			duration: req.body.duration
		});

		await activity.reload();

		res.status(201).json({ activity	});
	})
);

activities.delete('/:activityId/logs/:logId',
	wrap(async function(req, res) {
		const log = await Log.findOne({
			where: {
				id: req.params.logId,
				activityId: req.params.activityId
			},
			include: [
				{
					model: Activity,
					where: {
						userUsername: req.username
					}
				}
			]
		});

		if (!log) {
			throw new HttpError(403, 'access_denied');
		}

		await log.destroy();

		const activity = await Activity.scope('includeLogs').findOne({
			activityId: req.params.activityId,
			username: req.username
		});

		res.status(200).json({activity});
	})
)

export default activities;