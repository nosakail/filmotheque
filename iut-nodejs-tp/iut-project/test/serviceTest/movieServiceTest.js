'use strict';

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { it, describe, beforeEach, afterEach } = exports.lab = Lab.script();
const { deployment } = require('../../server');
const Sinon = require('sinon');

describe('MovieService', () => {
    let server;
    let movieService;
    let sandbox;

    beforeEach(async () => {
        server = await deployment();
        movieService = server.services().movieService;
        sandbox = Sinon.createSandbox();

        // Mock MailService
        sandbox.stub(server.services().mailService, 'sendMail').resolves();
        sandbox.stub(server.services().mailService, 'createAdditionMovieMessage').returns('New movie notification');
        sandbox.stub(server.services().mailService, 'createUpdateMovieMessage').returns('Movie update notification');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new movie and notify users', async () => {
        const movie = {
            title: 'Test Movie',
            filmmaker: 'Test Director',
            description: 'Test Description',
            realisedAt: new Date('2024-01-01')
        };

        const users = [
            { id: 1, email: 'user1@test.com' },
            { id: 2, email: 'user2@test.com' }
        ];

        const insertAndFetchStub = sandbox.stub().resolves(movie);
        sandbox.stub(server.models().Movie, 'query').returns({
            insertAndFetch: insertAndFetchStub
        });

        sandbox.stub(server.models().User, 'query').resolves(users);

        const result = await movieService.create(movie);

        expect(result).to.equal(movie);
        expect(insertAndFetchStub.calledOnce).to.be.true();
        expect(insertAndFetchStub.calledWith(movie)).to.be.true();
        expect(server.services().mailService.sendMail.callCount).to.equal(users.length);
        expect(server.services().mailService.createAdditionMovieMessage.callCount).to.equal(users.length);
    });

    it('should find all movies', async () => {
        const movies = [
            { id: 1, title: 'Movie 1', filmmaker: 'Director 1' },
            { id: 2, title: 'Movie 2', filmmaker: 'Director 2' }
        ];

        sandbox.stub(server.models().Movie, 'query').resolves(movies);

        const result = await movieService.findAll();

        expect(result).to.equal(movies);
    });

    it('should delete an existing movie', async () => {
        const movieId = 1;
        const movie = { id: movieId, title: 'Movie to Delete' };

        const findByIdStub = sandbox.stub().resolves(movie);
        const deleteByIdStub = sandbox.stub().resolves(1);
        sandbox.stub(server.models().Movie, 'query').returns({
            findById: findByIdStub,
            deleteById: deleteByIdStub
        });

        await movieService.delete(movieId);

        expect(findByIdStub.calledOnce).to.be.true();
        expect(findByIdStub.calledWith(movieId)).to.be.true();
        expect(deleteByIdStub.calledOnce).to.be.true();
        expect(deleteByIdStub.calledWith(movieId)).to.be.true();
    });

    it('should throw not found error when deleting non-existent movie', async () => {
        const movieId = 999;

        sandbox.stub(server.models().Movie, 'query').returns({
            findById: sandbox.stub().resolves(null),
            deleteById: sandbox.stub().resolves(0)
        });

        await expect(movieService.delete(movieId)).to.reject('Film non trouvé');
    });

    it('should update an existing movie and notify users with favorites', async () => {
        const movieId = 1;
        const existingMovie = { 
            id: movieId, 
            title: 'Original Movie',
            filmmaker: 'Original Director'
        };
        const updatedMovie = { 
            id: movieId, 
            title: 'Updated Movie',
            filmmaker: 'Updated Director'
        };
        const favorites = [
            { userId: 1 },
            { userId: 2 }
        ];
        const users = [
            { id: 1, email: 'user1@test.com' },
            { id: 2, email: 'user2@test.com' }
        ];

        const findByIdStub = sandbox.stub().resolves(existingMovie);
        const patchAndFetchStub = sandbox.stub().resolves(updatedMovie);
        sandbox.stub(server.models().Movie, 'query').returns({
            findById: findByIdStub,
            patchAndFetchById: patchAndFetchStub
        });

        sandbox.stub(server.models().Favorite, 'query').returns({
            where: sandbox.stub().returns({
                select: sandbox.stub().resolves(favorites)
            })
        });

        sandbox.stub(server.models().User, 'query').returns({
            whereIn: sandbox.stub().resolves(users)
        });

        const result = await movieService.update(movieId, updatedMovie);

        expect(result).to.equal(updatedMovie);
        expect(findByIdStub.calledOnce).to.be.true();
        expect(patchAndFetchStub.calledOnce).to.be.true();
        expect(patchAndFetchStub.calledWith(movieId, updatedMovie)).to.be.true();
        expect(server.services().mailService.sendMail.callCount).to.equal(users.length);
        expect(server.services().mailService.createUpdateMovieMessage.callCount).to.equal(users.length);
    });

    it('should throw not found error when updating non-existent movie', async () => {
        const movieId = 999;
        const updatedMovie = { title: 'Updated Movie' };

        sandbox.stub(server.models().Movie, 'query').returns({
            findById: sandbox.stub().resolves(null)
        });

        await expect(movieService.update(movieId, updatedMovie)).to.reject('Film non trouvé');
    });
});