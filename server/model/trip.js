var db = require('../db.js');

exports.newTrip = function(tripID, userName, tripType, res) {
  date = new Date();
  values = [tripID, userName, tripType, date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()];

  db.connection.query('INSERT INTO Trip(TripID, Username, Trip_Type, Requested_Date) VALUES (?, ?, ?, ?)', values, function(err, results) {
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

exports.getLastIndex = function(res) {
  date = new Date();
  value = [date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()];
  
  db.connection.query('SELECT Count(TripID) AS TripCount FROM Trip WHERE Requested_Date=?', value, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      res.send(results[0]);
    }
  })
}