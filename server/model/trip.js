var db = require('../db.js');

//Trip:::`TripID``Username``Driver_ID``Trip_Type``Requested_Date``Destination``Trip_Date``Start``End`
//User:::`Username``Full_Name``Password``Role``Mobile_No`

exports.newTrip = function(tripID, userName, tripType, tripDate, res) {
  date = new Date();
  values = [tripID, userName, tripType, date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(), tripDate];

  db.connection.query('INSERT INTO Trip(TripID, Username, Trip_Type, Requested_Date, Trip_Date) VALUES (?, ?, ?, ?, ?)', values, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      res.send(results);
    }
  })
}

exports.allTrips = function(res) {
  db.connection.query('SELECT * FROM Trip ORDER BY Requested_Date DESC', function(err, results) {
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
  value = [date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()];
  
  db.connection.query('SELECT Count(TripID) AS TripCount FROM Trip WHERE Requested_Date=?', value, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      res.send(results[0]);
    }
  })
}

exports.userTrips = function(userID, res) {
  value = [userID];

  db.connection.query('SELECT * FROM Trip WHERE Username=?', value, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      res.send(results);
    }
  });
}

exports.assignDriver = function(tripID, driverID, tripStatus, res) {
  values = [driverID, tripStatus, tripID];

  db.connection.query('UPDATE Trip SET Driver_ID=?, Trip_Status=? WHERE TripID=?', values, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      var temp = {
        "status": "success",
        "result": results, 
      }
      res.json(temp);
    }
  });
}

exports.getTrip = function(tripID, res) {
  value = [tripID];

  db.connection.query('SELECT * FROM Trip WHERE TripID=?', value, function(err, result) {
    if(err) {
      console.log(err);
      return res.send(err);
    } else {
      var temp = {
        "status": "success",
        "data": result[0],
      }
      res.json(temp);
    }
  });
}