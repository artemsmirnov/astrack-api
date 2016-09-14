import config from 'config';
import supertest from 'supertest';
import { clear as clearDb } from 'db';
import app from 'app';

before(app.resolveWhenReady);
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
					username: 'test',
					password: 'gw45g4v5v05'
				});

			createCollisionUserResponse.statusCode.should.be.equal(422);
			createCollisionUserResponse.body.should.be.eql({
				error: 'username_is_taken'
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
			createUserShortPasswordResponse.body.error.should.be.equal('invalid_input');
			createUserShortPasswordResponse.body.errors[0].should.containEql({
				dataPath: '.password',
				keyword: 'minLength',
				message: 'should NOT be shorter than 6 characters',
				params: {
					limit: 6
				}
			});

			const createUserWithoutUserNameResponse = await agent.post('/api/users/signup')
				.send({
					password: 'f143f13f413'
				});

			createUserWithoutUserNameResponse.statusCode.should.be.equal(400);
			createUserWithoutUserNameResponse.body.error.should.be.equal('invalid_input');
			createUserWithoutUserNameResponse.body.errors[0].should.containEql({
				keyword: 'required',
				message: 'should have required property \'username\'',
				params: {
					missingProperty: 'username'
				}
			});

			const createUserEmptyStringUsernameResponse = await agent.post('/api/users/signup')
				.send({
					username: '',
					password: '2qc5234134f'
				});

			createUserEmptyStringUsernameResponse.statusCode.should.be.equal(400);
			createUserEmptyStringUsernameResponse.body.error.should.be.equal('invalid_input');
			createUserEmptyStringUsernameResponse.body.errors[0].should.containEql({
				dataPath: '.username',
				keyword: 'pattern',
				message: 'should match pattern "^\\w{4,255}$"',
				params: {
					pattern: '^\\w{4,255}$'
				}
			});

			const createUserInvalidCharactersInUsernameResponse = await agent.post('/api/users/signup')
				.send({
					username: 'test test',
					password: '2qc5234134f'
				});

			
			createUserInvalidCharactersInUsernameResponse.statusCode.should.be.equal(400);
			createUserInvalidCharactersInUsernameResponse.body.error.should.be.equal('invalid_input');
			createUserInvalidCharactersInUsernameResponse.body.errors[0].should.containEql({
				dataPath: '.username',
				keyword: 'pattern',
				message: 'should match pattern "^\\w{4,255}$"',
				params: {
					pattern: '^\\w{4,255}$'
				}
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

		it('should return error when username is not provided', async function () {
			const agent = supertest(app);

			const signInResponse = await agent.post('/api/users/signin')
				.send({
					password: '000000'
				});

			signInResponse.statusCode.should.be.equal(400);
			signInResponse.body.error.should.be.equal('invalid_input');
			signInResponse.body.errors[0].should.containEql({
				keyword: 'required',
				message: 'should have required property \'username\'',
				params: {
					missingProperty: 'username'
				}
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

		it('should return user when client is logged in', async function () {
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

		it('should return null when client is not logged in', async function () {
			const agent = supertest(app);

			const getMeResponse = await agent.get('/api/users/me');

			getMeResponse.statusCode.should.be.equal(403);
			getMeResponse.body.should.be.eql({
				error: 'access_denied'
			});
		});
	});
});
