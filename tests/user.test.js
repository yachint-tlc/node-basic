const chai = require('chai')
const chaiHTTP = require('chai-http')
const { expect } = chai
const TestEngine = require('./TestEngine');
const db = require('../config/database');
const PREFIX = "/api/user";
const DEFAULT_TIMEOUT = 7000;
let server = null;

chai.use(chaiHTTP);

before(async function(){
    this.timeout(25000)
    server = await TestEngine.startServer();
    console.log('Server started successfully for tests');
})

describe('User Profile API', () => {
    beforeEach(async () => {
        await TestEngine.cleanupDatabase('test@example.com')
    }, DEFAULT_TIMEOUT);

    it('should provide user profile if access token is valid', async () => {
        const userData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
            'full_name': 'Test User'
        }

        await chai
            .request(server)
            .post('/api/auth/register')
            .send(userData);

        const loginData = {
            'email': 'test@example.com',
            'password': 'TestPassword',
        }

        const loginResponse = await chai
            .request(server)
            .post('/api/auth/login')
            .send(loginData);

        const accessToken = loginResponse.body.accessToken;

        const response = await chai
            .request(server)
            .get(PREFIX + '/profile')
            .set('x-auth-token', accessToken)
            .send()

        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('email');
        expect(response.body).to.have.property('full_name');
    });

    it('should return response as invalid token if malformed or expired', async () => {
        const response = await chai
            .request(server)
            .get(PREFIX + '/profile')
            .set('x-auth-token', "ABCDEFG")
            .send()

        expect(response).to.have.status(401);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('error').to.be.true;
        expect(response.body).to.have.property('msg').to.equal("Token is not valid");
    })
})