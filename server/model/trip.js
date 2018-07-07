var db = require('../db.js');

//Trip:::`TripID``Username``Driver_ID``Trip_Type``Requested_Date``Trip_Date``Start``End`
//TripDestination::: `TripID``Destination``Destination_Town`
//BudgetProject::: `TripID``Project_No`
//User:::`Username``Full_Name``Password``Role``Mobile_No`

exports.newTrip = function (tripID, userName, tripType, tripDate, tripTime, tripPurpose, next) {
    date = new Date();
    values = [tripID, userName, tripType, date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), tripDate, tripTime, tripPurpose];

    db.connection.query('INSERT INTO Trip(TripID, Username, Trip_Type, Requested_Date, Trip_Date, Trip_Time, Purpose) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err, results) {
        if (err) {
            console.log(err);
            next ({
                status: "fail",
                data: err
            });
        } else {
            next ({
                status: "success",
                data: results
            });
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
    db.connection.query('SELECT * FROM Trip ORDER BY TripID DESC', function (err, results) {
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

    db.connection.query('SELECT * FROM Trip WHERE Username=? ORDER BY TripID DESC', value, function (err, results) {
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

exports.setTripStatus = function (tripID, state, mileage, status, next) {
    const stateDate = new Date();
    const values = [stateDate, mileage, status, tripID];

    let statement = 'UPDATE Trip SET '+state+'=?, '+state+'_Mileage=?, Trip_Status=? WHERE TripID=?';

    db.connection.query(statement, values, function(err, response) {
        var temp;

        if (err) {
            temp = {status: 'error'}
        } else if (response.affectedRows===1) {
            console.log(response);
            temp = {status: 'success'};
        } else {
            temp = {status: 'fail'}
        }

        next(temp);
    })
} 

exports.getTripStatus = function (tripID, next) {
    db.connection.query ('SELECT Start, End FROM Trip WHERE TripID=? AND (Trip_Status=2 OR Trip_Status=3)', tripID, function (err, result) {
        if(err) {
            next('err');            
        } else if(result.length===1) {
            next(result[0]);
        } else {
            next ('err');
        }
    })
}

exports.addDestinations = function (tripID, destinationList, destinationTownList, next) {
    const destinationString = destinationList.map((destination, index) => {
        return ('('+tripID+', \"'+destination+'\", \"'+destinationTownList[index]+'\")');
    }) 

    db.connection.query('INSERT INTO TripDestination (TripID, Destination, Destination_Town) VALUES '+destinationString.join(), function (err) {
        if (err) {
            console.log(err);
            next(err);
        } else {
            next(destinationString.join());
        }
    })
}

exports.getDestinations = function (tripID, next) {
    db.connection.query ('SELECT Destination, Destination_Town FROM TripDestination WHERE TripID=?', tripID, function (err, results) {
        var temp;
        if (err) {
            temp = {
                success: false,
                data: err
            }
        } else {
            temp = {
                success: true,
                data: results
            }
        }
        next (temp);
    });
}

exports.setBudgetingEntity = function (tripID, pNumber, next) {
    const values = [tripID, pNumber];

    db.connection.query ('INSERT INTO BudgetProject (TripID, Project_No) VALUES (?, ?)', values, function (err, results) {
        if(err) {
            console.log(err);
            next(err);
        } else {
            next(results);
        }
    })
}

exports.getBudgetingEntity = function (tripID, next) {
    db.connection.query ('SELECT * FROM BudgetProject WHERE TripID= ?', tripID, function (err, result) {
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
                    data: result[0].Project_No
                }
            }
        }
        next (temp);
    })
}