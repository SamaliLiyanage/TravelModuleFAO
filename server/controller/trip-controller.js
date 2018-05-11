var trip = require('../model/trip');

//Insert details on new trip

module.exports.newTrip = function(req, res, next) {
  //console.log("Inside controller");
  trip.newTrip(req.body.tripID, req.body.username, req.body.tripType, res);
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
  trip.assignDriver(req.body.tripID, req.body.driverID, res);
}

module.exports.getTrip = function(req, res, next) {
  trip.getTrip(req.params.tripID, res);
}