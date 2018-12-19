var driver = require('../model/driver');
var trip = require('../model/trip');
var user = require('../model/user');
var timeHelper = require('../helper/time-helper');

module.exports.addLeave = function (req, res, next) {
    const leaveDateTemp = req.body.leaveDate;
    const leaveType = req.body.leaveType;
    const driverID = req.body.driverID;

    var leaveTime = [];

    const leaveDate = leaveDateTemp.map((date) => {
        leaveTime.push(null);
        return date;
    });

    if (parseInt(leaveType, 10) === 3) {
        leaveTime = [req.body.leaveTime];
    }

    driver.addDriverLeave(driverID, leaveDate, leaveTime, leaveType, response => {
        res.send(response);
    });
}

module.exports.getTripsForDriverDate = function (req, res, next) {
    const leaveDate = req.body.leaveDate;
    const driverID = req.body.driverID;

    var tripResponse = leaveDate.map((date) => {
        return trip.getOnDateForDriver(driverID, date);
    });

    let finalResponse = []

    Promise.all(tripResponse)
        .then(results => {
            results.forEach((result) => {
                result.data.forEach((data) => {
                    finalResponse.push(data);
                });
            });
            res.send({
                status: 'success',
                data: finalResponse
            });
        })
        .catch(result => {
            res.send(result);
        })
}

module.exports.viewLeave = function (req, res, next) {
    const driverID = req.params.driverID;
    const year = req.params.year;

    driver.viewDriverLeave(driverID, year, (response) => {
        res.send(response);
    })
}

module.exports.deleteLeave = function (req, res, next) {
    const driverID = req.body.driverID;
    const leaveDate = new Date(req.body.leaveDate);

    const tempDate = leaveDate.getFullYear()+'-'+(leaveDate.getMonth()+1)+'-'+leaveDate.getDate();

    driver.deleteDriverLeave(driverID, tempDate, (response) => {
        res.send(response);
    });
}

module.exports.checkDriverAvailablity = function (req, res, next) {
    let availableDrivers = [];
    let returnDrivers = [];
    timeHelper.getEndTime(req.body.startTime, req.body.durationHrs, req.body.durationMins)
        .then((endTime) => {
            for (let i = 1; i < 4; i++) {
                const tripDate = new Date(req.body.tripDate);
                let temp = tripDate.getFullYear()+'-'+(tripDate.getMonth()+1)+'-'+tripDate.getDate();
                availableDrivers.push(
                    driver.checkDriverAvailability(i, tripDate, req.body.startTime, endTime)
                );
            }
            Promise.all(availableDrivers).then((drivers) => {
                drivers.forEach((tripCount, index) => {
                    if (tripCount.result === 0) returnDrivers.push(index + 1);
                });;
                res.send(returnDrivers);
            }).catch((error) => {
                console.log(error);
                res.send(error);
            })
        })
        .catch(error => {
            console.log(error);
        })
}

module.exports.isDriverOnLeave = function (req, res, next) {
    driver.isDriverOnLeave(req.body.driverID, req.body.tripDate, req.body.tripStartTime, req.body.duration, req.body.durationMins, (leaveCount) => {
        if(leaveCount.status === "success") {
            if (leaveCount.result === 0) {
                res.send({
                    status: "success",
                    isOnLeave: false
                });
            } else {
                res.send({
                    status: "success",
                    isOnLeave: true
                });
            }
        } else {
            res.send({
                status: "fail"
            });
        }
    });
}

module.exports.getDriverBlockStatus = function (req, res, next) {
    user.getUsersRole(3, (users) => {
        if(users.status === "success") {
            let driverIDs = [];
            users.result.forEach((driverDetail) => {
                driverIDs.push(driverDetail.Username);
            });

            driver.getDriverBlockedStatus(driverIDs, (result) => {
                if (result.status === "success") {
                    res.send({
                        status: "success",
                        result: result.result
                    });
                } else {
                    res.send({
                        status: "fail",
                        result: result.result
                    })
                }
            })
        }
    })
}

module.exports.getDriverBlockHistory = function (req, res, next) {
    driver.getDriverBlockedHistory((result) => {
        res.send(result);
    });
}

module.exports.getCurrentResidentDriver = function (req, res, next) {
    const curDate = new Date();

    driver.getCurrentResidentDriver(curDate.getFullYear(), curDate.getMonth()+1, result => {
        if (result.status === "success") {
            res.send(result);
        } else {
            res.send({
                status: "success",
                result: result.result
            })
        }
    });
}

module.exports.getResidentDriverHistory = function (req, res, next) {
    driver.getResidentDriverHistory((history) => {
        res.send(history);
    });
}

module.exports.setDriverBlockStatus = function (req, res, next) {
    driver.saveDriverBlock(req.body.driverID, new Date(), req.body.blocked, response => {
        res.send(response);
    });
}

module.exports.setResidentDriver = function (req, res, next) {
    const curDate = new Date();
    driver.saveResidentDriver(req.body.driverID, curDate, response => {
        res.send(response);
    });
}