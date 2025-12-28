const nodemailer = require('nodemailer');
const path = require('path');
const Logger = require('./logger');
const logger = new Logger();
const Email = require('email-templates');

class GmailMailer {
    constructor() {

    }
    async sendMail(from, to, subject, tplName, html) {
        try {

            const templateDir = path.join(__dirname, "../views/", 'email-templates', tplName + '/html')
            const email = new Email({
                views: {
                    root: templateDir,
                    options: {
                        extension: 'ejs'
                    }
                }
            });

            const getMailBody = await email.render(templateDir, html);
            //Setup the transporter
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SITE_EMAIL,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
            //Setup the mailOptions
            let mailOptions = {
                from,
                to,
                subject,
                html: getMailBody
            };
            return await transporter.sendMail(mailOptions);
        } catch (err) {
            throw err;
        }
    }

}

module.exports = new GmailMailer();