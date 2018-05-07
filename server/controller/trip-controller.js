var trip = require('../model/trip');

//Insert details on new trip

module.exports.newTrip = function(req, res, next) {
  //console.log("Inside controller");
  trip.newTrip(req.body.tripID, req.body.username, req.body.tripType, res);
}

module.exports.allTrips = function(req, res, next) {
  trip.allTrips(res);
}
