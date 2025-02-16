'use strict';

const Joi = require('joi')

module.exports = [
    {
        //create
        method: 'post',
        path: '/movie',
        options: {
            auth: false,
            tags:['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().min(2).example('La Planète des Singes').description('Title of the movie'),
                    description: Joi.string().required().min(15).example('A sci-fi film about intelligent apes.').description('Description of the movie'),
                    filmmaker: Joi.string().required().min(3).example('Wes Ball').description('Name of the filmmaker'),
                    realisedAt: Joi.date().required()
                })
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();

            return await movieService.create(request.payload);
        }        
    },

    //get
    {
        method: 'get',
        path: '/movies',
        options: {
            tags:['api'],
            auth: {
                scope: ['user', 'admin']
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();

            return await movieService.findAll();
        }
    },

    //modify
    {
        method: 'patch',
        path: '/movie/{id}',
        options: {
            tags:['api'],
            auth : {
                scope : ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                }),
                payload: Joi.object({
                    title: Joi.string().min(2).example('La Planète des Singes').description('Title of the movie'),
                    description: Joi.string().min(15).example('A sci-fi film about intelligent apes.').description('Description of the movie'),
                    filmmaker: Joi.string().min(3).example('Wes Ball').description('Name of the filmmaker'),
                    realisedAt: Joi.date()
                }).min(1) 
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();

            return await movieService.update(request.params.id, request.payload);
        }
    },

    // delete
    {
        method: 'delete',
        path: '/movie/{id}',
        options: {
            tags:['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                })
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();

            return await movieService.delete(request.params.id);
        }
    },
]