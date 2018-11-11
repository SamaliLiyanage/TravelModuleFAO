var nodemailer = require('nodemailer');
var dotenv = require('dotenv').config();

var transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    port: 587,
    secure:false,
    auth: {
        user: 'fao.testbed@gmail.com',
        pass: 'Rand0mm4il!!!'
    }
});

var sendMail = function(receiver, subject, message) {
    console.log("Preparing normal mail ....");
    return {
        from: 'fao.testbed@gmail.com',
        to: receiver,
        subject: subject,
        text: message,
    };
};

var sendHtml = function(receiver, subject, message) {
    console.log("Preparing normal mail ....");
    return {
        from: 'fao.testbed@gmail.com',
        to: receiver,
        subject: subject,
        html: message,
    };
};

exports.sendMessage = function (receiver, subject, message, isHTML) {
    console.log("Preparing .... ");
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