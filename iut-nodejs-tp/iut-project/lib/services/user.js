'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');
const Encrypt = require('@nosakail/iut-encrypt');
const MailService = require('./mailService');

module.exports = class UserService extends Service {

    async create(user){
        const { User } = this.server.models();
        const { MailService } = this.server.services();

        try {
            // Encrypt password before saving
            user.password = Encrypt.sha1(user.password);

            const newUser = await User.query().insertAndFetch(user);

            // Send welcome email
            try {
                await MailService.sendMail(user.email);
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Continue even if email fails
            }

            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw Boom.badImplementation('Failed to create user');
        }
    }

    findAll(){

        const { User } = this.server.models();

        return User.query();
    }

    delete(id){

        const { User } = this.server.models();

        return User.query().deleteById(id);
    }

    async update(id, user){
        const { User } = this.server.models();

        // Check if user exists
        const existingUser = await User.query().findById(id);
        if (!existingUser) {
            throw Boom.notFound('User not found');
        }

        try {
            return await User.query().patchAndFetchById(id, user);
        } catch (error) {
            console.error('Error updating user:', error);
            throw Boom.badImplementation('Failed to update user');
        }
    }

    async login(email, password) {

        const { User } = this.server.models();

        const user = await User.query().findOne({ email });

        if (!user || !Encrypt.compareSha1(password, user.password)) {
            throw Boom.unauthorized('Invalid credentials');
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
                key: 'random_string', // La clé qui est définit dans lib/auth/strategies/jwt.js
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400 // 4 hours
            }
        );

        return token;
    }
}
