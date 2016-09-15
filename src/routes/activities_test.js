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

describe('api /activities', function () {
	describe('GET /', function () {
		it('should send list of activities with embedded logs');

		// @TODO move it to unit test of onlyAuthorized middleware
		it('should send error if user is not authorized');
	});

	describe('POST /', function () {
		it('should create new activity');
	});

	describe('DELETE /{activityId}', function () {
		it('should delete activity');
		it('should respond 403 on attempt to delete other user\'s activity');
	});

	describe('POST /{activityId}/logs', function () {
		it('should create activity log');
	});

	describe('DELETE /{activityId}/logs/{activityLogId}', function () {
		it('should delete activity log');
	});
});
