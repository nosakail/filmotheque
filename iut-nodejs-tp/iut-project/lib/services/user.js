'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');
const Encrypt = require('@nosakail/iut-encrypt');
const MailService = require('./mailService');

module.exports = class UserService extends Service {

    /**
     * Crée un nouvel utilisateur
     * @param {Object} user - Les données de l'utilisateur à créer
     * @param {string} user.firstName - Le prénom de l'utilisateur
     * @param {string} user.lastName - Le nom de l'utilisateur
     * @param {string} user.email - L'adresse email de l'utilisateur
     * @param {string} user.password - Le mot de passe de l'utilisateur (sera chiffré)
     * @param {string[]} user.roles - Les rôles de l'utilisateur
     * @returns {Promise<Object>} - L'utilisateur créé
     * @throws {Boom.badImplementation} - Si la création échoue
     */
    async create(user){
        const { User } = this.server.models();
        const mailService = await this.server.services().mailService;

        try {
            // Chiffrement du mot de passe avant la sauvegarde
            user.password = Encrypt.sha1(user.password);

            const newUser = await User.query().insertAndFetch(user);

            // Envoi de l'email de bienvenue
            try {
                const welcomeMessage = mailService.createWelcomeMessage(user.email);
                await mailService.sendMail(welcomeMessage);
            } catch (emailError) {
                console.error('Échec de l\'envoi de l\'email de bienvenue:', emailError);
                // Continue même si l'envoi de l'email échoue
            }

            return newUser;
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw Boom.badImplementation('Échec de la création de l\'utilisateur');
        }
    }

    /**
     * Récupère tous les utilisateurs
     * @returns {Promise<Array>} - La liste de tous les utilisateurs
     */
    findAll(){
        const { User } = this.server.models();
        return User.query();
    }

    /**
     * Supprime un utilisateur
     * @param {number} id - L'ID de l'utilisateur à supprimer
     * @returns {Promise<number>} - Le nombre d'utilisateurs supprimés (0 ou 1)
     */
    delete(id){
        const { User } = this.server.models();
        return User.query().deleteById(id);
    }

    /**
     * Met à jour un utilisateur
     * @param {number} id - L'ID de l'utilisateur à mettre à jour
     * @param {Object} user - Les nouvelles données de l'utilisateur
     * @param {string} [user.firstName] - Le nouveau prénom
     * @param {string} [user.lastName] - Le nouveau nom
     * @param {string} [user.email] - La nouvelle adresse email
     * @param {string[]} [user.roles] - Les nouveaux rôles
     * @returns {Promise<Object>} - L'utilisateur mis à jour
     * @throws {Boom.notFound} - Si l'utilisateur n'existe pas
     * @throws {Boom.badImplementation} - Si la mise à jour échoue
     */
    async update(id, user){
        const { User } = this.server.models();

        // Vérification de l'existence de l'utilisateur
        const existingUser = await User.query().findById(id);
        if (!existingUser) {
            throw Boom.notFound('Utilisateur non trouvé');
        }

        try {
            return await User.query().patchAndFetchById(id, user);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            throw Boom.badImplementation('Échec de la mise à jour de l\'utilisateur');
        }
    }

    /**
     * Authentifie un utilisateur et génère un token JWT
     * @param {string} email - L'adresse email de l'utilisateur
     * @param {string} password - Le mot de passe de l'utilisateur
     * @returns {Promise<string>} - Le token JWT généré
     * @throws {Boom.unauthorized} - Si les identifiants sont invalides
     */
    async login(email, password) {
        const { User } = this.server.models();

        const user = await User.query().findOne({ email });

        if (!user || !Encrypt.compareSha1(password, user.password)) {
            throw Boom.unauthorized('Identifiants invalides');
        }

        const token = Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                scope: user.roles
            },
            {
                key: 'random_string', // La clé qui est définie dans lib/auth/strategies/jwt.js
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400 // 4 heures
            }
        );

        return token;
    }
}
