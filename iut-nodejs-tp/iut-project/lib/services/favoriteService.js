'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class FavoriteService extends Service {

    async create(favorite) {
        const { Favorite, Movie } = this.server.models();

        // Check if movie exists
        const movie = await Movie.query().findById(favorite.movieId);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        // Check if favorite already exists
        const existingFavorite = await Favorite.query()
            .where('userId', favorite.userId)
            .where('movieId', favorite.movieId)
            .first();
        
        if (existingFavorite) {
            throw Boom.conflict('Movie is already in favorites');
        }

        // Create favorite
        return Favorite.query().insertAndFetch(favorite);
    }

    findAll(userId) {
        const { Favorite } = this.server.models();
        return Favorite.query().where('userId', userId);
    }

    async delete(id, userId) {
        const { Favorite } = this.server.models();

        // Check if favorite exists and belongs to user
        const favorite = await Favorite.query()
            .where('id', id)
            .where('userId', userId)
            .first();

        if (!favorite) {
            throw Boom.notFound('Favorite not found or does not belong to user');
        }

        return Favorite.query().deleteById(id);
    }

    async update(id, favorite, userId) {
        const { Favorite } = this.server.models();

        // Check if favorite exists and belongs to user
        const existingFavorite = await Favorite.query()
            .where('id', id)
            .where('userId', userId)
            .first();

        if (!existingFavorite) {
            throw Boom.notFound('Favorite not found or does not belong to user');
        }

        return Favorite.query().patchAndFetchById(id, favorite);
    }
}