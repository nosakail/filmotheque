'use strict';

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { it, describe, beforeEach } = exports.lab = Lab.script();
const { deployment } = require('../../server');

describe('Movie Routes', () => {

    let server;

    beforeEach(async () => {
        server = await deployment();
    });

    

    it('GET /movies should return all movies', { timeout: 5000 }, async () => {
        const options = {
            method: 'GET',
            url: '/movies',
            auth: {
                strategy: 'jwt',
                credentials: { id: 1, scope: ['user', 'admin'] }
            }
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.be.an.array();
    });


    it('POST /movies/export-movies should export movies', { timeout: 5000 }, async () => {
        const options = {
            method: 'POST',
            url: '/movies/export-movies',
            auth: {
                strategy: 'jwt',
                credentials: { id: 1, scope: ['admin'], email: 'admin@example.com' }
            }
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(202);
        expect(response.result).to.be.an.object();
        expect(response.result.message).to.equal('Export en cours. Vous recevrez le fichier CSV par email.');
    });
});