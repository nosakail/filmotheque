'use strict';

const Joi = require('joi')

module.exports = [

    //add favorite
    {
        method: 'post',
        path: '/favorites',
        options: {
            tags:['api'],
            auth: {
                scope: ['user']
            },
            validate: {
                payload: Joi.object({
                    movieId: Joi.number().integer().greater(0).required().description('ID of the movie')
                })
            }
        },
        handler: async (request, h) => {

            const { favoriteService } = request.services();
            const userId = request.auth.credentials.id;
            return await favoriteService.create({ userId, ...request.payload });
        }
    },


    //get favorites
    {
        method: 'get',
        path: '/favorites',
        options: {
            tags:['api'],
            auth: {
                scope: ['user']
            }
        },
        handler: async (request, h) => {

            const { favoriteService } = request.services();
            const userId = request.auth.credentials.id;
            return await favoriteService.findAll(userId);
        }
    },


    //delete favorite
    {
            method: 'delete',
            path: '/favorites/{id}',
            options: {
                tags:['api'],
                auth: {
                    scope: ['user']
                },
                validate: {
                    params: Joi.object({
                        id: Joi.number().integer().required().description('ID of the favorite to delete')
                    })
                }
            },
            handler: async (request, h) => {
    
                const { favoriteService } = request.services();
                const userId = request.auth.credentials.id;
                return await favoriteService.delete(request.params.id, userId);
            }
        }
]
