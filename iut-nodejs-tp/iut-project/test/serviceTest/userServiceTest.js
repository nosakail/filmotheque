'use strict';

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { it, describe, beforeEach, afterEach } = exports.lab = Lab.script();
const { deployment } = require('../../server'); 
const Sinon = require('sinon');

describe('UserService', () => {

    let server;
    let userService;
    let sandbox;

    beforeEach(async () => {
        server = await deployment(); 
        userService = server.services().userService;
        sandbox = Sinon.createSandbox();

        // Mock  MailService
        sandbox.stub(server.services().mailService, 'sendMail').resolves();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new user', async () => {
        const user = { firstName: 'John', lastName: 'Doe', email: 'john@doe.fr', password: 'password', username: 'jdoe' };

        // Mock User model avec proper chaining
        const insertAndFetchStub = sandbox.stub().resolves(user);
        const queryStub = sandbox.stub(server.models().User, 'query').returns({
            insertAndFetch: insertAndFetchStub
        });

        const result = await userService.create(user);

        expect(result).to.equal(user);
        expect(insertAndFetchStub.calledOnce).to.be.true();
        expect(server.services().mailService.sendMail.calledOnce).to.be.true();
    });

    it('should find all users', async () => {
        const users = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.fr', username: 'jdoe' },
            { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@doe.fr', username: 'janedoe' }
        ];

        sandbox.stub(server.models().User, 'query').resolves(users);

        const result = await userService.findAll();

        expect(result).to.equal(users);
    });

    it('should delete a user', async () => {
        const userId = 1;
        const deleteStub = sandbox.stub().resolves(1); // returns number of deleted rows
        const queryStub = sandbox.stub(server.models().User, 'query').returns({
            deleteById: deleteStub
        });

        await userService.delete(userId);

        expect(deleteStub.calledOnce).to.be.true();
        expect(deleteStub.calledWith(userId)).to.be.true();
    });

    it('should update a user', async () => {
        const userId = 1;
        const existingUser = { 
            id: userId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@doe.fr',
            username: 'jdoe'
        };
        const updatedUser = { 
            id: userId,
            firstName: 'John Updated',
            lastName: 'Doe Updated',
            email: 'john.updated@doe.fr',
            username: 'jdoeupdated'
        };

        const findByIdStub = sandbox.stub().resolves(existingUser);
        const patchAndFetchStub = sandbox.stub().resolves(updatedUser);
        sandbox.stub(server.models().User, 'query').returns({
            findById: findByIdStub,
            patchAndFetchById: patchAndFetchStub
        });

        const result = await userService.update(userId, updatedUser);

        expect(result).to.equal(updatedUser);
        expect(findByIdStub.calledOnce).to.be.true();
        expect(findByIdStub.calledWith(userId)).to.be.true();
        expect(patchAndFetchStub.calledOnce).to.be.true();
        expect(patchAndFetchStub.calledWith(userId, updatedUser)).to.be.true();
    });
});