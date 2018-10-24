var request = require('request');
var cron = require('node-cron');
var fs = require('fs');
var path = require('path');
var telco = require('tap-telco-api');
var twilio_send = require('twilio')('ACcc7bb7f8e86eee57881854d785e30cdb', '16a9057877a17f624024638128bd83d2');
require('dotenv').config();

var offset = new Date().getTimezoneOffset();
var startTimeDate = new Date();
startTimeDate.setMinutes(startTimeDate.getMinutes());
var endTimeDate = new Date(startTimeDate);
endTimeDate.setMinutes(endTimeDate.getMinutes() + 5);

var startTime = startTimeDate.getFullYear() + '-' + (startTimeDate.getMonth() + 1) + '-' + startTimeDate.getDate() + ' ' + startTimeDate.getHours() + ':' + startTimeDate.getMinutes() + ':' + startTimeDate.getSeconds();
var endTime = endTimeDate.getFullYear() + '-' + (endTimeDate.getMonth() + 1) + '-' + endTimeDate.getDate() + ' ' + endTimeDate.getHours() + ':' + endTimeDate.getMinutes() + ':' + endTimeDate.getSeconds();

exports.sendMessage = function (receiver, message){
    twilio_send.messages.create({
        body: message,
        from: '+18325513324',
        to: '+'+receiver
    }).then (
        message => console.log(message.status)
    ).done();
}

/*exports.sendMessage = function (receiver, message) {
    checkAuthorization((result) => {
        const options = {
            url: 'https://digitalreachapi.dialog.lk/camp_req.php',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': result,
                'Accept': 'application/json'
            },
            json: {
                "msisdn": receiver.toString(),
                "mt_port": "FAO",
                "channel": "1",
                "s_time": startTime,
                "e_time": endTime,
                "msg": message
            }
        };

        request.post(options, (err, resp, body) => {
            if (err) console.log(err.body);
            else console.log(resp.body);
        });
    });
}

exports.getMessage = function () {
    const username = 'fao_api';
    const password = 'fao_api@789';
    const url = "https://digitalreach.dialog.lk/index.php?r=site/login";

    const options = {
        url: url,
        headers: {
            "User-Agent": "user-agent"
        },
        method: 'POST',
        formData: {
            'LoginForm_username': username,
            'LoginForm_password': password
        }
    }

    request.post(options, (err, resp, body) => {
        console.log(resp.body);
    });
}

function checkAuthorization(callback) {
    const temp = new Date(startTimeDate.getFullYear() + '-' + (startTimeDate.getMonth() + 1) + '-' + startTimeDate.getDate());
    fs.readFile(path.resolve(__dirname, '../logs/authentication.json'), 'utf8', (err, data) => {
        if (err) {
            getAuthorization((result) => {
                callback(result);
            });
        } else {
            const content = data;
            if (content.length > 0) {
                var jsonData = JSON.parse(content);
                const tempDate = new Date(jsonData.date);
                const authDate = new Date(tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate());
                if (authDate >= temp) {
                    callback(jsonData.authentication);
                }
            } else {
                getAuthorization((result) => {
                    callback(result);
                });
            }
        }
    });
}

function getAuthorization(callback) {
    const options = {
        url: 'https://digitalreachapi.dialog.lk/refresh_token.php',
        headers: {
            'Content-Type': 'application/json'
        },
        json: {
            "u_name": "fao_api",
            "passwd": "fao_api@789"
        }
    };

    request.post(options, (err, resp, body) => {
        if (err) {
            console.log('authorization error ', err.body);
            callback(err.body);
        } else {
            console.log("get Authorization ", resp.body.access_token);
            var jsonReq = JSON.stringify({
                'date': new Date(),
                'authentication': resp.body.access_token
            });
            fs.writeFile(
                path.resolve(__dirname, '../logs/authentication.json'),
                jsonReq,
                'utf8',
                (err) => console.log('authorization error ', err)
            );
            callback(resp.body.access_token);
        };
    });

}

cron.schedule("0 0 * * *", () => {
    getAuthorization(result => {
        console.log(result);
    });
});*/