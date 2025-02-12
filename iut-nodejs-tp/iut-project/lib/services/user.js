'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');
const Encrypt = require('@nosakail/iut-encrypt');

module.exports = class UserService extends Service {

    async create(user){

        const { User } = this.server.models();

        // Encrypt password before saving
        user.password = Encrypt.sha1(user.password);

        return User.query().insertAndFetch(user);
    }

    findAll(){

        const { User } = this.server.models();

        return User.query();
    }

    delete(id){

        const { User } = this.server.models();

        return User.query().deleteById(id);
    }

    update(id, user){

        const { User } = this.server.models();

        return User.query().findById(id).patch(user);
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
