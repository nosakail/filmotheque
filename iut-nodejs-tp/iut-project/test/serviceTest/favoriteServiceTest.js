'use strict';

const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const { it, describe, beforeEach, afterEach } = exports.lab = Lab.script();
const { deployment } = require('../../server');
const Sinon = require('sinon');

describe('FavoriteService', () => {
    let server;
    let favoriteService;
    let sandbox;

    beforeEach(async () => {
        server = await deployment();
        favoriteService = server.services().favoriteService;
        sandbox = Sinon.createSandbox();

        // Mock MailService
        sandbox.stub(server.services().mailService, 'sendMail').resolves();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new favorite', async () => {
        const movieId = 1;
        const userId = 1;
        const favorite = { userId, movieId };
        const movie = { id: movieId, title: 'Test Movie' };

        // Mock Movie.query().findById()
        sandbox.stub(server.models().Movie, 'query').returns({
            findById: sandbox.stub().resolves(movie)
        });

        // Mock Favorite.query() for checking existing favorite
        const whereStub = sandbox.stub();
        whereStub.withArgs('userId', userId).returns({
            where: sandbox.stub().withArgs('movieId', movieId).returns({
                first: sandbox.stub().resolves(null)
            })
        });

        const insertAndFetchStub = sandbox.stub().resolves(favorite);
        sandbox.stub(server.models().Favorite, 'query').returns({
            where: whereStub,
            insertAndFetch: insertAndFetchStub
        });

        const result = await favoriteService.create(favorite);

        expect(result).to.equal(favorite);
        expect(insertAndFetchStub.calledOnce).to.be.true();
        expect(insertAndFetchStub.calledWith(favorite)).to.be.true();
    });

    it('should throw error when creating duplicate favorite', async () => {
        const movieId = 1;
        const userId = 1;
        const favorite = { userId, movieId };
        const movie = { id: movieId, title: 'Test Movie' };
        const existingFavorite = { ...favorite, id: 1 };

        // Mock Movie.query().findById()
        sandbox.stub(server.models().Movie, 'query').returns({
            findById: sandbox.stub().resolves(movie)
        });

        // Mock Favorite.query() to return existing favorite
        const whereStub = sandbox.stub();
        whereStub.withArgs('userId', userId).returns({
            where: sandbox.stub().withArgs('movieId', movieId).returns({
                first: sandbox.stub().resolves(existingFavorite)
            })
        });

        sandbox.stub(server.models().Favorite, 'query').returns({
            where: whereStub
        });

        await expect(favoriteService.create(favorite)).to.reject('Ce film est déjà dans vos favoris');
    });

    it('should throw error when movie does not exist', async () => {
        const movieId = 999;
        const userId = 1;
        const favorite = { userId, movieId };

        // Mock Movie.query().findById() to return null
        sandbox.stub(server.models().Movie, 'query').returns({
            findById: sandbox.stub().resolves(null)
        });

        await expect(favoriteService.create(favorite)).to.reject('Film non trouvé');
    });

    it('should find all favorites for a user', async () => {
        const userId = 1;
        const favorites = [
            { id: 1, userId, movieId: 1 },
            { id: 2, userId, movieId: 2 }
        ];

        const whereStub = sandbox.stub().resolves(favorites);
        sandbox.stub(server.models().Favorite, 'query').returns({
            where: whereStub
        });

        const result = await favoriteService.findAll(userId);

        expect(result).to.equal(favorites);
        expect(whereStub.calledWith('userId', userId)).to.be.true();
    });

    it('should delete a favorite', async () => {
        const id = 1;
        const userId = 1;
        const favorite = { id, userId, movieId: 1 };
        const movie = { id: 1, title: 'Test Movie' };
        const user = { id: userId, email: 'test@test.com' };

        // Mock Favorite.query() for finding existing favorite
        const whereStub = sandbox.stub();
        whereStub.withArgs('id', id).returns({
            where: sandbox.stub().withArgs('userId', userId).returns({
                first: sandbox.stub().resolves(favorite)
            })
        });

        const deleteByIdStub = sandbox.stub().resolves(1);
        sandbox.stub(server.models().Favorite, 'query').returns({
            where: whereStub,
            deleteById: deleteByIdStub
        });

        // Mock Movie and User queries
        sandbox.stub(server.models().Movie, 'query').returns({
            findById: sandbox.stub().resolves(movie)
        });

        sandbox.stub(server.models().User, 'query').returns({
            findById: sandbox.stub().resolves(user)
        });

        await favoriteService.delete(id, userId);

        expect(deleteByIdStub.calledOnce).to.be.true();
        expect(deleteByIdStub.calledWith(id)).to.be.true();
        expect(server.services().mailService.sendMail.calledOnce).to.be.true();
    });

    it('should throw error when deleting non-existent favorite', async () => {
        const id = 999;
        const userId = 1;

        // Mock Favorite.query() to return null
        const whereStub = sandbox.stub();
        whereStub.withArgs('id', id).returns({
            where: sandbox.stub().withArgs('userId', userId).returns({
                first: sandbox.stub().resolves(null)
            })
        });

        sandbox.stub(server.models().Favorite, 'query').returns({
            where: whereStub
        });

        await expect(favoriteService.delete(id, userId)).to.reject('Favori non trouvé ou non autorisé');
    });

    it('should update a favorite', async () => {
        const id = 1;
        const userId = 1;
        const favorite = { id, userId, movieId: 2 }; // Updated movieId
        const existingFavorite = { id, userId, movieId: 1 };

        // Mock Favorite.query() for finding and updating
        const whereStub = sandbox.stub();
        whereStub.withArgs('id', id).returns({
            where: sandbox.stub().withArgs('userId', userId).returns({
                first: sandbox.stub().resolves(existingFavorite)
            })
        });

        const patchAndFetchByIdStub = sandbox.stub().resolves(favorite);
        sandbox.stub(server.models().Favorite, 'query').returns({
            where: whereStub,
            patchAndFetchById: patchAndFetchByIdStub
        });

        const result = await favoriteService.update(id, favorite, userId);

        expect(result).to.equal(favorite);
        expect(patchAndFetchByIdStub.calledOnce).to.be.true();
        expect(patchAndFetchByIdStub.calledWith(id, favorite)).to.be.true();
    });

    it('should throw error when updating non-existent favorite', async () => {
        const id = 999;
        const userId = 1;
        const favorite = { movieId: 2 };

        // Mock Favorite.query() to return null
        const whereStub = sandbox.stub();
        whereStub.withArgs('id', id).returns({
            where: sandbox.stub().withArgs('userId', userId).returns({
                first: sandbox.stub().resolves(null)
            })
        });

        sandbox.stub(server.models().Favorite, 'query').returns({
            where: whereStub
        });

        await expect(favoriteService.update(id, favorite, userId)).to.reject('Favori non trouvé ou non autorisé');
    });
});