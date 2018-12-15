var timeHelper = require('../helper/time-helper');
var db = require('../db.js');
const connection = db.connection;

exports.addDriverLeave = function(driverID, leaveDate, leaveTime, leaveType, next){
    let values = "";
    if (leaveTime[0]===null){ // No times given
        leaveDate.forEach((date, index) => {
            (index===(leaveDate.length-1))?
            values += ("(\'"+driverID+"\', \'"+date+"\',NULL,"+leaveType+")"):
            values += ("(\'"+driverID+"\',\'"+date+"\',NULL,"+leaveType+"),");
        });
    } else {
        leaveDate.forEach((date, index) => {
            (index===(leaveDate.length-1))?
            values += ("(\'"+driverID+"\', \'"+date+"\', \'"+leaveTime[index]+"\',"+leaveType+")"):
            values += ("(\'"+driverID+"\', \'"+date+"\', \'"+leaveTime[index]+"\',"+leaveType+"),");
        });
    }
    connection.query("INSERT INTO DriverLeave (Driver_ID, LeaveDate, LeaveTime, LeaveType) VALUES"+values,(err, result) => {
        var temp;
        if(err){
            console.log(err)
            temp = {
                status: "fail",
                data: err
            }
        } else {
            console.log(result)
            temp = {
                status: "success",
                data: result
            }
        }
        next(temp);
    });
}

exports.viewDriverLeave = function(driverID, year, next) {
    const values = [driverID, year];
    console.log(driverID);
    connection.query('SELECT * FROM DriverLeave WHERE Driver_ID=? AND YEAR(LeaveDate)=?',values, (err, results) => {
        var temp;
        if (err) {
            temp = {
                status: 'fail',
                data: err
            }
        } else {
            temp = {
                status: 'success',
                data: results
            }
        }

        next (temp);
    });
}

exports.deleteDriverLeave = function(driverID, leaveDate, next){
    const values = [driverID, leaveDate];

    connection.query('DELETE FROM DriverLeave WHERE Driver_ID=? AND LeaveDate=?', values, (err, result) => {
        var temp;
        if (err) {
            temp = {
                status: 'fail',
                data: err
            }
        } else {
            temp = {
                status: 'success',
                data: result
            }
        }
        next (temp);
    });
}

exports.checkDriverAvailability = function (driverID, date, startTime, endTime) {
    return new Promise ((resolve, reject) => {
        const values = [date, driverID, endTime, startTime];
        var temp;
        db.connection.query('SELECT COUNT(*) AS TripCount FROM (SELECT TripID, Trip_Time, Driver_ID, Duration, Duration_Minute, DATE_ADD(DATE_ADD(Trip_Time, INTERVAL Duration HOUR), INTERVAL Duration_Minute MINUTE) AS End_Time FROM Trip WHERE Trip_Date=? AND Driver_ID=?) AS T WHERE (Trip_Time<? AND End_Time>?)', values, function (err, results) {
            if (err) {
                console.log(err);
                temp = {
                    status: 'fail'
                };
                reject(temp)
            } else {
                temp = {
                    status: 'success',
                    result: results[0].TripCount
                }
                resolve(temp)
            }
        });
    })
}

exports.isDriverOnLeave = function (driverID, tripDate, tripStartTime, tripType, duration, duration_minute, next) {
    if (parseInt(tripType, 10) !== 2) {
        timeHelper.getEndTime(tripStartTime, duration, duration_minute)
        .then(tripEndTime => {
            let values = [driverID, tripDate, tripEndTime, tripStartTime];
            let temp;
            connection.query("SELECT COUNT(*) AS LeaveCount FROM (SELECT Driver_ID, LeaveDate, LeaveTime AS LeaveStartTime, LeaveType, DATE_ADD(LeaveTime, INTERVAL 4 HOUR) AS LeaveEndTime FROM DriverLeave) AS D WHERE Driver_ID=? AND LeaveDate = ? AND ((LeaveType!=3) OR (LeaveType=3 AND (D.LeaveStartTime <= ? AND D.LeaveEndTime >= ?)))", values, (err, result) => {
                if (err) {
                    console.log(err);
                    temp = {
                        status: 'fail',
                        result: err
                    }
                } else {
                    temp = {
                        status: 'success',
                        result: result[0].LeaveCount
                    }
                }
                next(temp);
            });
        })
        .catch((error) => {
            console.log(error);
        })
    }
}