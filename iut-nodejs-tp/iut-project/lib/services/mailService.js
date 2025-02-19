'use strict';

const { Service } = require('@hapipal/schmervice');
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = class MailService extends Service {
    constructor() {
        super();

        // Create a SMTP transporter object
        this.transporter = this._createTransporter();
    }

    /**
     * Crée un message de bienvenue
     * @param {string} recipient - L'adresse email du destinataire
     * @returns {Object} - L'objet message formaté pour l'envoi d'email
     */
    createWelcomeMessage(recipient) {
        return {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'Welcome to Our Service!',
            text: 'Hello and welcome to our service. We are excited to have you on board.',
            html: '<p><b>Hello</b> and welcome to our service. We are excited to have you on board.</p>'
        };
    }

    /**
     * Crée un message pour notifier l'ajout d'un film
     * @param {string} recipient - L'adresse email du destinataire
     * @param {string} movieName - Le nom du film ajouté
     * @returns {Object} - L'objet message formaté pour l'envoi d'email
     */
    createAdditionMovieMessage(recipient, movieName) {
        return {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'New movie is available',
            text: `Hello we inform you that ${movieName} is Available`,
            html: `<p><b>Hello</b> we inform you that ${movieName} is Available</p>`
        };
    }

    /**
     * Crée un message pour notifier la mise à jour d'un film
     * @param {string} recipient - L'adresse email du destinataire
     * @param {string} movieName - Le nom du film mis à jour
     * @returns {Object} - L'objet message formaté pour l'envoi d'email
     */
    createUpdateMovieMessage(recipient, movieName) {
        return {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'One of your favorites was updated',
            text: `Hello we inform you that ${movieName} was updated`,
            html: `<p><b>Hello</b> we inform you that ${movieName} was updated</p>`
        };
    }

    /**
     * Crée un transporteur SMTP pour l'envoi d'emails
     * @private
     * @returns {Object} - Le transporteur SMTP configuré
     */
    _createTransporter() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    /**
     * Envoie un email
     * @param {Object} message - Le message à envoyer
     * @param {string} message.from - L'adresse email de l'expéditeur
     * @param {string} message.to - L'adresse email du destinataire
     * @param {string} message.subject - Le sujet de l'email
     * @param {string} message.text - Le contenu texte de l'email
     * @param {string} message.html - Le contenu HTML de l'email
     * @returns {Promise<Object>} - Le résultat de l'envoi de l'email
     */
    async sendMail(message) {
        try {
            console.log('Attempting to send email to:', message.to);
            const info = await this.transporter.sendMail(message);
            console.log('Message sent: %s', info.messageId);
            return info;
        } catch (err) {
            console.error('Error occurred sending mail:', err);
            // Ne pas propager l'erreur pour ne pas bloquer les autres opérations
            return null;
        }
    }
};