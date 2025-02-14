'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    create(movie) {
        const { Movie } = this.server.models();
        return Movie.query().insertAndFetch(movie);
    }

    findAll() {
        const { Movie } = this.server.models();
        return Movie.query();
    }

    async delete(id) {
        const { Movie } = this.server.models();
        
        const movie = await Movie.query().findById(id);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        return Movie.query().deleteById(id);
    }

    async update(id, movie) {
        const { Movie } = this.server.models();

        const existingMovie = await Movie.query().findById(id);
        if (!existingMovie) {
            throw Boom.notFound('Movie not found');
        }

        return Movie.query().patchAndFetchById(id, movie);
    }
}