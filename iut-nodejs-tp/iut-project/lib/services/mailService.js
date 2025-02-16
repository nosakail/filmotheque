'use strict';

const { Service } = require('@hapipal/schmervice');
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = class MailService extends Service {
    constructor() {
        super();

        // Create a SMTP transporter object
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    createWelcomeMessage(recipient) {
        return {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'Welcome to Our Service!',
            text: 'Hello and welcome to our service. We are excited to have you on board.',
            html: '<p><b>Hello</b> and welcome to our service. We are excited to have you on board.</p>'
        };
    }

    createAdditionMovieMessage(recipient, movieName) {
        return {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'New movie is available',
            text: `Hello we inform you that ${movieName} is Available`,
            html: `<p><b>Hello</b> we inform you that ${movieName} is Available</p>`
        };
    }

    createUpdateMovieMessage(recipient, movieName) {
        return {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'One of your favorites was updated',
            text: `Hello we inform you that ${movieName} was updated`,
            html: `<p><b>Hello</b> we inform you that ${movieName} was updated</p>`
        };
    }

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