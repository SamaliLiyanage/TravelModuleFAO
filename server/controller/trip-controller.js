var trip = require('../model/trip');
var nodemailer = require('nodemailer');

//Insert details on new trip
module.exports.newTrip = function(req, res, next) {
  trip.newTrip(req.body.tripID, req.body.username, req.body.tripType, req.body.tripDate, req.body.tripTime, req.body.destination, req.body.tripPurpose, res);

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
    from: 'fao.otestbed@gmail.com',
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
}

module.exports.allTrips = function(req, res, next) {
  trip.allTrips(res);
}

module.exports.getLastIndex = function(req, res, next) {
	trip.getLastIndex(res);
}

module.exports.userTrips = function(req, res, next) {
  trip.userTrips(req.params.id, res);
}

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
  
  if (req.body.driverID==='cab') {
    text = 'A cab has been assigned to your trip with Trip ID: ' + req.body.tripID;
  } else {
    text = 'Driver '+req.body.driverID+ ' has been assigned to your trip with Trip ID: ' + req.body.tripID;
  }

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
}

module.exports.getTrip = function(req, res, next) { 
  trip.getTrip(req.params.tripID, res);
}