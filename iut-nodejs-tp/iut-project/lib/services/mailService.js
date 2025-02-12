'use strict';

const { Service } = require('@hapipal/schmervice');
const nodemailer = require('nodemailer');
require('dotenv').config();



module.exports = class mailService extends Service {
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

    async sendMail(recipient) {
        const message = this.createWelcomeMessage(recipient);
        try {
            const info = await this.transporter.sendMail(message);
            console.log('Message sent: %s', info.messageId);
            return info;
        } catch (err) {
            console.error('Error occurred sending mail: ' + err.message);
            throw err;
        }
    }

}