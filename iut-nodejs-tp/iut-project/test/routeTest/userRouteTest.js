'use strict';

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { it, describe, beforeEach } = exports.lab = Lab.script();
const { deployment } = require('../../server');

describe('User Routes', () => {

    let server;

    beforeEach(async () => {
        server = await deployment();
    });

    it('POST /user should create a new user', async () => {
        const options = {
            method: 'POST',
            url: '/user',
            payload: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.fr',
                password: 'password',
                username: 'johndoe'
            }
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.be.an.object();
        expect(response.result.firstName).to.equal('John');
        expect(response.result.lastName).to.equal('Doe');
        expect(response.result.email).to.equal('john@doe.fr');
    });

    it('GET /users should return all users', async () => {
        const options = {
            method: 'GET',
            url: '/users',
            auth: {
                strategy: 'jwt',
                credentials: { id: 1, scope: ['admin'] }
            }
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.be.an.array();
    });

    

    it('DELETE /user/{id} should delete a user', async () => {
        
        const createUserOptions = {
            method: 'POST',
            url: '/user',
            payload: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.fr',
                password: 'password',
                username: 'johndoe'
            }
        };
        const createUserResponse = await server.inject(createUserOptions);
        const userId = createUserResponse.result.id;
    
        const options = {
            method: 'DELETE',
            url: `/user/${userId}`,
            auth: {
                strategy: 'jwt',
                credentials: { id: 1, scope: ['admin'] }
            }
        };
    
        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.be.a.number();
        expect(response.result).to.equal(1); 
    });

});