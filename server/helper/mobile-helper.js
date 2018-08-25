var request = require('request');

var offset = new Date().getTimezoneOffset();
var startTimeDate = new Date();
startTimeDate.setMinutes(startTimeDate.getMinutes()-offset);
var endTimeDate = new Date(startTimeDate);
endTimeDate.setMinutes(endTimeDate.getMinutes()+5);

var startTime = startTimeDate.getFullYear()+'-'+(startTimeDate.getMonth()+1)+'-'+startTimeDate.getDate()+' '+startTimeDate.getHours()+':'+startTimeDate.getMinutes()+':'+startTimeDate.getSeconds();
var endTime = endTimeDate.getFullYear()+'-'+(endTimeDate.getMonth()+1)+'-'+endTimeDate.getDate()+' '+endTimeDate.getHours()+':'+endTimeDate.getMinutes()+':'+endTimeDate.getSeconds();

exports.sendMessage = function (receiver, message) {
    const options = {  
        url: 'https://digitalreachapi.dialog.lk/camp_req.php',
        headers: {
          'Content-Type': 'application/json',  
          'Authorization': '1533639445566',
          'Accept': 'application/json'        
        },
        json: {
          "msisdn" :receiver.toString(),
          "mt_port" : "Demo",
          "channel" : "1",
          "s_time" : startTime,
          "e_time" : endTime,
          "msg" : message
        }
    };

    request.post(options, (err, resp, body) => {
        if (err) console.log(err);
        else console.log(resp);
    });
}