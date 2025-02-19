'use strict';

const amqp = require('amqplib');
const { stringify } = require('csv-stringify');
const nodemailer = require('nodemailer');
const Path = require('path');
require('dotenv').config({ path: Path.join(__dirname, '../../server/.env') });

console.log('Worker: Configuration de la base de données:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Configuration de la base de données
const knexConfig = {
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    }
};

const knex = require('knex')(knexConfig);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

async function processExportRequest(data) {
    try {
        const { userEmail } = JSON.parse(data);
        console.log('Worker: Traitement de la demande d\'export pour:', userEmail);

        // Vérifier que la table existe
        const tables = await knex.raw('SHOW TABLES');
        console.log('Worker: Tables disponibles:', tables[0].map(t => Object.values(t)[0]));

        // Récupérer tous les films depuis la table 'movie'
        console.log('Worker: Récupération des films depuis la table movie');
        const movies = await knex.select('*').from('movie');
        console.log('Worker: Nombre de films trouvés:', movies.length);

        // Convertir en CSV
        const csvContent = await new Promise((resolve, reject) => {
            stringify(movies, {
                header: true,
                columns: ['id', 'title', 'filmmaker', 'description', 'realisedAt', 'createdAt', 'updatedAt']
            }, (err, output) => {
                if (err) reject(err);
                else resolve(output);
            });
        });

        // Envoyer par email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: userEmail,
            subject: 'Export des films - Filmotheque',
            text: 'Veuillez trouver ci-joint l\'export CSV de tous les films.',
            attachments: [{
                filename: 'movies_export.csv',
                content: csvContent
            }]
        });

        console.log(`Worker: Export CSV envoyé avec succès à ${userEmail}`);

    } catch (error) {
        console.error('Worker: Erreur lors du traitement:', error);
        throw error;
    }
}

async function startWorker() {
    try {
        console.log('Worker: Démarrage...');
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'movie_export';

        await channel.assertQueue(queue, { durable: true });
        channel.prefetch(1);

        console.log('Worker: En attente de messages...');

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                await processExportRequest(msg.content.toString());
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error('Worker: Erreur au démarrage:', error);
        process.exit(1);
    }
}

startWorker();
