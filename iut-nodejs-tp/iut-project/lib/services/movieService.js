'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    async create(movie) {
        const { Movie, User } = this.server.models();
        const { mailService } = this.server.services();

        // Check if movie already exists with same title and filmmaker
        const existingMovie = await Movie.query()
            .where('title', movie.title)
            .where('filmmaker', movie.filmmaker)
            .first();

        if (existingMovie) {
            throw Boom.conflict('A movie with this title and filmmaker already exists');
        }

        try {
            // Insert the new movie
            const newMovie = await Movie.query().insertAndFetch(movie);

            // Get all users with their emails in a single query
            const users = await User.query().select('email');

            // Send new movie email to all users
            const emailPromises = users.map(user => {
                const message = mailService.createAdditionMovieMessage(user.email, newMovie.title);
                return mailService.sendMail(message).catch(error => {
                    console.error(`Failed to send new movie email to ${user.email}:`, error);
                    // Continue even if email fails
                });
            });

            // Send all emails in parallel
            await Promise.all(emailPromises);

            return newMovie;

        } catch (error) {
            console.error('Error creating movie:', error);
            throw Boom.badImplementation('Failed to create movie');
        }
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
        const { Movie, User, Favorite } = this.server.models();
        const { mailService } = this.server.services();

        const existingMovie = await Movie.query().findById(id);
        if (!existingMovie) {
            throw Boom.notFound('Movie not found');
        }

        // If title or filmmaker is being updated, check for duplicates
        if ((movie.title && movie.title !== existingMovie.title) || 
            (movie.filmmaker && movie.filmmaker !== existingMovie.filmmaker)) {
            
            const duplicateMovie = await Movie.query()
                .where('title', movie.title || existingMovie.title)
                .where('filmmaker', movie.filmmaker || existingMovie.filmmaker)
                .whereNot('id', id)
                .first();

            if (duplicateMovie) {
                throw Boom.conflict('A movie with this title and filmmaker already exists');
            }
        }

        try {
            // Update the movie
            const updatedMovie = await Movie.query().patchAndFetchById(id, movie);

            // Find users who have this movie as favorite
            const favorites = await Favorite.query()
                .where('movieId', id)
                .select('userId');

            if (favorites.length > 0) {
                // Get emails of users who have this movie as favorite
                const userIds = favorites.map(f => f.userId);
                const users = await User.query()
                    .whereIn('id', userIds)
                    .select('email');

                // Send update movie email to users who have this movie as favorite
                const emailPromises = users.map(user => {
                    const message = mailService.createUpdateMovieMessage(user.email, updatedMovie.title);
                    return mailService.sendMail(message).catch(error => {
                        console.error(`Failed to send update movie email to ${user.email}:`, error);
                        // Continue even if email fails
                    });
                });

                // Send all emails in parallel
                await Promise.all(emailPromises);
            }

            return updatedMovie;
        } catch (error) {
            console.error('Error updating movie:', error);
            throw Boom.badImplementation('Failed to update movie');
        }
    }
};