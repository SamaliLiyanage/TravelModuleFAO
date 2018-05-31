var db = require('../db.js');

//Trip:::`TripID``Username``Driver_ID``Trip_Type``Requested_Date``Destination``Trip_Date``Start``End`
//User:::`Username``Full_Name``Password``Role``Mobile_No`

exports.newTrip = function (tripID, userName, tripType, tripDate, tripTime, destination, tripPurpose, res) {
    date = new Date();
    values = [tripID, userName, tripType, date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), tripDate, tripTime, destination, tripPurpose];

    db.connection.query('INSERT INTO Trip(TripID, Username, Trip_Type, Requested_Date, Trip_Date, Trip_Time, Destination, Purpose) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, function (err, results) {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            res.send(results);
        }
    })
}

exports.addFurtherComments = function (tripID, furtherRemarks) {
    values = [tripID, furtherRemarks];

    db.connection.query('INSERT INTO FurtherRemark(TripID, Remark) VALUES (?, ?)', values, function (err, results) {
        if (err) {
            console.log(err);
            return err;
        } else {
            return results;
        }
    })
}

exports.allTrips = function (res) {
    db.connection.query('SELECT * FROM Trip ORDER BY Requested_Date DESC', function (err, results) {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            res.send(results);
        }
    })
}

exports.getLastIndex = function (res) {
    date = new Date();
    value = [date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()];

    db.connection.query('SELECT Count(TripID) AS TripCount FROM Trip WHERE Requested_Date=?', value, function (err, results) {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            res.send(results[0]);
        }
    })
}

exports.userTrips = function (userID, res) {
    value = [userID];

    db.connection.query('SELECT * FROM Trip WHERE Username=? ORDER BY Requested_Date DESC', value, function (err, results) {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            res.send(results);
        }
    });
}

exports.assignDriver = function (tripID, driverID, tripStatus, res) {
    values = [driverID, tripStatus, tripID];

    db.connection.query('UPDATE Trip SET Driver_ID=?, Trip_Status=? WHERE TripID=?', values, function (err, results) {
        if (err) {
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

exports.getTrip = function (tripID, res) {
    value = [tripID];

    db.connection.query('SELECT * FROM Trip WHERE TripID=?', value, function (err, result) {
        if (err) {
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

exports.getFurtherComments = function (next){
    db.connection.query ('SELECT * FROM Trip, FurtherRemark WHERE Trip.TripID=FurtherRemark.TripID AND Trip.Trip_Status=6',[], function(err, result, temp) {
        var temp;
        if(err){
            temp = {
                success: false,
                data: err
            }
        }
        else {
            temp = {
                success: true,
                data: result
            }
        };
        next(temp);
    })
}

exports.getFurtherComment = function (tripID, next) {
    db.connection.query ('SELECT Remark FROM FurtherRemark WHERE TripID=?', tripID, function (err, result) {
        var temp;
        if (err) {
            temp = {
                success: false,
                exists: false,
                data: err
            }
        } else {
            if (result.length===0) {
                temp = {
                    success: true,
                    exists: false
                }
            } else {
                temp = {
                    success: true,
                    exists: true,
                    data: result[0].Remark
                }
            }
        }
        next (temp);
    })
}

exports.changeStatus = function (tripID, status, next) {
    values = [status, tripID];

    db.connection.query ('UPDATE Trip SET Trip_Status=? WHERE TripID=?', values, function (err, result) {
        var temp;

        if (err) {
            temp = {
                success: false,
            }
        } else {
            temp = {
                success: true,
            }
        }

        next(temp);
    })
}

exports.changeComments = function (tripID, newComment, next) {
    values = [newComment, tripID];

    db.connection.query ('UPDATE FurtherRemark SET Remark=? WHERE TripID=?', values, function(err, result) {
        var temp;

        if (err) {
            temp = {
                success: false,
            }
        } else {
            temp = {
                success: true,
            }
        }

        next(temp);
    })
}