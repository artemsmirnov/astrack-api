import config from 'config';
import supertest from 'supertest';
import { clear as clearDb } from 'db';
import app from 'app';

async function createAgentAndUser(username, password) {
	const agent = supertest(app);

	await agent.post('/api/users/signup')
		.send({username, password});

	return agent;
}

describe('/activities', function () {
	
});
