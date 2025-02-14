'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Movie extends Model {

    static get tableName() {

        return 'movie';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().min(2).example('La Planète des Singes').description('Title of the movie'),
            description: Joi.string().min(15).example('A sci-fi film about intelligent apes.').description('Description of the movie'),
            filmmaker: Joi.string().min(3).example('Wes Ball').description('Name of the filmmaker'),
            realisedAt: Joi.date(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
    }

}