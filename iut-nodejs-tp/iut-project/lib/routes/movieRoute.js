'use strict';

const Joi = require('joi')

module.exports = [
    {
        //création
        method: 'post',
        path: '/movie',
        options: {
            tags:['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().min(2).example('La Planète des Singes').description('Titre du film'),
                    description: Joi.string().required().min(15).example('Un film de science-fiction sur des singes intelligents.').description('Description du film'),
                    filmmaker: Joi.string().required().min(3).example('Wes Ball').description('Nom du réalisateur'),
                    realisedAt: Joi.date().required()
                })
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();

            return await movieService.create(request.payload);
        }        
    },

    //récupération
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

    //modification
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
                    title: Joi.string().min(2).example('La Planète des Singes').description('Titre du film'),
                    description: Joi.string().min(15).example('Un film de science-fiction sur des singes intelligents.').description('Description du film'),
                    filmmaker: Joi.string().min(3).example('Wes Ball').description('Nom du réalisateur'),
                    realisedAt: Joi.date()
                }).min(1) 
            }
        },
        handler: async (request, h) => {

            const { movieService } = request.services();

            return await movieService.update(request.params.id, request.payload);
        }
    },

    // suppression
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

    //export des films
    {
        method: 'POST',
        path: '/movies/export-movies',
        options: {
            auth: {
                scope: ['admin']
            },
            handler: async (request, h) => {
                const { movieService } = request.services();
                const { exportService } = request.services();
                const userEmail = request.auth.credentials.email;

                await exportService.sendExportRequest({ userEmail });

                return h.response({ message: 'Export en cours. Vous recevrez le fichier CSV par email.' }).code(202);
            },
            tags: ['api'],
            description: 'Exporter tous les films en CSV (admin uniquement)',
            notes: 'Retourne un fichier CSV contenant tous les films'
        }
    }
];