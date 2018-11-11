var nodemailer = require('nodemailer');
var dotenv = require('dotenv').config();

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 587,
    secure:false,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'fao.testbed@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

var sendMail = function(receiver, subject, message) {
    return {
        from: 'fao.testbed@gmail.com',
        to: receiver,
        subject: subject,
        text: message,
    };
};

var sendHtml = function(receiver, subject, message) {
    return {
        from: 'fao.testbed@gmail.com',
        to: receiver,
        subject: subject,
        html: message,
    };
};

exports.sendMessage = function (receiver, subject, message, isHTML) {
    transporter.sendMail (isHTML?
        sendHtml(receiver, subject, message):
        sendMail(receiver, subject, message), (err, info) => {
            if (err) {
                return console.log(err);
            } else {
                return console.log('Email sent: '+ info.response);
            }
        });
};