let timeHelper = require('../helper/time-helper');
var db = require('../db.js');
const connection = db.connection;

//Trip:::`TripID``Username``Driver_ID``Trip_Type``Requested_Date``Trip_Date``Start``End`
//TripDestination::: `TripID``Destination``Destination_Town`
//BudgetProject::: `TripID``Project_No`
//User:::`Username``Full_Name``Password``Role``Mobile_No`

exports.newTrip = function (tripID, userName, tripType, tripDate, tripTime, tripDuration, tripDurationMin, tripPurpose, onBehalf, next) {
    date = new Date();
    values = [tripID, userName, tripType, date, tripDate, tripTime, tripDuration, tripDurationMin, tripPurpose, onBehalf];

    db.connection.query('INSERT INTO Trip(TripID, Username, Trip_Type, Requested_Date, Trip_Date, Trip_Time, Duration, Duration_Minute, Purpose, OnBehalf) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, function (err, results) {
        if (err) {
            console.log(err);
            next({
                status: "fail",
                data: err
            });
        } else {
            next({
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

exports.assignDriver = function (tripID, driverID, tripStatus, next) {
    values = [driverID, tripStatus, tripID];

    db.connection.query('UPDATE Trip SET Driver_ID=?, Trip_Status=? WHERE TripID=?', values, function (err, results) {
        if (err) {
            console.log(err);
            var temp = {
                "status": "fail",
                "result": err,
            }
            next(temp);
        } else {
            var temp = {
                "status": "success",
                "result": results,
            }
            next(temp);
        }
    });
}

exports.getTrip = function (tripID, next) {
    value = [tripID];

    db.connection.query('SELECT * FROM Trip WHERE TripID=?', value, function (err, result) {
        if (err) {
            console.log(err);
            next(err);
        } else {
            var temp = {
                "status": "success",
                "data": result[0],
            }
            next(temp);
        }
    });
}

exports.getFurtherComments = function (next) {
    db.connection.query('SELECT * FROM Trip, FurtherRemark WHERE Trip.TripID=FurtherRemark.TripID ORDER BY Trip.TripID DESC', [], function (err, result, temp) {
        var temp;
        if (err) {
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
    db.connection.query('SELECT Remark FROM FurtherRemark WHERE TripID=?', tripID, function (err, result) {
        var temp;
        if (err) {
            temp = {
                success: false,
                exists: false,
                data: err
            }
        } else {
            if (result.length === 0) {
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
        next(temp);
    })
}

exports.changeStatus = function (tripID, status, next) {
    values = [status, tripID];

    db.connection.query('UPDATE Trip SET Trip_Status=? WHERE TripID=?', values, function (err, result) {
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

    db.connection.query('UPDATE FurtherRemark SET Remark=? WHERE TripID=?', values, function (err, result) {
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

    let statement = 'UPDATE Trip SET ' + state + '=?, ' + state + '_Mileage=?, Trip_Status=? WHERE TripID=?';

    db.connection.query(statement, values, function (err, response) {
        var temp;

        if (err) {
            temp = { status: 'error' }
        } else if (response.affectedRows === 1) {
            console.log(response);
            temp = { status: 'success' };
        } else {
            temp = { status: 'fail' }
        }

        next(temp);
    })
}

exports.getTripStatus = function (tripID, next) {
    db.connection.query('SELECT Start, End FROM Trip WHERE TripID=? AND (Trip_Status=2 OR Trip_Status=3)', tripID, function (err, result) {
        if (err) {
            next('err');
        } else if (result.length === 1) {
            next(result[0]);
        } else {
            next('err');
        }
    })
}

exports.addDestinations = function (tripID, destinationList, destinationTownList, next) {
    const destinationString = destinationList.map((destination, index) => {
        return ('(' + tripID + ', \"' + destination + '\", \"' + destinationTownList[index] + '\")');
    })

    db.connection.query('INSERT INTO TripDestination (TripID, Destination, Destination_Town) VALUES ' + destinationString.join(), function (err) {
        if (err) {
            console.log(err);
            next(err);
        } else {
            next(destinationString.join());
        }
    })
}

exports.getDestinations = function (tripID, next) {
    db.connection.query('SELECT Destination, Destination_Town FROM TripDestination WHERE TripID=?', tripID, function (err, results) {
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
        next(temp);
    });
}

exports.setBudgetingEntity = function (tripID, pNumber, next) {
    const values = [tripID, pNumber];

    db.connection.query('INSERT INTO BudgetProject (TripID, Project_No) VALUES (?, ?)', values, function (err, results) {
        if (err) {
            console.log(err);
            next(err);
        } else {
            next(results);
        }
    })
}

exports.getBudgetingEntity = function (tripID, next) {
    db.connection.query('SELECT * FROM BudgetProject WHERE TripID= ?', tripID, function (err, result) {
        var temp;
        if (err) {
            temp = {
                success: false,
                exists: false,
                data: err
            }
        } else {
            if (result.length === 0) {
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
        next(temp);
    })
}

exports.checkDriverAvailability = function (driverID, date, startTime, endTime, next) {
    const values = [date, driverID, endTime, startTime];
    var temp;
    db.connection.query('SELECT COUNT(*) AS TripCount FROM (SELECT TripID, Trip_Time, Driver_ID, Duration, Duration_Minute, DATE_ADD(DATE_ADD(Trip_Time, INTERVAL Duration HOUR), INTERVAL Duration_Minute MINUTE) AS End_Time FROM Trip WHERE Trip_Date=? AND Driver_ID=?) AS T WHERE (Trip_Time<? AND End_Time>?)', values, function (err, results) {
        if (err) {
            console.log(err);
            temp = {
                status: 'fail'
            };
        } else {
            temp = {
                status: 'success',
                result: results[0].TripCount
            }
        }
        next(temp);
    });
}

exports.checkDriverFieldAvailability = function (driverID, date, startTime, endDate, next) {
    const values = [];
    var temp;
    db.connection.query('SELECT COUNT(*) AS TripCount FROM Trip WHERE Trip_Date>=? AND Trip_Date<=?', values, function (err, result) {
        if (err) {
            console.log(err);
            temp = {
                status: 'fail'
            };
        } else {
            temp = {
                status: 'success',
                result: result[0].TripCount
            }
        }
        next(temp);
    })
}

exports.checkDriverAvailabilityAllTypes = function (
    driverID, 
    tripDate, 
    tripTime, 
    tripType, 
    duration, 
    durationMinutes, 
    next) {
        if (parseInt(tripType, 10) === 2) {
            timeHelper.getEndDate(tripDate, duration)
            .then ((endDate) => {
                const values =[driverID, endDate, tripDate, driverID, endDate, tripDate];
    
                connection.query("SELECT(SELECT COUNT(*) FROM (SELECT TripID, Username, Trip_Status, Trip_Date, Trip_Time, Duration, Driver_ID, Duration_Minute, DATE_ADD(Trip_Date, INTERVAL Duration Day) AS End_Date FROM Trip WHERE Driver_ID=? AND Trip_Type=2) AS T WHERE Trip_Date<=? AND End_Date>=?) AS COUNT_1, (SELECT COUNT(*) FROM (SELECT TripID, Username, Trip_Status, Trip_Date, Trip_Time, Duration, Driver_ID, Duration_Minute FROM Trip WHERE Driver_ID=? AND Trip_Type!=2) AS T2 WHERE Trip_Date<=? AND Trip_Date>=?) AS COUNT_2", values, (err, result) => {
                    if (err) {
                        next({
                            status: 'fail',
                            result: err
                        });
                    } else {
                        next({
                            status: 'success',
                            result: result[0].COUNT_1 + result[0].COUNT_2
                        });
                    }
                });
            });
        } else if (parseInt(tripType, 10) !== 2) {
            timeHelper.getEndTime(tripTime, duration, durationMinutes)
            .then ((endTime) => {
                const values =[driverID, tripDate, endTime, tripTime, driverID, tripDate, tripDate];
                
                connection.query("SELECT(SELECT COUNT(*) FROM (SELECT TripID, Username, Trip_Status, Trip_Date, Trip_Time, Duration, Driver_ID, Duration_Minute, DATE_ADD(DATE_ADD(Trip_Time, INTERVAL Duration HOUR), INTERVAL Duration_Minute MINUTE) AS End_Time FROM Trip WHERE Driver_ID=? AND Trip_Type!=2) AS T WHERE Trip_Date=? AND (Trip_Time<=? AND End_Time>=?)) AS COUNT_1, (SELECT COUNT(*) FROM (SELECT TripID, Username, Trip_Status, Trip_Date, Trip_Time, Duration, Driver_ID, DATE_ADD(Trip_Date, INTERVAL Duration Day) AS End_Date FROM Trip WHERE Driver_ID=? AND Trip_Type=2) AS T2 WHERE Trip_Date<=? AND End_Date>=?) AS COUNT_2", values, (err, result) => {
                    if (err) {
                        next({
                            status: 'fail',
                            result: err
                        });
                    } else {
                        next({
                            status: 'success',
                            result: result[0].COUNT_1 + result[0].COUNT_2
                        });
                    }
                });
            });
        }
    }

exports.countMonthlyTrips = function (month, type) {
    return new Promise(function (resolve, reject) {
        const values = [month, type];
        var temp;
        db.connection.query('SELECT Driver_ID, COUNT(*) AS TripCount FROM Trip WHERE (Driver_ID!=\'0\' AND Driver_ID!=\'Dinesh.Pussegoda@fao.org\' AND Driver_ID!=\'driver2@fao.org\') AND MONTH(Trip_Date)=? AND Trip_Type=? GROUP BY Driver_ID', values, function (err, results) {
            if (err) {
                console.log(err);
                temp = {
                    status: 'fail'
                };
                reject(temp);
            } else {
                let driverCount = {};
                results.forEach(driver => {
                    driverCount[driver.Driver_ID] = parseInt(driver.TripCount, 10);
                });
                temp = {
                    status: 'success',
                    result: driverCount
                };
                resolve(temp);
            }
        })
    });
}

exports.countMonthlyTripsForAvailableDrivers = function (year, month, type, driverList) {
    const driverNumber = driverList.length - 1;

    let blockedDriverQuery = "(SELECT * FROM (";
    let driverQuery = "SELECT DriverID FROM (";
    
    driverList.forEach((driver, index) => {
        console.log("AAAAAAAAA", index, driverNumber);
        if (index !== driverNumber) {
            driverQuery += "SELECT * FROM (SELECT * FROM DriverBlocked WHERE DriverID=\'" + driver + "\' ORDER BY Date DESC Limit 1) AS T" + index + " UNION ";
        } else {
            driverQuery += "SELECT * FROM (SELECT * FROM DriverBlocked WHERE DriverID=\'" + driver + "\' ORDER BY Date DESC Limit 1) AS T" + index;
        }

    });

    driverQuery += ") AS T WHERE Blocked=1) AS TA";

    blockedDriverQuery += (driverQuery + ")");
    console.log(blockedDriverQuery);

    return new Promise (function (resolve, reject) {
        const values = [year, month, type];
        connection.query("SELECT TX.Username, IFNULL(COUNT(TY.Driver_ID), 0) AS TripCount FROM (SELECT Username FROM User WHERE Role=3 AND Username NOT IN " + blockedDriverQuery + " ) AS TX LEFT JOIN (SELECT TripID, Driver_ID FROM Trip WHERE YEAR(Trip_Date)=? AND MONTH(Trip_Date)=? AND Trip_Type=?) AS TY ON TX.Username = TY.Driver_ID GROUP BY TX.Username", values, (err, results) => {
            if (err) {
                console.log(err);
                temp = {
                    status: 'fail'
                };
                reject(temp);
            } else {
                let driverCount = {};
                results.forEach(driver => {
                    driverCount[driver.Username] = parseInt(driver.TripCount, 10);
                });
                temp = {
                    status: 'success',
                    result: driverCount
                };
                resolve(temp);
            }
        });
    });
}

exports.cancelTrip = function (tripID) {
    return new Promise(function (resolve, reject) {
        var temp;
        db.connection.query('UPDATE Trip SET Driver_ID=0, Trip_Status=7 WHERE TripID=?', [tripID], function (error, result) {
            if (error) {
                console.log(error);
                temp = {
                    status: 'fail'
                };
                reject(temp);
            } else {
                temp = {
                    status: 'success'
                }
                resolve(temp);
            }
        })
    });
}

exports.checkOngoing = function (next) {
    const dateNow = new Date();
    var date = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
    var time;
    var hours = dateNow.getHours();
    var minutes = dateNow.getMinutes();

    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        time = hours + ':0' + minutes + ':00';
    } else {
        time = hours + ':' + minutes + ':00';
    }

    var values = [date, time]

    connection.query('SELECT Trip.TripID AS TripID, User.Mobile_No AS Mobile_No, User.Username AS Username FROM Trip, User WHERE Start IS NOT NULL AND End IS NULL AND Trip_Date=? AND Trip.Username=User.Username AND DATE_ADD(DATE_ADD(DATE_ADD(Trip_Time, INTERVAL Duration HOUR), INTERVAL Duration_Minute MINUTE), INTERVAL -30 MINUTE)=?', values, (err, results) => {
        var temp;
        if (err) {
            temp = {
                status: 'fail',
                result: err
            }
        } else {
            temp = {
                status: 'success',
                result: results
            }
        }
        next(temp);
    })
}

exports.checkNotStarted = function (next) {
    var dateNow = new Date();
    var date = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
    var time;
    var hours = dateNow.getHours();
    var minutes = dateNow.getMinutes();

    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        time = hours + ':0' + minutes + ':00';
    } else {
        time = hours + ':' + minutes + ':00';
    }

    connection.query('SELECT Trip.TripID AS TripID, User.Mobile_No AS Mobile_No, User.Username AS Username FROM Trip, User WHERE Trip_Status=2 AND Start IS NULL AND Trip_Date=? AND DATE_ADD(Trip_Time, INTERVAL 15 MINUTE)=? AND Trip.Username=User.Username', [date, time], (err, results) => {
        var temp;
        if (err) {
            temp = {
                status: 'fail',
                result: err
            }
        } else {
            temp = {
                status: 'success',
                result: results
            }
        }
        next(temp);
    })
}

exports.getOnDateForDriver = function (driverID, tripDate) {
    return new Promise((resolve, reject) => {
        const values = [driverID, tripDate];
        connection.query('SELECT * FROM Trip WHERE Driver_ID=? AND Trip_Date=?', values, (err, results) => {
            var temp;
            if (err) {
                temp = {
                    status: 'fail',
                    error: err
                }
                reject(temp);
            } else {
                temp = {
                    status: 'success',
                    data: results
                }
                resolve(temp);
            }
        });
    });
}

exports.getFullTripDetail = function (tripID, next) {
    const values = [tripID];
    connection.query('SELECT * FROM Trip, User WHERE Trip.TripID=? AND Trip.Username=User.Username', values, (err, results) => {
        var temp;
        if (err) {
            temp = {
                status: 'fail',
                error: err
            }
        } else {
            temp = {
                status: 'success',
                data: results[0]
            }
        }
        next(temp);
    })
}

exports.consolidatedRequested = function (tripID, next) {
    const values = [tripID];
    connection.query('SELECT * FROM Trip, User WHERE Trip.TripID=? AND Trip.Username=User.Username', values, (err, tripResult) => {
        if (err) {
            next({ status: "fail", err: err });
        } else {
            connection.query('SELECT * FROM TripTraveller WHERE TripID=?', values, (travErr, travResults) => {
                if (travErr) {
                    next({
                        status: "fail",
                        err: travErr,
                        data: [tripResult]
                    });
                } else {
                    connection.query('SELECT * FROM TripDestination WHERE TripID=?', values, (destErr, destResults) => {
                        if (destErr) {
                            next({
                                status: "fail",
                                err: destErr,
                                data: [tripResult, travResults]
                            });
                        } else {
                            connection.query('SELECT * FROM FurtherRemark WHERE TripID=?', values, (frErr, frResults) => {
                                if (frErr) {
                                    next({
                                        status: "fail",
                                        err: frErr,
                                        data: [tripResult, travResults, destResults]
                                    });
                                } else {
                                    let content = {
                                        status: "success",
                                        destResults: destResults,
                                        tripID: tripResult[0].TripID,
                                        username: tripResult[0].Username,
                                        tripStatus: tripResult[0].Trip_Status,
                                        driverID: tripResult[0].Driver_ID,
                                        tripType: tripResult[0].Trip_Type,
                                        requestedDate: tripResult[0].Requested_Date,
                                        tripDate: tripResult[0].Trip_Date,
                                        tripTime: tripResult[0].Trip_Time,
                                        durationHours: tripResult[0].Duration,
                                        durationMinutes: tripResult[0].Duration_Minute,
                                        purpose: tripResult[0].Purpose,
                                        onBehalf: tripResult[0].OnBehalf,
                                        startTime: tripResult[0].Start,
                                        endTime: tripResult[0].End,
                                        startMileage: tripResult[0].Start_Mileage,
                                        endMileage: tripResult[0].End_Mileage,
                                        fullName: tripResult[0].Full_Name,
                                        role: tripResult[0].Role,
                                        mobileNumber: tripResult[0].Mobile_No,
                                    }
                                    if (travResults.length === 0) {
                                        content['travName'] = null,
                                        content['travEmail'] = null,
                                        content['travMobile'] = null
                                    } else {
                                        content['travName'] = travResults[0].Traveller_Name,
                                        content['travEmail'] = travResults[0].Traveller_Email,
                                        content['travMobile'] = travResults[0].Traveller_Mobile
                                    }
                                    if (frResults.length === 0) {
                                        content['frResults'] = null
                                    } else {
                                        content['frResults'] = frResults[0].Remark
                                    }
                                    next(content)
                                }
                            })
                        }
                    })
                }
            });
        }
    });
}

exports.filterTrips = function (queries, next) {
    let query = 'SELECT * FROM Trip WHERE ';
    const queryKeys = Object.keys(queries);
    queryKeys.forEach((queryKey, index) => {
        if (queryKeys.length !== (index+1)) {
            query += (queryKey + '=' + queries[queryKey] + ' AND ');
        } else {
            query += (queryKey + '=' + queries[queryKey]);
        }
    });
    
    connection.query(query, (err, results) => {
        if (err) {
            next({
                status: 'fail',
                result: err
            });
        } else {
            next({
                status: 'success',
                result: results
            });
        }
        
    });
}

exports.getAffectedTrips = function (driverID, tripType, tripDate, tripTime, tripDuration, tripDurationMin, next) {
    if (parseInt(tripType, 10) !== 2) {
        timeHelper.getEndTime(tripTime, tripDuration, tripDurationMin)
        .then((trip_time) => {
            let values = [driverID, tripDate, tripDate, driverID, tripDate, tripTime, trip_time]
            connection.query("SELECT * FROM (SELECT TripID FROM (SELECT TripID, Trip_Date, DATE_ADD(Trip_Date, INTERVAL Duration DAY) AS End_Date FROM Trip WHERE Trip_Type=2 AND Driver_ID=?) AS T1 WHERE End_Date>=? AND Trip_Date<=?) AS A UNION SELECT * FROM (SELECT TripID FROM (SELECT TripID, Trip_Time, DATE_ADD(DATE_ADD(Trip_Time, INTERVAL Duration HOUR), INTERVAL Duration_Minute MINUTE) AS End_Time FROM Trip WHERE Trip_Type!=2 AND Driver_ID=? AND Trip_Date=?) AS T2 WHERE Trip_Time<=? AND End_Time>=?) AS B", values, (err, results) => {
                let temp;
                if (err) {
                    temp = {
                        status: "fail",
                        result: err
                    }
                } else {
                    temp = {
                        status: "success",
                        result: results
                    }
                }
                next(temp);
            });
        });
    } else {
        timeHelper.getEndDate(tripDate, tripDuration)
        .then((end_date) => {
            let values = [driverID, tripDate, end_date, driverID, tripDate, end_date]
            connection.query("SELECT * FROM (SELECT TripID FROM (SELECT TripID, Trip_Date, DATE_ADD(Trip_Date, INTERVAL Duration DAY) AS End_Date FROM Trip WHERE Trip_Type=2 AND Driver_ID=?) AS T1 WHERE End_Date>=? AND Trip_Date<=?) AS A UNION SELECT * FROM (SELECT TripID FROM Trip WHERE Driver_ID=? AND Trip_Date<=? AND Trip_Date>=?) AS B", values, (err, results) => {
                let temp;
                if (err) {
                    temp = {
                        status: "fail",
                        result: err
                    }
                } else {
                    temp = {
                        status: "success",
                        result: results
                    }
                }
                next(temp);
            });
        })
    }
}

exports.updateTrip = function (tripID, username, tripStatus, driverID, tripType, requestedDate, tripDate, tripTime, duration, durationMinute, purpose, onBehalf, start, end, startMileage, endMileage, next) {
    const values = [username, tripStatus, driverID, tripType, requestedDate, tripDate, tripTime, duration, durationMinute, purpose, onBehalf, start, end, startMileage, endMileage, tripID];

    var temp = null

    connection.query("UPDATE Trip SET Username = ?, Trip_Status = ?, Driver_ID = ?, Trip_Type = ?, Requested_Date = ?, Trip_Date = ?, Trip_Time = ?, Duration = ?, Duration_Minute = ?, Purpose = ?, OnBehalf = ?, Start = ?, End = ?, Start_Mileage = ?, End_Mileage = ? WHERE TripID =?", values, (err, result) => {
        if (err) {
            console.log(err);
    
            temp = {
                status: "fail",
                result: err
            }
        } else {
            temp = {
                status: 'success',
                result: result
            }
        }
    });

    next(temp);
}

exports.tripExists = function (tripID, next) {
    let temp = null;
    connection.query("SELECT COUNT(*) AS TripCount FROM Trip WHERE TripID=?", tripID, (err, result) => {
        if (err) {
            temp = {
                status: "fail",
                data: err
            }
        } else {
            if(parseInt(result[0].TripCount, 10) !== 0) {
                temp = {
                    status: "success",
                    data: true
                }
            } else {
                temp = {
                    status: "success",
                    data: false
                }
            }
        }

        next(temp);
    });
}

exports.generateReportData = function (driverList, typeList, statusList, startDate, endDate, next) {
    connection.query("SELECT * FROM Trip WHERE Driver_ID IN " + driverList +
    " AND Trip_Type IN " +  typeList + " AND Trip_Status IN " + statusList +
    " AND Trip_Date >= " + startDate + " AND Trip_Date <= " + endDate, (err, results) => {
        let temp;
        if (err) {
            temp = {
                status: "fail",
                result: err
            }
        } else {
            temp = {
                status: "success",
                result: results
            }
        }
        next(temp);
    });
}