'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class FavoriteService extends Service {

    /**
     * Crée un nouveau favori pour un utilisateur
     * @param {Object} favorite - L'objet favori à créer
     * @param {number} favorite.userId - L'ID de l'utilisateur
     * @param {number} favorite.movieId - L'ID du film à ajouter aux favoris
     * @returns {Promise<Object>} - L'objet favori créé
     */
    async create(favorite) {
        const { Favorite, Movie } = this.server.models();
        const { mailService } = this.server.services();

        try {
            // Vérifier si le film existe
            const movie = await Movie.query().findById(favorite.movieId);
            if (!movie) {
                throw Boom.notFound('Film non trouvé');
            }

            // Vérifier si le favori existe déjà
            const existingFavorite = await Favorite.query()
                .where('userId', favorite.userId)
                .where('movieId', favorite.movieId)
                .first();

            if (existingFavorite) {
                throw Boom.conflict('Ce film est déjà dans vos favoris');
            }

            // Créer le favori
            return Favorite.query().insertAndFetch(favorite);

        } catch (error) {
            console.error('Erreur lors de l\'ajout aux favoris:', error);
            throw error;
        }
    }

    /**
     * Récupère tous les favoris d'un utilisateur
     * @param {number} userId - L'ID de l'utilisateur
     * @returns {Promise<Array>} - La liste des films favoris de l'utilisateur
     */
    findAll(userId) {
        const { Favorite } = this.server.models();
        return Favorite.query().where('userId', userId);
    }

    /**
     * Supprime un film des favoris d'un utilisateur
     * @param {number} id - L'ID du favori à supprimer
     * @param {number} userId - L'ID de l'utilisateur
     * @returns {Promise<number>} - Le nombre de favoris supprimés (0 ou 1)
     */
    async delete(id, userId) {
        const { Favorite, Movie } = this.server.models();
        const { mailService } = this.server.services();

        // Vérifier si le favori existe et appartient à l'utilisateur
        const favorite = await Favorite.query()
            .where('id', id)
            .where('userId', userId)
            .first();

        if (!favorite) {
            throw Boom.notFound('Favori non trouvé ou non autorisé');
        }

        try {
            const movie = await Movie.query().findById(favorite.movieId);
            const user = await User.query().findById(userId);

            const message = mailService.createMovieRemovedFromFavoritesMessage(movie, user);
            await mailService.sendMail(message);

            return Favorite.query().deleteById(id);
        } catch (error) {
            console.error('Erreur lors de la suppression du favori:', error);
            throw error;
        }
    }

    /**
     * Met à jour un film des favoris d'un utilisateur
     * @param {number} id - L'ID du favori à mettre à jour
     * @param {Object} favorite - L'objet favori mis à jour
     * @param {number} userId - L'ID de l'utilisateur
     * @returns {Promise<Object>} - L'objet favori mis à jour
     */
    async update(id, favorite, userId) {
        const { Favorite } = this.server.models();

        // Vérifier si le favori existe et appartient à l'utilisateur
        const existingFavorite = await Favorite.query()
            .where('id', id)
            .where('userId', userId)
            .first();

        if (!existingFavorite) {
            throw Boom.notFound('Favori non trouvé ou non autorisé');
        }

        return Favorite.query().patchAndFetchById(id, favorite);
    }
}