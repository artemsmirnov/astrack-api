import config from 'config';
import supertest from 'supertest';
import { clear as clearDb } from 'db';
import app from 'app';

before(app.resolveWhenReady);
beforeEach(clearDb);

describe('api /users', function () {
	describe('POST /signup', function () {
		it('should create user and return it', async function () {
			const agent = supertest(app);
			
			const createUserResponse = await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '12345678'
				});

			createUserResponse.statusCode.should.be.equal(201);
			createUserResponse.body.should.have.property('accessToken');
			createUserResponse.body.should.containEql({
				user: {
					username: 'test'
				}
			});
		});

		it('should return error on username conflict', async function () {
			const agent = supertest(app);

			await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '12345678'
				});

			const createCollisionUserResponse = await agent.post('/api/users/signup')
				.send({
					username: 'Test',
					password: 'gw45g4v5v05'
				});

			createCollisionUserResponse.statusCode.should.be.equal(422);
			createCollisionUserResponse.body.should.be.eql({
				error: 'username_is_taken'
			});
		});
	});

	describe('POST /signin', function () {
		beforeEach('create user', async function () {
			const agent = supertest(app);

			await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '123123123'
				});
		});

		it('should return Access-Token', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					username: 'test',
					password: '123123123'
				});

			signInResponse.statusCode.should.be.equal(200);
			signInResponse.body.should.have.property('accessToken');
			signInResponse.body.should.containEql({
				user: {
					username: 'test'
				}
			});
		});

		it('should let signin with token in other case', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					username: 'TeST',
					password: '123123123'
				});

			signInResponse.statusCode.should.be.equal(200);
			signInResponse.body.should.have.property('accessToken');
			signInResponse.body.should.containEql({
				user: {
					username: 'test'
				}
			});
		});

		it('should return error when password is wrong', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					username: 'test',
					password: '000000'
				});

			signInResponse.statusCode.should.be.equal(400);
			signInResponse.body.should.be.eql({
				error: 'user_not_found'
			});
		});

		it('should return error when user not found', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					username: 'fubar',
					password: '000000'
				});

			signInResponse.statusCode.should.be.equal(400);
			signInResponse.body.should.be.eql({
				error: 'user_not_found'
			});
		});
	});

	describe('GET /me', function () {
		beforeEach('create user', async function() {
			const agent = supertest(app);

			await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '123123123'
				});
		});

		it('should send user', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					username: 'test',
					password: '123123123'
				});

			const getMeResponse = await agent.get('/api/users/me')
				.set('Authorization', signInResponse.body.accessToken);

			getMeResponse.statusCode.should.be.equal(200);
			getMeResponse.body.should.be.eql({
				user: {
					username: 'test'
				}
			});
		});
	});
});
