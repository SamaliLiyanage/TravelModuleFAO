var request = require('request');
var cron = require('node-cron');
var fs = require('fs');
var path = require('path');
var telco = require('tap-telco-api');
var twilio_send = require('twilio')('ACcc7bb7f8e86eee57881854d785e30cdb', '16a9057877a17f624024638128bd83d2');
require('dotenv').config();

var offset = new Date().getTimezoneOffset();
var startTimeDate = new Date();
//startTimeDate.setMinutes(startTimeDate.getMinutes());
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
        if(result[1] === -1){
            console.log("Some error");
            return (result);
        } else {
            const options = {
                url: 'https://digitalreachapi.dialog.lk/camp_req.php',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': result[1],
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

            return ([tokenDate, authToken] = result);
        }
    });
}

function checkAuthorization(callback) {
    const temp = new Date(startTimeDate.getFullYear() + '-' + (startTimeDate.getMonth() + 1) + '-' + startTimeDate.getDate());
    
    if (authToken === null || tokenDate === null) {
        return getAuthorization((result) => {
            callback(result);
        });
    } else {
        if(tokenDate >= temp) {
            callback([tokenDate, authToken]);
            return([tokenDate, authToken]);
        } else {
            return getAuthorization((result) => {
                callback(result);
            });
        }
    }
}

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

    request.post(options, (err, resp, body) => {
        if (err) {
            console.log('authorization error ', err.body);
            callback([null, -1]);
            return ([null, -1]); //returns -1 for error
        } else {
            console.log("get Authorization ", resp.body.access_token);
            /*var jsonReq = JSON.stringify({
                'date': new Date(),
                'authentication': resp.body.access_token
            });
            fs.writeFile(
                path.resolve(__dirname, '../logs/authentication.json'),
                jsonReq,
                'utf8',
                (err) => console.log('authorization error ', err)
            );
            let tempDate = new Date();
            callback(
                [
                    new Date(tempDate.getFullYear()+'-'+(tempDate.getMonth()+1)+'-'+tempDate.getDate()), 
                    resp.body.access_token
                ]
            )
            return (
                [
                    new Date(tempDate.getFullYear()+'-'+(tempDate.getMonth()+1)+'-'+tempDate.getDate()), 
                    resp.body.access_token
                ]
            ); // returns date and access token on success
        };
    });

}

cron.schedule("0 0 * * *", () => {
    /*getAuthorization(result => {
        console.log(result);
    });
});*/