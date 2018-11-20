var request = require('request');
var cron = require('node-cron');
require('dotenv').config();

var offset = new Date().getTimezoneOffset();
var startTimeDate = new Date();
//startTimeDate.setMinutes(startTimeDate.getMinutes());
var endTimeDate = new Date(startTimeDate);
endTimeDate.setMinutes(endTimeDate.getMinutes() + 5);

let authCode = null;

var startTime = startTimeDate.getFullYear() + '-' + (startTimeDate.getMonth() + 1) + '-' + startTimeDate.getDate() + ' ' + startTimeDate.getHours() + ':' + startTimeDate.getMinutes() + ':' + startTimeDate.getSeconds();
var endTime = endTimeDate.getFullYear() + '-' + (endTimeDate.getMonth() + 1) + '-' + endTimeDate.getDate() + ' ' + endTimeDate.getHours() + ':' + endTimeDate.getMinutes() + ':' + endTimeDate.getSeconds();

function getAuthorization(callback) {
    const options = {
        url: 'https://digitalreachapi.dialog.lk/refresh_token.php',
        headers: {
            'Content-Type': 'application/json'
        },
        json: {
            "u_name": "fao_api",
            "passwd": process.env.SMS_PASSWORD
        }
    };

    let x = 0;

    request.post(options, (err, resp, body) => {
        if (err) {
            console.log('authorization error ', err.body);
            authcode = null;
            callback(null);
        } else {
            console.log("Authorization Success", resp.body);
            authCode = resp.body.access_token;
            callback(resp.body.access_token);
        };
    });
}

function sendMessageRequest(options) {
    request.post(options, (err, resp, body) => {
        if (err) {
            console.log("Err ", err.body);
        } else if (resp.body.error === "0") {
            return ({ result: "success" });
        } else if (resp.body.error === "108") {
            var get_Auth = new Promise((resolve, reject) => {
                getAuthorization(value => {
                    if (value === null) {
                        reject(null);
                    } else {
                        resolve(value)
                    }
                });
            })
            get_Auth.then((value) => {
                authCode = value;
            }).catch((value) => {
                console.log("Problem !!!");
            })
            console.log("XXX ", authCode);
            sendMessageRequest(options);
        } else {
            callback({ error: resp.body.error });
        }
    });
}

cron.schedule("0 0 * * *", () => {
    var get_Auth = new Promise((resolve, reject) => {
        getAuthorization(value => {
            if (value === null) {
                reject(null);
            } else {
                resolve(value)
            }
        });
    })
    get_Auth.then((value) => {
        authCode = value;
    }).catch((value) => {
        console.log("Problem !!!");
    })
    console.log("XXX ", authCode);
});

exports.sendMessage = function (receiver, message, callback) {
    while (authCode === null) {
        getAuthorization();
    }
    const options = {
        url: 'https://digitalreachapi.dialog.lk/camp_req.php',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authCode,
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

    callback(sendMessageRequest(options));
}

exports.onStartUp = function () {
    var get_Auth = new Promise((resolve, reject) => {
        getAuthorization(value => {
            if (value === null) {
                reject(null);
            } else {
                resolve(value)
            }
        });
    })
    get_Auth.then((value) => {
        authCode = value;
    }).catch((value) => {
        console.log("Problem !!!");
    })
    console.log("XXX ", authCode);
}