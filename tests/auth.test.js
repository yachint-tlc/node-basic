const chai = require('chai')
const chaiHTTP = require('chai-http')
const { expect } = chai
const TestEngine = require('./TestEngine');
const db = require('../config/database');
const PREFIX = "/api/auth";
const DEFAULT_TIMEOUT = 7000;
let server = null;

chai.use(chaiHTTP);

before(async function(){
    this.timeout(25000)
    server = await TestEngine.startServer();
    console.log('Server started successfully for tests');
})

describe('Register API', () => {
    beforeEach(async () => {
        await TestEngine.cleanupDatabase('test@example.com');
    }, DEFAULT_TIMEOUT);

    // CASE 1
    it('should register a new user with valid data', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        const response = await chai.request(server).post(PREFIX+"/register").send(userData);

        expect(response).to.have.status(201);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error').to.be.false;
        expect(response.body).to.have.property('msg').to.equal('User created successfully!');
        expect(response.body).to.have.property('data');

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [userData.email]
        );

        expect(result.rows).to.have.lengthOf(1);
    }, DEFAULT_TIMEOUT);

    // CASE 2
    it('should return 400 if email already exists', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        await chai
            .request(server)
            .post(PREFIX + '/register')
            .send(userData);

        const response = await chai
            .request(server)
            .post(PREFIX + '/register')
            .send(userData);

        expect(response).to.have.status(400);
        expect(response.body).to.have.property('message').to.equal('User already exists');
    }, DEFAULT_TIMEOUT);

    // CASE 3
    it('should return 400 if fields are missing or incorrect', async () => {
        const userData = {
            'emai': 'test@example.com',
            'pasword': 'TestPassword',
        }

        const response = await chai.request(server).post(PREFIX + '/register').send(userData);

        expect(response).to.have.status(400);
    }, DEFAULT_TIMEOUT)
})

describe('Login API', () => {
    beforeEach(async () => {
        await TestEngine.cleanupDatabase('test@example.com')
    }, DEFAULT_TIMEOUT);

    // CASE 1
    it('should login successfully after signup', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        await chai
            .request(server)
            .post(PREFIX + '/register')
            .send(userData);

        const loginData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
        }

        const response = await chai
            .request(server)
            .post(PREFIX + '/login')
            .send(loginData);

        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('accessToken');
        expect(response.body).to.have.property('refreshToken');

        const userReponse = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [userData.email]
        );

        expect(userReponse.rows).to.have.lengthOf(1);

        const id = userReponse.rows[0].id;

        const tokenResponse = await db.query(
            "SELECT * FROM refresh_tokens WHERE user_id = $1",
            [id]
        );

        expect(tokenResponse.rows).to.have.lengthOf(1);

    }, DEFAULT_TIMEOUT)

    // CASE 2
    it('should return invalid credentials if user or password is wrong', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        await chai
            .request(server)
            .post(PREFIX + '/register')
            .send(userData);

        const loginData = {
            'email': 'test@example.com',
            'password': 'TestPassword123',
        }

        const response = await chai
            .request(server)
            .post(PREFIX + '/login')
            .send(loginData);

        expect(response).to.have.status(401);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error').to.be.true;
        expect(response.body).to.have.property('msg').to.equal("Invalid credentials")
    }, DEFAULT_TIMEOUT)

    // CASE 3
    it('should return 400 if fields are missing or incorrect', async () => {
        const userData = {
            'emai': 'test@example.com',
            'pasword': 'TestPassword',
        }

        const response = await chai
            .request(server)
            .post(PREFIX + '/login')
            .send(userData);

        expect(response).to.have.status(400);
    }, DEFAULT_TIMEOUT)
});

describe('Logout API', () => {
    beforeEach(async () => {
        await TestEngine.cleanupDatabase('test@example.com')
    }, DEFAULT_TIMEOUT);

    // CASE 1:
    it('should delete the refresh token', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        await chai
            .request(server)
            .post(PREFIX + '/register')
            .send(userData);

        const loginData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
        }

        const loginResponse = await chai
            .request(server)
            .post(PREFIX + '/login')
            .send(loginData);

        const refreshToken = loginResponse.body.refreshToken;

        const response = await chai
            .request(server)
            .post(PREFIX + '/logout')
            .send({ refreshToken: refreshToken })

        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error').to.be.false;
        expect(response.body).to.have.property('msg').to.equal("Logged out successfully")
    }, DEFAULT_TIMEOUT);

    // CASE 2
    it('should return 400 if fields are missing or incorrect', async () => {
        const userData = {
            'refresToken': 'ABC',
        }

        const response = await chai
            .request(server)
            .post(PREFIX + '/logout')
            .send(userData);

        expect(response).to.have.status(400);
    }, DEFAULT_TIMEOUT)
})

describe('Refresh Token API', async () => {
    beforeEach(async () => {
        await TestEngine.cleanupDatabase('test@example.com')
    }, DEFAULT_TIMEOUT); 

    // CASE 1
    it('should return a new access and refresh token and delete old refresh token', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        await chai
            .request(server)
            .post(PREFIX + '/register')
            .send(userData);

        const loginData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
        }

        const loginResponse = await chai
            .request(server)
            .post(PREFIX + '/login')
            .send(loginData);

        const refreshToken = loginResponse.body.refreshToken;

        const response = await chai
            .request(server)
            .post(PREFIX + '/refresh-token')
            .send({ refreshToken: refreshToken });

        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('accessToken');
        expect(response.body).to.have.property('refreshToken');

        const dbResponse = await db.query(
            'SELECT * FROM refresh_tokens WHERE token = $1',
            [refreshToken]
        );

        expect(dbResponse.rows).to.have.lengthOf(0);
    }, DEFAULT_TIMEOUT)

    // CASE 2
    it('should return error if refresh token does not exist', async () => {
        const response = await chai
            .request(server)
            .post(PREFIX + '/refresh-token')
            .send({ refreshToken: "XYZ" });

        expect(response).to.have.status(401);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('err').to.be.true;
        expect(response.body).to.have.property('msg').to.equal("Invalid or expired refresh token!")
    })

    // CASE 3
    it('should return 400 if fields are missing or incorrect', async () => {
        const response = await chai
            .request(server)
            .post(PREFIX + '/refresh-token')
            .send({ refresToken: "XYZ" });

        expect(response).to.have.status(400);
    }, DEFAULT_TIMEOUT)
})

describe('Logout all Devices API', () => {
    beforeEach(async () => {
        await TestEngine.cleanupDatabase('test@example.com')
    }, DEFAULT_TIMEOUT);

    // CASE 1:
    it('should delete the refresh token', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        await chai
            .request(server)
            .post(PREFIX + '/register')
            .send(userData);

        const loginData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
        }

        const loginResponse = await chai
            .request(server)
            .post(PREFIX + '/login')
            .send(loginData);

        const accessToken = loginResponse.body.accessToken;
        const refreshToken = loginResponse.body.refreshToken;

        const response = await chai
            .request(server)
            .post(PREFIX + '/logout-all')
            .set('x-auth-token', accessToken)
            .send({ refreshToken: refreshToken })

        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error').to.be.false;
        expect(response.body).to.have.property('msg').to.equal("Logged out of all devices successfully")
    }, DEFAULT_TIMEOUT);

})