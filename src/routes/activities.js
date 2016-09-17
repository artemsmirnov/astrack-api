import { Router } from 'express';
import { authorizedOnly, validate } from 'middlewares';

import { Activity } from 'db';

import { wrap } from './utils';

const activities = Router();

activities.use(authorizedOnly);

activities.get('/',
	wrap(async function() {

	})
);

activities.post('/',
	wrap(async function(req, res) {

	})
);

export default activities;