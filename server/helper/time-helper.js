module.exports.getEndTime = function (startTime, durationHrs, durationMins) {
    return new Promise((resolve, reject) => {
        var endTime;
        var endHours = parseInt(startTime.slice(0, 2), 10) + parseInt(durationHrs, 10);
        var endMins = parseInt(startTime.slice(), 10) + parseInt(durationMins, 10);
        
        if (endHours.toString().length === 1) {
            endTime = '0' + endHours + ':';
        } else {
            endTime = endHours + ':';
        }

        if (endMins.toString().length === 1) {
            endTime = endTime + '0' + endMins;
        } else {
            endTime = endTime + endMins;
        }
        resolve(endTime);
    });
}

module.exports.getEndDate = function (startDateParam, duration) {
    return new Promise((resolve, reject) => {
        let startDate = new Date(startDateParam);
        let endDate = new Date();

        console.log("Start ", startDate.getDate(), duration, parseInt(startDate.getDate(), 10) + parseInt(duration, 10));

        endDate.setFullYear(startDate.getFullYear());
        endDate.setMonth(startDate.getMonth());
        endDate.setDate(parseInt(startDate.getDate(), 10) + parseInt(duration, 10));

        resolve(endDate);
    });
}