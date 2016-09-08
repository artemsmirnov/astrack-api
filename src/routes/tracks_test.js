import config from 'config';
import supertest from 'supertest';
import { clearDb } from './testUtils';
import app from 'app';

async function createAgentAndUser(username, password) {
	const agent = supertest(app);

	await agent.post('/api/users/signup')
		.send({username, password});

	return agent;
}

describe('/tracks', function () {
	describe('POST /track', function () {
		it('should return new track if it is a new activity', async function () {
			const agent = await createAgentAndUser('test', '123123123');

			const postTrack = await agent.post('/api/tracks/track')
				.send({
					activity: 'PR-1',
					date: 0,
					duration: 1000
				});

			postTrack.statusCode.should.be.equal(200);
			postTrack.body.should.be.eql({
				track: {
					activity: 'PR-1',
					logs: [
						{
							date: 0,
							duration: 1000
						}
					]
				}
			});
		});

		it('should return modified track if it an is existing activity', async function () {
			const agent = await createAgentAndUser('test', '123123123');

			await agent.post('/api/tracks/track')
				.send({
					activity: 'PR-1',
					date: 0,
					duration: 1000
				});

			const postTrackResponse = await agent.post('/api/tracks/track')
				.send({
					activity: 'PR-1',
					date: 5000,
					duration: 1000
				});

			postTrackResponse.statusCode.should.be.equal(200);
			postTrackResponse.body.should.be.eql({
				track: {
					activity: 'PR-1',
					logs: [
						{
							date: 0,
							duration: 1000
						},
						{
							date: 5000,
							duration: 1000
						}
					]
				}
			});
		});

		it('should return error if input data is not valid', async function() {
			const agent = await createAgentAndUser('test', '123123123');

			const postTrackResponse = await agent.post('/api/tracks/track')
				.send({
					activity: '',
					date: 0,
					duration: 1000
				});

			postTrackResponse.statusCode.should.be.equal(400);
			postTrackResponse.body.should.be.eql({
				errors: [
					{
						message: 'invalid_activity'
					}
				]
			});
		});

		it('should return error if client is not logged in', async function () {
			const agent = supertest(app);

			const postTrackResponse = await agent.post('/api/tracks/track')
				.send({
					activity: 'PR-1',
					date: 0,
					duration: 1000
				});

			postTrackResponse.statusCode.should.be.equal(403);
			postTrackResponse.body.should.be.eql({
				errors: [
					{
						message: 'not_signed_in'
					}
				]
			});
		});
	});


	describe('GET /', function () {
		it('should return tracks if client is logged in', async function() {
			const agent = await createAgentAndUser('test', '123123123');

			await agent.post('/api/tracks/track')
				.send({
					activity: 'PR-1',
					date: 0,
					duration: 1000
				});

			await agent.post('/api/tracks/track')
				.send({
					activity: 'PR-2',
					date: 5000,
					duration: 1000
				});

			const getTracksResponse = await agent.get('/api/tracks');

			getTracksResponse.statusCode.should.be.equal(200);
			getTracksResponse.body
				.should.have.property('tracks')
				.which.containDeep([
					{
						activity: 'PR-1'
					},
					{
						activity: 'PR-2'
					}
				]);
		});

		it('should return error if client is not logged in', async function() {
			const agent = supertest(app);
			const getTracksResponse = await agent.get('/api/tracks');

			getTracksResponse.statusCode.should.be.equal(403);
			getTracksResponse.body.should.be.eql({
				errors: [
					{
						message: 'not_signed_in'
					}
				]
			});
		});
	});

	describe('DELETE /{trackId}', function () {
		it('should delete track');
		it('should return error if track not found');
		it('should return error if client is not logged in');
		it('should return track not found if user do not have access to this track');
	});

	describe('DELETE /{trackId}/{trackLogId}', function () {
		it('should delete log from track and return modified track');
		it('should return error if track not found');
		it('shpuld return error if track\'s not found');
		it('should return error if client is not logged in');
		it('should return track not found if user do not have access to this track');
	});
});
