require('dotenv').config();
var cron = require('node-cron');
var request = require('request');
var fs = require('fs');

// function that will return a promise with the authorization token when successful
function getAuthToken () {
    return new Promise ((resolve, reject) => {
        const options = {
            url: 'https://digitalreachapi.dialog.lk/refresh_token.php',
            headers: {
                'Content-Type': 'application/json'
            },
            json: {
                'u_name': 'fao_api',
                'passwd': process.env.SMS_PASSWORD
            }
        }
        request.post(options, (err, resp, body) => {
            if (err) {
                console.log("Problem in retrieving authorization token");
                reject(err);
            } else {
                console.log("Authorization token successfully ", resp.body);
                fs.writeFile(__dirname + '/../logs/sms_auth.txt', resp.body.access_token, (err) => {
                    if (err) {
                        reject (err);
                    } else {
                        resolve(resp.body.access_token);
                    }
                });
            }
        });
    }); 
}

// function that will return a promise with the message status when successful
function sendMessageRequest (receiver, message) {
    var startTimeDate = new Date();
    //startTimeDate.setMinutes(startTimeDate.getMinutes());
    var endTimeDate = new Date(startTimeDate);
    endTimeDate.setMinutes(endTimeDate.getMinutes() + 5);
    
    var startTime = startTimeDate.getFullYear() + '-' + (startTimeDate.getMonth() + 1) + '-' + startTimeDate.getDate() + ' ' + startTimeDate.getHours() + ':' + startTimeDate.getMinutes() + ':' + startTimeDate.getSeconds();
    var endTime = endTimeDate.getFullYear() + '-' + (endTimeDate.getMonth() + 1) + '-' + endTimeDate.getDate() + ' ' + endTimeDate.getHours() + ':' + endTimeDate.getMinutes() + ':' + endTimeDate.getSeconds();
    return new Promise ((resolve, reject) => {
        try{
            fs.readFile(__dirname + '/../logs/sms_auth.txt',(err, data) =>{
                console.log(startTime, endTime, receiver.toString(), message, data.toString());
                if (err) {
                    reject("Error reading authorization token from file");
                } else {
                    var options = {
                        url: 'https://digitalreachapi.dialog.lk/camp_req.php',
                        headers: {
                            'Authorization': data.toString(),
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        json: {
                            'msisdn': receiver.toString(),
                            'mt_port': "FAO",
                            'channel': "1",
                            's_time': startTime,
                            'e_time': endTime,
                            'msg': message
                        }
                    }
                    request.post(options, (err, resp, body) => {
                        if (err) {
                            console.log("Sending message failed");
                            reject(err);
                        } else if (resp.body.error === "0") {
                            resolve({ result: "success", phone: receiver.toString() });
                        } else {
                            reject("Sending message failed with error code " + resp.body.error);
                        }
                    });
                }
            });
        } catch (err) {
            console.log("Sending message failed!", err);
            reject("Authentication code problem " + err);
        }            
    });
}

// Export function to use on startup
exports.onStartUp = function() {
    let authToken = getAuthToken();
    authToken.then((value) => {
        console.log("Authentication code is ", value);
    }).catch((err) => {
        console.log("Auth token problem ", err);
    });
}

exports.sendMessage = function (receiver, message, callback) {
    sendMessageRequest (receiver, message)
    .then((response) => {
        callback (response);
    }).catch((error) => {
        callback (error);
    })
}

cron.schedule("0 0 * * *", () => {
    let authToken = getAuthToken();
    authToken.then((value) => {
        console.log("Authentication code is ", value);
    }).catch((err) => {
        console.log("Auth token problem ", err);
    });
});