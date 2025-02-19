'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    /**
     * Crée un nouveau film
     * @param {Object} movie - L'objet film à créer
     * @param {string} movie.title - Le titre du film
     * @param {string} movie.filmmaker - Le réalisateur du film
     * @param {string} movie.description - La description du film
     * @param {Date} movie.realisedAt - La date de réalisation du film
     * @returns {Promise<Object>} - L'objet film créé
     */
    async create(movie) {
        const { Movie, User } = this.server.models();
        const { mailService } = this.server.services();

        try {
            // Création du film dans la base de données
            const newMovie = await Movie.query().insertAndFetch(movie);

            // Récupération de tous les utilisateurs pour la notification
            const users = await User.query();

            // Envoi des notifications par email
            try {
                for (const user of users) {
                    const message = mailService.createAdditionMovieMessage(user.email, movie.title);
                    await mailService.sendMail(message);
                }
            } catch (emailError) {
                console.error('Échec de l\'envoi des notifications:', emailError);
                // Continue même si l'envoi des emails échoue
            }

            return newMovie;
        } catch (error) {
            console.error('Erreur lors de la création du film:', error);
            throw Boom.badImplementation('Échec de la création du film');
        }
    }

    /**
     * Récupère tous les films
     * @returns {Promise<Array>} - La liste de tous les films
     */
    findAll() {
        const { Movie } = this.server.models();
        return Movie.query();
    }

    /**
     * Supprime un film
     * @param {number} id - L'ID du film à supprimer
     * @returns {Promise<number>} - Le nombre de films supprimés (0 ou 1)
     */
    async delete(id) {
        const { Movie } = this.server.models();

        // Vérification de l'existence du film
        const movie = await Movie.query().findById(id);
        if (!movie) {
            throw Boom.notFound('Film non trouvé');
        }

        return Movie.query().deleteById(id);
    }

    /**
     * Met à jour un film
     * @param {number} id - L'ID du film à mettre à jour
     * @param {Object} movie - Les nouvelles données du film
     * @returns {Promise<Object>} - L'objet film mis à jour
     */
    async update(id, movie) {
        const { Movie, User, Favorite } = this.server.models();
        const { mailService } = this.server.services();

        // Vérification de l'existence du film
        const existingMovie = await Movie.query().findById(id);
        if (!existingMovie) {
            throw Boom.notFound('Film non trouvé');
        }

        try {
            // Mise à jour du film
            const updatedMovie = await Movie.query().patchAndFetchById(id, movie);

            // Récupération des utilisateurs qui ont ce film en favori
            const favorites = await Favorite.query()
                .where('movieId', id)
                .select('userId');

            const userIds = favorites.map(f => f.userId);
            const users = await User.query().whereIn('id', userIds);

            // Envoi des notifications par email
            try {
                for (const user of users) {
                    const message = mailService.createUpdateMovieMessage(user.email, updatedMovie.title);
                    await mailService.sendMail(message);
                }
            } catch (emailError) {
                console.error('Échec de l\'envoi des notifications:', emailError);
                // Continue même si l'envoi des emails échoue
            }

            return updatedMovie;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du film:', error);
            throw Boom.badImplementation('Échec de la mise à jour du film');
        }
    }
}