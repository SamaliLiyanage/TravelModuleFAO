var trip = require('../model/trip');
var nodemailer = require('nodemailer');
var tapApi = require('tap-telco-api');
var request = require('request');

const smsConfig = {
  applicationId: "APP_000101",
  password: "password"
}

const netConfig = {
  host: '127.0.0.1', 
  port: 7000, 
  path: '/sms/send'
}

function DriverName(driverNo) {
  var driver = parseInt(driverNo, 10);
  if (driver===1) {
    return 'Anthony';
  } else if (driver===2) {
    return 'Ruchira';
  } else if (driver===3) {
    return 'Dinesh';
  }
}

//Insert details on new trip
module.exports.newTrip = function(req, res, next) {
  let results;

  trip.newTrip(req.body.tripID, req.body.username, req.body.tripType, req.body.tripDate, req.body.tripTime, req.body.tripDuration, req.body.tripPurpose, (response)=>{
    results = {trip: response};
    res.send(results);
  });
  trip.addDestinations(req.body.tripID, req.body.destinations, req.body.destinationTowns, response => {
    //console.log(response);
  });
  if(parseInt(req.body.budgetingEntity, 10)===2) {
    trip.setBudgetingEntity(req.body.tripID, req.body.projectNumber, response => {
      //console.log(response);
    })
  }
  if (!(req.body.furtherRmrks==="")){
    trip.addFurtherComments(req.body.tripID, req.body.furtherRmrks);
    trip.changeStatus(req.body.tripID, 6, response => {
      //res.send(response);
    })
  }

  //Email Settings and Sending
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'fao.testbed@gmail.com',
      pass: 'Rand0mm4il!!!',
    }
  });

  var mailOptionsRqstr = {
    from: 'fao.testbed@gmail.com',
    to: 'samali.liyanage93@gmail.com',
    subject: 'Trip Request '+req.body.tripID,
    text: 'Your request for a trip on the '+req.body.tripDate+ ' has been sent to the travel manager',
  }

  var mailOptionsMgr = {
    from: 'fao.testbed@gmail.com',
    to: 'samali.liyanage93@gmail.com',
    subject: 'Trip Request '+req.body.tripID,
    html: '<ul><li>Trip ID:'+req.body.tripID+
    '</li><li>Username: '+req.body.username+
    '</li><li>Trip Date: '+req.body.tripDate+
    '</li><li>Trip Time: '+req.body.tripTime+
    '</li><li>Destination: '+req.body.destination+
    '</li><li>Purpose: '+req.body.tripPurpose+
    '</li></ul>',
  }

  transporter.sendMail(mailOptionsRqstr, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Email sent: '+info.response);
    }
  });

  transporter.sendMail(mailOptionsMgr, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Email sent: '+info.response);
    }
  })

  //Text Message Settings and Sending 
  var smsMessage = req.body.username+" has requested a trip with Trip ID: "+req.body.tripID;
  var offset = new Date().getTimezoneOffset();
  var startTimeDate = new Date();
  startTimeDate.setMinutes(startTimeDate.getMinutes()-offset);
  var endTimeDate = new Date(startTimeDate);
  endTimeDate.setMinutes(endTimeDate.getMinutes()+5);
  var startTime = startTimeDate.getFullYear()+'-'+(startTimeDate.getMonth()+1)+'-'+startTimeDate.getDate()+' '+startTimeDate.getHours()+':'+startTimeDate.getMinutes()+':'+startTimeDate.getSeconds();
  var endTime = endTimeDate.getFullYear()+'-'+(endTimeDate.getMonth()+1)+'-'+endTimeDate.getDate()+' '+endTimeDate.getHours()+':'+endTimeDate.getMinutes()+':'+endTimeDate.getSeconds()
  
  const options = {  
    url: 'https://digitalreachapi.dialog.lk/camp_req.php',
    headers: {
      'Content-Type': 'application/json',  
      'Authorization': '1532927585427',
      'Accept': 'application/json'        
    },
    json: {
      "msisdn" :"94767434145",
      "mt_port" : "Demo",
      "channel" : "1",
      "s_time" : startTime,
      "e_time" : endTime,
      "msg" : smsMessage
    }
  };

  request.post(options, function (err, resp, body) {
    if(err) {
      console.log(err.body);
    } else {
      console.log(resp.body);
    }
  });

  let month = new Date(req.body.tripDate)
  if((req.body.furtherRmrks==="")&&(parseInt(req.body.tripType, 10)!==2)) {
    trip.countMonthlyTrips(month.getMonth()+1, req.body.tripType)
    .then(function(response){
      const result = response.result;
      const ordered_driver_index = Array.from(Array(result.length).keys())
                      .sort((a, b)=> result[a]<result[b] ? -1: (result[a]>result[b] ? 1 : 0));
      let index=0;
      process(ordered_driver_index, index, req.body.tripTime, req.body.tripDuration, req.body.tripDate, req.body.tripID, res);
    })
    .catch(function(error){
      console.log(error);
    })
  }
}

//Get all trips
module.exports.allTrips = function(req, res, next) {
  trip.allTrips(res);
}

//Get the last index which will actually return the next index
module.exports.getLastIndex = function(req, res, next) {
	trip.getLastIndex(res);
}

//Get all of the trips of the user with the given trip ID
module.exports.userTrips = function(req, res, next) {
  trip.userTrips(req.params.id, res);
}

//Assign a driver for the given driver ID and change the status
module.exports.assignDriver = function(req, res, next) {
  trip.assignDriver(req.body.tripID, req.body.driverID, req.body.tripStatus, response=>{
    res.send(response);
  });

  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'fao.testbed@gmail.com',
      pass: 'Rand0mm4il!!!'
    }
  });

  var text = null;
  var smsMessage = null;  
  
  if (req.body.driverID==='cab') {
    smsMessage = "A cab has been assigned to your trip with Trip ID: "+req.body.tripID;  
    text = 'A cab has been assigned to your trip with Trip ID: ' + req.body.tripID;
  } else if (req.body.driverID!='0') {
    smsMessage = DriverName(req.body.driverID)+" has been assigned to your trip with Trip ID: "+req.body.tripID;  
    text = DriverName(req.body.driverID)+ ' has been assigned to your trip with Trip ID: ' + req.body.tripID;
  }

  var mailOptions = {
    from: 'fao.testbed@gmail.com',
    to: 'samali.liyanage93@gmail.com',
    subject: 'Trip Request '+req.body.tripID,
    text: text,
  }

  if (req.body.driverID!='0'){
    transporter.sendMail(mailOptions, function(error, info) {
      if(error) {
        console.log(error);
      } else {
        console.log('Email sent: '+info.response);
      }
    });

    var offset = new Date().getTimezoneOffset();
    var startTimeDate = new Date();
    startTimeDate.setMinutes(startTimeDate.getMinutes()-offset);
    var endTimeDate = new Date(startTimeDate);
    endTimeDate.setMinutes(endTimeDate.getMinutes()+5);
    var startTime = startTimeDate.getFullYear()+'-'+(startTimeDate.getMonth()+1)+'-'+startTimeDate.getDate()+' '+startTimeDate.getHours()+':'+startTimeDate.getMinutes()+':'+startTimeDate.getSeconds();
    var endTime = endTimeDate.getFullYear()+'-'+(endTimeDate.getMonth()+1)+'-'+endTimeDate.getDate()+' '+endTimeDate.getHours()+':'+endTimeDate.getMinutes()+':'+endTimeDate.getSeconds()

    const options = {  
      url: 'https://digitalreachapi.dialog.lk/camp_req.php',
      headers: {
        'Content-Type': 'application/json',  
        'Authorization': '1532927585427',
        'Accept': 'application/json'        
      },
      json: {
        "msisdn" :"94767434145",
        "mt_port" : "Demo",
        "channel" : "1",
        "s_time" : startTime,
        "e_time" : endTime,
        "msg" : smsMessage
      }
    };

    request.post(options, function (err, resp, body) {
      if(err) {
        console.log(err.body);
      } else {
        console.log(resp.body);
      }
    });
  }
}

//Get the details of the given trip
module.exports.getTrip = function(req, res, next) { 
  trip.getTrip(req.params.tripID, response=>{
    res.send(response);
  });
}

//Get all further requests 
module.exports.getAllFurtherRequests = function (req, res) {
  trip.getFurtherComments(response => {
    res.send(response);
  })
}

//Get further comments for given trip ID
module.exports.getFurtherRequest = function (req, res) {
  trip.getFurtherComment(req.params.tripID, response => {
    res.send(response);
  })
}

//Set the approval for the further remarks/requests
module.exports.setApproval = function (req, res) {
  var text = null;
  var smsMessage = null;

  if (req.body.approve===true) {
    text = "Your further requests for the above trip have been APPROVED by the Travel Administrator.";
    smsMessage = "Your further requests for the trip with Trip ID: "+req.body.tripID+" have been APPROVED by the Travel Administrator.";
  } else {
    text = "Your further requests for the above trip have been DENIED by the Travel Administrator.";    
    smsMessage = "Your further requests for the trip with Trip ID: "+req.body.tripID+" have been DENIED by the Travel Administrator.";    
  }

  trip.changeComments(req.body.tripID, req.body.comment, response => {

    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'fao.testbed@gmail.com',
        pass: 'Rand0mm4il!!!'
      }
    });

    var mailOptions = {
      from: 'fao.testbed@gmail.com',
      to: 'samali.liyanage93@gmail.com',
      subject: 'Trip Request '+req.body.tripID,
      text: text,
    }

    transporter.sendMail(mailOptions, function(error, info) {
      if(error) {
        console.log(error);
      } else {
        console.log('Email sent: '+info.response);
      }
    });

    var offset = new Date().getTimezoneOffset();
    var startTimeDate = new Date();
    startTimeDate.setMinutes(startTimeDate.getMinutes()-offset);
    var endTimeDate = new Date(startTimeDate);
    endTimeDate.setMinutes(endTimeDate.getMinutes()+5);
    var startTime = startTimeDate.getFullYear()+'-'+(startTimeDate.getMonth()+1)+'-'+startTimeDate.getDate()+' '+startTimeDate.getHours()+':'+startTimeDate.getMinutes()+':'+startTimeDate.getSeconds();
    var endTime = endTimeDate.getFullYear()+'-'+(endTimeDate.getMonth()+1)+'-'+endTimeDate.getDate()+' '+endTimeDate.getHours()+':'+endTimeDate.getMinutes()+':'+endTimeDate.getSeconds()

    const options = {  
      url: 'https://digitalreachapi.dialog.lk/camp_req.php',
      headers: {
        'Content-Type': 'application/json',  
        'Authorization': '1532927585427',
        'Accept': 'application/json'        
      },
      json: {
        "msisdn" :"94772434145",
        "mt_port" : "Demo",
        "channel" : "1",
        "s_time" : startTime,
        "e_time" : endTime,
        "msg" : smsMessage
      }
    };
  
    request.post(options, function (err, resp, body) {
      res.send(response);
    });

    trip.getTrip(req.body.tripID, response => {
      const data = response.data;
      trip.countMonthlyTrips(data.Trip_Date.getMonth()+1, data.Trip_Type)
      .then(function(respo) {
        const result = respo.result;
        const ordered_driver_index = Array.from(Array(result.length).keys())
                      .sort((a, b)=> result[a]<result[b] ? -1: (result[a]>result[b] ? 1 : 0));
        let index=0;
        process(ordered_driver_index, index, data.Trip_Time, data.Duration, data.Trip_Date, data.TripID, res);
      })
      .catch(function(error) {
        console.log(error);
      })
    });

    //res.send(response);
  })

  trip.changeStatus(req.body.tripID, 1, response => {
    //console.log(response);
  })
}

//Send mobile response 
module.exports.sendMobileResponse = function (req, res, next) {
  res.send(tapApi.sms.successResponse);
  next();
}

//Trip start and end
module.exports.setTripStatus = function (req, res) {
  const message = req.body.message;
  var state, tripID, mileage;

  [state, tripID, mileage] = message.split(" ");
  state = state.substr(0,1).toUpperCase()+state.slice(1).toLowerCase();

  trip.getTripStatus(tripID, response => {
    if(state==='Start') {
      if((response.End===null) && (response.Start===null)) {
        trip.setTripStatus(tripID, state, mileage, 3, resp => {
          console.log(resp);
          res.send(resp);
        })
      } else {
        res.send({status: 'fail'});
      }
    } else if(state==='End') {
      if((response.Start!==null) && (response.End===null)){
        trip.setTripStatus(tripID, state, mileage, 4, resp => {
          console.log(resp);
          res.send(resp);
        })
      } else {
        res.send({status: 'fail'});
      }
    } else {
      res.send({status: 'fail'});
    }
  })
} 

module.exports.getDestinations = function (req, res) {
  trip.getDestinations (req.params.tripID, response => {
    res.send(response);
  })
}

module.exports.getBudgetEntity = function (req, res) {
  trip.getBudgetingEntity (req.params.tripID, response => {
    res.send(response);
  })
}

function process(ordered_driver_index, index, tripTime, tripDuration, tripDate, tripID, res) {
  if(index>=ordered_driver_index.length) {
    return ({"result":"cab"});
  } else {
    var endTime = parseInt(tripTime.slice(0, 2), 10)+parseInt(tripDuration, 10);
    if (endTime.toString().length===1){
      endTime = '0'+endTime+tripTime.slice(-3);
    }else {
      endTime = endTime+tripTime.slice(-3);
    }
    
    trip.checkDriverAvailability(ordered_driver_index[index]+1, tripDate, tripTime, endTime, response=>{
      //console.log("time", tripTime, endTime);
      if(response.status==='success' && response.result===0){
        trip.assignDriver(tripID, ordered_driver_index[index]+1, 2, response=>{
          if(response.status==='success'){
            var transporter = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                user: 'fao.testbed@gmail.com',
                pass: 'Rand0mm4il!!!'
              }
            });
            
            var text = null;
            var smsMessage = null;  
  
            if (ordered_driver_index[index]+1==='cab') {
              smsMessage = "A cab has been assigned to your trip with Trip ID: "+tripID;  
              text = 'A cab has been assigned to your trip with Trip ID: ' + tripID;
            } else if (ordered_driver_index[index]+1!='0') {
              smsMessage = DriverName(ordered_driver_index[index]+1)+" has been assigned to your trip with Trip ID: "+tripID;  
              text = DriverName(ordered_driver_index[index]+1)+ ' has been assigned to your trip with Trip ID: ' + tripID;
            }
            
            var mailOptions = {
              from: 'fao.testbed@gmail.com',
              to: 'samali.liyanage93@gmail.com',
              subject: 'Trip Request '+tripID,
              text: text,
            }

            if (ordered_driver_index[index]+1!==0){
              transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                  console.log(error);
                } else {
                  console.log('Email sent: '+info.response);
                }
              });
            }

            return (response);            
          }
        })
      } else {
        process(ordered_driver_index, index+1, tripTime, tripDuration, tripDate, tripID, res);
      }
    })
  }
}

module.exports.driverCount = function (req, res) {
  let month = new Date(req.body.tripDate)
  trip.countMonthlyTrips(month.getMonth()+1)
  .then(function(response){
    const result = response.result;
    const ordered_driver_index = Array.from(Array(result.length).keys())
                    .sort((a, b)=> result[a]<result[b] ? -1: (result[a]>result[b] ? 1 : 0));
    let index=0;
    process(ordered_driver_index, index, req, res);
  })
  .catch(function(error){
    console.log(error);
  })
}

//testing controllers
module.exports.testMobile = function (req, res) {
  const options = {  
    url: 'https://digitalreachapi.dialog.lk/camp_req.php',
    headers: {
      'Content-Type': 'application/json',  
      'Authorization': '1532927585427',
      'Accept': 'application/json'        
    },
    json: {
      "msisdn" :"94772434145",
      "mt_port" : "Demo",
      "channel" : "1",
      "s_time" : "2018-07-30 13:25:00",
      "e_time" : "2018-07-30 13:30:00",
      "msg" : "Testing"
    }
  };

  request.post(options, function (err, resp, body) {
    res.send(body);
  })
}

module.exports.driverAvailability = function (req, res) {
  trip.checkDriverAvailability(req.body.driverID, req.body.tripDate, req.body.tripStart, req.body.endTime, response=>{
    if(response.status==='success' && response.result===0){
      trip.assignDriver(req.body.tripID, req.body.driverID, req.body.tripStatus, response=>{
        return res.send(response);
      })
    }
  })
}