var db = require('../db.js');

exports.newTrip = function(tripID, userName, tripType, res) {
  values = [tripID, userName, tripType];

  db.connection.query('INSERT INTO Trip(TripID, Username, Trip_Type) VALUES (?, ?, ?)', values, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      res.send(results);
    }
  })
}

exports.allTrips = function(res) {
  db.connection.query('SELECT * FROM Trip', function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      res.send(results);
    }
  })
}
