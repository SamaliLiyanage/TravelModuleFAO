var request = require('request');
var cron = require('node-cron');

var offset = new Date().getTimezoneOffset();
var startTimeDate = new Date();
startTimeDate.setMinutes(startTimeDate.getMinutes());
var endTimeDate = new Date(startTimeDate);
endTimeDate.setMinutes(endTimeDate.getMinutes()+5);

var startTime = startTimeDate.getFullYear()+'-'+(startTimeDate.getMonth()+1)+'-'+startTimeDate.getDate()+' '+startTimeDate.getHours()+':'+startTimeDate.getMinutes()+':'+startTimeDate.getSeconds();
var endTime = endTimeDate.getFullYear()+'-'+(endTimeDate.getMonth()+1)+'-'+endTimeDate.getDate()+' '+endTimeDate.getHours()+':'+endTimeDate.getMinutes()+':'+endTimeDate.getSeconds();

exports.sendMessage = function (receiver, message) {
    const options = {  
        url: 'https://digitalreachapi.dialog.lk/camp_req.php',
        headers: {
          'Content-Type': 'application/json',  
          'Authorization': '1537080030218',
          'Accept': 'application/json'        
        },
        json: {
          "msisdn" :receiver.toString(),
          "mt_port" : "FAO",
          "channel" : "1",
          "s_time" : startTime,
          "e_time" : endTime,
          "msg" : message
        }
    };

    request.post(options, (err, resp, body) => {
        if (err) console.log(err.body);
        else console.log(resp.body);
    });
}

exports.getMessage = function () {
    const username = 'fao_api';
    const password = 'fao_api@789';
    const url = "https://digitalreach.dialog.lk/index.php?r=site/login";

    const options = {
        url: url,
        headers: {
            "User-Agent":"user-agent"
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

cron.schedule("0 0 * * *", () => {
    const options = {
        url: 'https://digitalreachapi.dialog.lk/refresh_token.php',
        headers: {
            'Content-Type': 'application/json'   
        },
        json: {
            "u_name": "fao_api",
            "passwd" : "fao_api@789"
        }
    };

    request.post(options, (err, resp, body) => {
        if (err) console.log(err.body);
        else console.log(resp.body);
    });
});