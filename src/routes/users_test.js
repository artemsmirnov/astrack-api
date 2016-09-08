import config from 'config';
import supertest from 'supertest';
import clearDbFactory from 'mocha-mongoose';
import app from 'app';

const clearDb = clearDbFactory(config.get('mongodb'));

beforeEach(clearDb);
describe('/users', function () {
	describe('POST /signup', function () {
		it('should create user and return it', async function () {
			const agent = supertest(app);
			
			const createUserResponse = await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '12345678'
				});

			createUserResponse.statusCode.should.be.equal(201);
			createUserResponse.body.should.be.eql({
				user: {
					username: 'test'
				}
			});
		});

		it('should create session on signup', async function () {
			const agent = supertest(app);
			
			await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '12345678'
				});

			const getMeResponse = await agent.get('/api/users/me');

			getMeResponse.statusCode.should.be.equal(200);
			getMeResponse.body.should.be.eql({
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
					username: 'test',
					password: 'gw45g4v5v05'
				});
			
			createCollisionUserResponse.statusCode.should.be.equal(422);
			createCollisionUserResponse.body.should.be.eql({
				errors: [
					{
						message: 'username_is_taken'
					}
				]
			});
		});

		it('should return bad request on data is invalid', async function() {
			const agent = supertest(app);

			const createUserShortPasswordResponse = await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '123'
				});

			createUserShortPasswordResponse.statusCode.should.be.equal(400);
			createUserShortPasswordResponse.body.should.be.equal({
				errors: [
					{
						message: 'invalid_password'
					}
				]
			});

			const createUserWithoutUserNameResponse = await agent.post('/api/users/signup')
				.send({
					password: 'f143f13f413'
				});

			createUserWithoutUserNameResponse.statusCode.should.be.equal(400);
			createUserWithoutUserNameResponse.body.should.be.equal({
				errors: [
					{
						message: 'invalid_username'
					}
				]
			});

			const createUserEmptyStringUsernameResponse = await agent.post('/api/users/signup')
				.send({
					username: '',
					password: '2qc5234134f'
				});

			createUserEmptyStringUsernameResponse.statusCode.should.be.equal(400);
			createUserEmptyStringUsernameResponse.body.should.be.equal({
				errors: [
					{
						message: 'invalid_username'
					}
				]
			});

			const createUserInvalidCharactersInUsernameResponse = await agent.post('/api/users/signup')
				.send({
					username: 'test test',
					password: '2qc5234134f'
				});

			createUserInvalidCharactersInUsernameResponse.statusCode.should.be.equal(400);
			createUserInvalidCharactersInUsernameResponse.body.should.be.equal({
				errors: [
					{
						message: 'invalid_username'
					}
				]
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

		it('should create session', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					username: 'test',
					password: '123123123'
				});

			signInResponse.statusCode.should.be.equal(200);
			signInResponse.body.should.be.eql({
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
				errors: [
					{
						message: 'user_not_found'
					}
				]
			});
		});

		it('should return error when username is not provided', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					password: '000000'
				});

			signInResponse.statusCode.should.be.equal(400);
			signInResponse.body.should.be.eql({
				errors: [
					{
						message: 'user_not_found'
					}
				]
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
				errors: [
					{
						message: 'user_not_found'
					}
				]
			});
		});
	});

	describe('POST /signout', function() {
		beforeEach('create user', async function() {
			const agent = supertest(app);

			await agent.post('/api/users/signup')
				.send({
					username: 'test',
					password: '123123123'
				});
		});

		it('should sign out if user signed in', async function() {
			const agent = supertest(app);

			await agent.post('/api/users/signin')
				.send({
					username: 'test',
					password: '123123123'
				});

			const signOutResponse = await agent.post('/api/users/signout');

			signOutResponse.statusCode.should.be.equal(200);
		});

		it('should return error if user not signed in', async function() {
			const agent = supertest(app);

			const signOutResponse = await agent.post('/api/users/signout');

			signOutResponse.statusCode.should.be.equal(403);
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

		it('should return user when client is logged in', async function () {
			const agent = supertest(app);

			await agent.post('/api/users/signin')
				.send({
					username: 'test',
					password: '123123123'
				});

			const getMeResponse = await agent.get('/api/users/me');

			getMeResponse.statusCode.should.be.equal(200);
			getMeResponse.body.should.be.eql({
				user: {
					username: 'test'
				}
			});
		});

		it('should return null when client is not logged in', async function () {
			const agent = supertest(app);

			const getMeResponse = await agent.get('/api/users/me');

			getMeResponse.statusCode.should.be.equal(200);
			getMeResponse.body.should.be.eql({
				user: null
			});
		});
	});
});
