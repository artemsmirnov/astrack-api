import config from 'config';
import supertest from 'supertest';
import { clear as clearDb } from 'db';
import app from 'app';

before(app.resolveWhenReady);
beforeEach(clearDb);

async function signUp(username, password) {
	const agent = supertest(app);

	const signUpReponse = await agent.post('/api/users/signup')
		.send({username, password});

	return signUpReponse.body.accessToken;
}

describe('api /activities', function () {
	describe('GET /', function () {
		it('should send list of activities with embedded logs', async function() {
			const agent = supertest(app);
			const accessToken = await signUp('test', '123123');

			await agent.post('/activities')
				.set('Authorization', accessToken)
				.send({
					name: 'PR-1'
				});

			await agent.post('/activities')
				.set('Authorization', accessToken)
				.send({
					name: 'PR-2'
				});

			const indexResponse = await agent.get('/activities')
				.set('Authorization', accessToken);

			indexResponse.statusCode.should.be.equal(200);
			indexResponse.body.should.have.property('activities')
				.should.have.length(2)
				.should.containDeep([
					{name: 'PR-1'},
					{name: 'PR-2'}
				]);
		});
	});

	describe('POST /', function () {
		it('should create new activity', async function() {
			const agent = supertest(app);
			const accessToken = await signUp('test', '123123');

			const createActivityResponse = await agent.post('/activities')
				.set('Authorization', accessToken)
				.send({
					name: 'PR-1'
				});

			createActivityResponse.statusCode.should.be.equal(201);
			createActivityResponse.activity.should.have.property('name').equal('PR-1');
			createActivityResponse.activity.should.have.property('id');
			createActivityResponse.activity.should.have.property('logs').Array();
		});
	});

	describe('DELETE /{activityId}', function () {
		it('should delete activity', async function() {
			const agent = supertest(app);
			const accessToken = await signUp('test', '123123');

			const createActivityResponse = await agent.post('/activities')
				.set('Authorization', accessToken)
				.send({
					name: 'PR-1'
				});

			await agent.post('/activities')
				.set('Authorization', accessToken)
				.send({
					name: 'PR-2'
				});

			const deleteActivityResponse = await agent
				.delete(`/activities/${createActivityResponse.body.activity.id}`)
				.set('Authorization', accessToken);

			deleteActivityResponse.statusCode.should.be.equal(200);

			const indexResponse = await agent.get('/activities')
				.set('Authorization', accessToken);

			indexResponse.statusCode.should.be.equal(200);
			indexResponse.body.should.have.property('activities')
				.should.have.length(1)
				.should.containDeep([
					{name: 'PR-2'},
				]);
		});

		it('should respond 403 on attempt to delete other user\'s activity', async function() {
			const agent = supertest(app);
			const accessToken = await signUp('test', '123123');
			const accessToken2 = await signUp('test2', '123123');

			const createActivityResponse = await agent.post('/activities')
				.set('Authorization', accessToken)
				.send({
					name: 'PR-1'
				});
			
			const deleteActivityResponse = await agent
				.delete(`/activities/${createActivityResponse.body.activity.id}`)
				.set('Authorization', accessToken2);

			deleteActivityResponse.statusCode.should.be.equal(403);
		});
	});

	describe('POST /{activityId}/logs', function () {
		it('should create activity log');
		it('should respond 403 on attempt to create activity log in other user\'s activity');
	});

	describe('DELETE /{activityId}/logs/{activityLogId}', function () {
		it('should delete activity log');
		it('should respond 403 on attempt to delete other user\'s activity log');
	});
});
