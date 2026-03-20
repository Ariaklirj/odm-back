const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_MAIL,
    pass: process.env.GMAIL_APP_TOKEN,
  },
});

module.exports = transporter;
