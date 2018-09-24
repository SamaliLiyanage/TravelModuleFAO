var db = require('../db.js');
const connection = db.connection;

exports.addDriverLeave = function(driverID, leaveDate, leaveTime, next){
    let values = "";
    if (leaveTime[0]===null){ // No times given
        leaveDate.forEach((date, index) => {
            (index===(leaveDate.length-1))?
            values += ("("+driverID+", \'"+date+"\',NULL)"):
            values += ("("+driverID+",\'"+date+"\',NULL),");
            console.log("Date ", date)
        });
    } else {
        leaveDate.forEach((date, index) => {
            (index===(leaveDate.length-1))?
            values += ("("+driverID+", \'"+date+"\', \'"+leaveTime[index]+"\')"):
            values += ("("+driverID+", \'"+date+"\', \'"+leaveTime[index]+"\'),");
            console.log("Date ", date)
        });
    }

    console.log(values);
    
    connection.query("INSERT INTO DriverLeave (Driver_ID, LeaveDate, LeaveTime) VALUES"+values,(err, result) => {
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
    connection.query('SELECT * FROM DriverLeave WHERE Driver_ID=? AND YEAR(LeaveDate)=?',[driverID, year], (err, results) => {
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