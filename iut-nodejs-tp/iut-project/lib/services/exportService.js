'use strict';

const { Service } = require('@hapipal/schmervice');
const amqp = require('amqplib');

module.exports = class ExportService extends Service {
    constructor() {
        super();
    }

    /**
     * Envoie une demande d'export de films via RabbitMQ
     * @param {string} data - Les données à envoyer pour l'export
     * @returns {Promise<void>} - Ne retourne rien, mais envoie un message à RabbitMQ
     */
    async sendExportRequest(data) {
        try {
            const connection = await amqp.connect('amqp://localhost');
            const channel = await connection.createChannel();
            await channel.assertQueue('movie_export', { durable: true });
            
            await channel.sendToQueue('movie_export', Buffer.from(JSON.stringify(data)), {
                persistent: true
            });

            await channel.close();
            await connection.close();
        } catch (error) {
            console.error('Error with RabbitMQ:', error);
            throw error;
        }
    }
};
