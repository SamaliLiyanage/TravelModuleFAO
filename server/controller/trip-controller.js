var trip = require('../model/trip');
var nodemailer = require('nodemailer');
var tapApi = require('tap-telco-api');

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
  if (driverNo==='1') {
    return 'Anthony';
  } else if (driverNo==='2') {
    return 'Ruchira';
  } else if (driverNo==='3') {
    return 'Dinesh';
  }
}

//Insert details on new trip
module.exports.newTrip = function(req, res, next) {
  trip.newTrip(req.body.tripID, req.body.username, req.body.tripType, req.body.tripDate, req.body.tripTime, req.body.destination, req.body.tripPurpose, res);
  if (!(req.body.furtherRmrks==="")){
    trip.addFurtherComments(req.body.tripID, req.body.furtherRmrks);
    trip.changeStatus(req.body.tripID, 6, response => {
      //res.send(response);
    })
  }

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

  var smsMessage = req.body.username+" has requested a trip with Trip ID: "+req.body.tripID;

  tapApi.sms.requestCreator(smsConfig).single('0772434145', smsMessage, function (mtReq) {
    tapApi.transport.createRequest(netConfig, mtReq, function (request) {
      tapApi.transport.httpClient(request, function () {
        console.log("Mt request send to subscriber " + mtReq.destinationAddresses);
      })
    })
  })
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
  trip.assignDriver(req.body.tripID, req.body.driverID, req.body.tripStatus, res);

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

    tapApi.sms.requestCreator(smsConfig).single('0772434145', smsMessage, function (mtReq) {
      tapApi.transport.createRequest(netConfig, mtReq, function (request) {
        tapApi.transport.httpClient(request, function () {
          console.log("Mt request send to subscriber " + mtReq.destinationAddresses);
        })
      })
    })
  }
}

//Get the details of the given trip
module.exports.getTrip = function(req, res, next) { 
  trip.getTrip(req.params.tripID, res);
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

    tapApi.sms.requestCreator(smsConfig).single('tel:94772434145', smsMessage, function (mtReq) {
      tapApi.transport.createRequest(netConfig, mtReq, function (request) {
        tapApi.transport.httpClient(request, function () {
          console.log("Mt request send to subscriber " + mtReq.destinationAddresses);
        })
      })
    })

    res.send(response);
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

//testing
module.exports.testMobile = function (req, res) {
  //console.log(req.body);
  tapApi.sms.requestCreator({applicationId : "APP_000101", password : "password"}).single('tel:94772434145', "Thank you", function (mtReq) {
    tapApi.transport.createRequest({hostname: '127.0.0.1', port: 7000, path: '/sms/send'}, mtReq, function (request) {
      tapApi.transport.httpClient(request, function () {
        console.log("Mt request send to subscriber" + mtReq.destinationAddresses);
        //console.log(mtReq.destinationAddresses)
      })
    })
  })
}