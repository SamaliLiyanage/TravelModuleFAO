var trip = require('../model/trip');

//Insert details on new trip

module.exports.newTrip = function(req, res, next) {
  trip.newTrip(req.body.tripID, req.body.username, req.body.tripType, req.body.tripDate, res);
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
}

module.exports.getTrip = function(req, res, next) { 
  trip.getTrip(req.params.tripID, res);
}