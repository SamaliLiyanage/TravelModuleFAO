var trip = require('../model/trip');
var user = require('../model/user');
var tapApi = require('tap-telco-api');
var cron = require('node-cron');
var emailHelper = require('../helper/email-helper');
var mobileHelper = require('../helper/mobile-helper');
var messagingResponse = require('twilio').twiml.MessagingResponse;

function DriverName(driverNo) {
  var driver = parseInt(driverNo, 10);
  if (driver === 1) {
    return 'Anthony';
  } else if (driver === 2) {
    return 'Ruchira';
  } else if (driver === 3) {
    return 'Dinesh';
  }
}

//Insert details on new trip
module.exports.newTrip = function (req, res, next) {
  let results = {
    tripNo: req.body.tripID,
    details: []
  };
  user.newGetUser(req.body.username, userDetails => {
    // Insert details about new trip
    trip.newTrip(req.body.tripID, userDetails[0].Username, req.body.tripType, req.body.tripDate, req.body.tripTime, req.body.tripDuration, req.body.tripDurationMin, req.body.tripPurpose, req.body.onBehalf, (response) => {
      // If the above is successful continue
      if (req.body.onBehalf === true) {
        // If trip is made on behalf of someone
        user.onBehalfUser(req.body.tripID, req.body.obName, req.body.obEmail, req.body.obMobile, respon => {
          var destinationList = '';
          req.body.destinations.forEach((destination, index) => {
            (index < (req.body.destinations.length - 1)) ?
              destinationList += (' ' + destination + ', ' + req.body.destinationTowns[index] + '\n') :
              destinationList += (' ' + destination + ', ' + req.body.destinationTowns[index])
          });
          var obUser = '<ul><li>Trip ID:' + req.body.tripID +
            '</li><li>Username: ' + req.body.username +
            '</li><li>Trip Date: ' + req.body.tripDate +
            '</li><li>Trip Time: ' + req.body.tripTime +
            '</li><li>Destination: ' + destinationList +
            '</li><li>Purpose: ' + req.body.tripPurpose +
            '</li></ul>';
          emailHelper.sendMessage(
            req.body.obEmail,
            'Trip Request ' + req.body.tripID,
            obUser,
            true
          );
          //console.log(respon)
        })
      }
      results.details.push({ trip: response });
      // Insert destination details
      trip.addDestinations(req.body.tripID, req.body.destinations, req.body.destinationTowns, response => {
        //console.log(response);
        results.details.push({ destinations: response });

        // Send mail and sms if all successful to travel manager

        var destinationList = '';
        req.body.destinations.forEach((destination, index) => {
          (index < (req.body.destinations.length - 1)) ?
            destinationList += (' ' + destination + ', ' + req.body.destinationTowns[index] + '\n') :
            destinationList += (' ' + destination + ', ' + req.body.destinationTowns[index])
        });

        let fRemark = req.body.furtherRmrks;
        let fRHTML = ''
        if (req.body.outsideOfficeHours) {
          fRemark = fRemark + ' || Trip OUTSIDE office hours.';
        }
        if (!(fRemark === "")) {
          fRHTML = '</li><li>Further remarks: '
        }

        var mailMgr = '<ul><li>Trip ID:' + req.body.tripID +
          '</li><li>Name: ' + userDetails[0].Full_Name +
          '</li><li>Trip Type: ' + req.body.tripType +
          '</li><li>Trip Date: ' + req.body.tripDate +
          '</li><li>Trip Time: ' + req.body.tripTime +
          '</li><li>Destination: ' + destinationList +
          '</li><li>Purpose: ' + req.body.tripPurpose +
          fRHTML +
          '</li></ul>';
        emailHelper.sendMessage(
          'samali.liyanage93@gmail.com',
          'Trip Request ' + req.body.tripID,
          mailMgr,
          true
        );

        emailHelper.sendMessage(
          userDetails[0].Username,
          'Trip Request ' + req.body.tripID,
          mailMgr,
          true
        );

        var smsMessage = userDetails[0].Full_Name + " has requested a trip with Trip ID: " + req.body.tripID;
        user.getUsersRole(5, mgrs => {
          mgrs.result.forEach(mgr => {
            mobileHelper.sendMessage("94" + mgr.Mobile_No, smsMessage);
          });
        });

        res.send(results);
      });
      if (parseInt(req.body.budgetingEntity, 10) === 2) {
        trip.setBudgetingEntity(req.body.tripID, req.body.projectNumber, response => {
          //console.log(response);
        })
      }
      if ((!(req.body.furtherRmrks === "")) || req.body.outsideOfficeHours) {
        let furtherRmrk = req.body.furtherRmrks;
        if (req.body.outsideOfficeHours) {
          furtherRmrk = furtherRmrk + ' || Trip OUTSIDE office hours.';
        }
        trip.addFurtherComments(req.body.tripID, furtherRmrk);
        trip.changeStatus(req.body.tripID, 6, response => {
          //res.send(response);
        })
      }
      let month = new Date(req.body.tripDate)
      if ((req.body.furtherRmrks === "") && (parseInt(req.body.tripType, 10) !== 2) && (req.body.cabRequested === false)) {
        trip.countMonthlyTrips(month.getMonth() + 1, req.body.tripType)
          .then(function (response) {
            const result = response.result;
            const ordered_driver_index = Array.from(Array(result.length).keys())
              .sort((a, b) => result[a] < result[b] ? -1 : (result[a] > result[b] ? 1 : 0));
            let index = 0;
            process(ordered_driver_index, index, req.body.tripTime, req.body.tripDuration, req.body.tripDate, req.body.tripID, userDetails[0].Username, res);
          })
          .catch(function (error) {
            console.log(error);
          })
      } else if (req.body.cabRequested === true) {
        trip.assignDriver(req.body.tripID, 'cab', 5, response => {
          //console.log(response);
        })
      }
    });
  })
}

//Get all trips
module.exports.allTrips = function (req, res, next) {
  trip.allTrips(res);
}

//Get the last index which will actually return the next index
module.exports.getLastIndex = function (req, res, next) {
  trip.getLastIndex(res);
}

//Get all of the trips of the user with the given trip ID
module.exports.userTrips = function (req, res, next) {
  trip.userTrips(req.params.id, res);
}

//Assign a driver for the given driver ID and change the status
module.exports.assignDriver = function (req, res, next) {
  trip.assignDriver(req.body.tripID, req.body.driverID, req.body.tripStatus, response => {
    res.send(response);
  });

  var text = null;
  var smsMessage = null;

  if (req.body.driverID === 'cab') {
    smsMessage = "A cab has been assigned to your trip with Trip ID: " + req.body.tripID;
    text = 'A cab has been assigned to your trip with Trip ID: ' + req.body.tripID;
  } else if (req.body.driverID != '0') {
    smsMessage = DriverName(req.body.driverID) + " has been assigned to your trip with Trip ID: " + req.body.tripID;
    text = DriverName(req.body.driverID) + ' has been assigned to your trip with Trip ID: ' + req.body.tripID;
  }

  trip.getFullTripDetail(req.body.tripID, (detail) => {
    if (req.body.driverID != '0') {
      emailHelper.sendMessage(
        detail.User.Username,
        'Trip Request ' + req.body.tripID,
        text,
        false
      );
      mobileHelper.sendMessage("94" + req.body.Mobile_No, smsMessage);
    };
  });
}

//Get the details of the given trip
module.exports.getTrip = function (req, res, next) {
  trip.getTrip(req.params.tripID, response => {
    res.send(response);
  });
}

//Get all further requests 
module.exports.getAllFurtherRequests = function (req, res) {
  trip.getFurtherComments(response => {
    res.send(response);
  })
}

//Get further comments for given trip ID
module.exports.getFurtherRequest = function (req, res) {
  trip.getFurtherComment(req.params.tripID, response => {
    res.send(response);
  })
}

//Set the approval for the further remarks/requests
module.exports.setApproval = function (req, res) {
  var text = null;
  var smsMessage = null;

  if (req.body.approve === true) {
    text = "Your further requests for the above trip have been APPROVED by the Travel Administrator.";
    smsMessage = "Your further requests for the trip with Trip ID: " + req.body.tripID + " have been APPROVED by the Travel Administrator.";
  } else {
    text = "Your further requests for the above trip have been DENIED by the Travel Administrator.";
    smsMessage = "Your further requests for the trip with Trip ID: " + req.body.tripID + " have been DENIED by the Travel Administrator.";
  }

  trip.changeComments(req.body.tripID, req.body.comment, response => {
    trip.getFullTripDetail(req.body.tripID, detail => {
      emailHelper.sendMessage(
        detail.User.Username,
        'Trip Request ' + req.body.tripID,
        text,
        false
      );

      mobileHelper.sendMessage("94" + detail.User.Mobile_No, smsMessage);
    });

    trip.getTrip(req.body.tripID, response => {
      const data = response.data;
      trip.countMonthlyTrips(data.Trip_Date.getMonth() + 1, data.Trip_Type)
        .then(function (respo) {
          const result = respo.result;
          const ordered_driver_index = Array.from(Array(result.length).keys())
            .sort((a, b) => result[a] < result[b] ? -1 : (result[a] > result[b] ? 1 : 0));
          let index = 0;
          process(ordered_driver_index, index, data.Trip_Time, data.Duration, data.Trip_Date, data.TripID, res);
        })
        .catch(function (error) {
          console.log(error);
        })
    });

    //res.send(response);
  })

  trip.changeStatus(req.body.tripID, 1, response => {
    //console.log(response);
  })
}

//Send mobile response 
module.exports.sendMobileResponse = function (req, res, next) {
  res.send(tapApi.sms.successResponse);
  next();
}

//Trip start and end
module.exports.setTripStatus = function (req, res) {
  const message = req.body.Body;
  var state, tripID, mileage;
  console.log(message);
  var twiml = new messagingResponse();

  [state, tripID, mileage] = message.split(" ");
  state = state.substr(0, 1).toUpperCase() + state.slice(1).toLowerCase();

  trip.getTripStatus(tripID, response => {
    if (state === 'Start') {
      if ((response.End === null) && (response.Start === null)) {
        trip.setTripStatus(tripID, state, mileage, 3, resp => {
          console.log(resp);
          twiml.message('Successfully recorded trip start');
          //res.send(resp);
        })
      } else {
        twiml.message('Error in format of text message');
        //res.send({ status: 'fail' });
      }
    } else if (state === 'End') {
      if ((response.Start !== null) && (response.End === null)) {
        trip.setTripStatus(tripID, state, mileage, 4, resp => {
          console.log(resp);
          twiml.message('Successfully recorded trip end');
          //res.send(resp);
        })
      } else {
        twiml.message('Error in format of text message');
        //res.send({ status: 'fail' });
      }
    } else {
      twiml.message('Error in format of text message');
      //res.send({ status: 'fail' });
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  })
}

module.exports.getDestinations = function (req, res) {
  trip.getDestinations(req.params.tripID, response => {
    res.send(response);
  })
}

module.exports.getBudgetEntity = function (req, res) {
  trip.getBudgetingEntity(req.params.tripID, response => {
    res.send(response);
  })
}

function process(ordered_driver_index, index, tripTime, tripDuration, tripDate, tripID, userName, res) {
  if (index >= ordered_driver_index.length) {
    trip.assignDriver(tripID, 'cab', 5, response => {
      smsMessage = "A cab has been assigned to your trip with Trip ID: " + tripID;
      text = 'A cab has been assigned to your trip with Trip ID: ' + tripID;

      user.newGetUser(userName, userDetails => {
        emailHelper.sendMessage(
          userDetails[0].Username,
          'Trip Request ' + tripID,
          text,
          false
        );
        mobileHelper.sendMessage("94" + userDetails[0].Mobile_No, smsMessage);
      })

      return (response);
    });
  } else {
    var endTime = parseInt(tripTime.slice(0, 2), 10) + parseInt(tripDuration, 10);
    if (endTime.toString().length === 1) {
      endTime = '0' + endTime + tripTime.slice(-3);
    } else {
      endTime = endTime + tripTime.slice(-3);
    }

    trip.checkDriverAvailability(ordered_driver_index[index] + 1, tripDate, tripTime, endTime, response => {
      //console.log("time", tripTime, endTime);
      if (response.status === 'success' && response.result === 0) {
        trip.assignDriver(tripID, ordered_driver_index[index] + 1, 2, response => {
          if (response.status === 'success') {

            var text = null;
            var smsMessage = null;

            if (ordered_driver_index[index] + 1 != '0') {
              smsMessage = DriverName(ordered_driver_index[index] + 1) + " has been assigned to your trip with Trip ID: " + tripID;
              text = DriverName(ordered_driver_index[index] + 1) + ' has been assigned to your trip with Trip ID: ' + tripID;
            }
            if (ordered_driver_index[index] + 1 !== 0) {
              user.newGetUser(userName, userDetails => {
                emailHelper.sendMessage(
                  userDetails[0].Username,
                  'Trip Request ' + tripID,
                  text,
                  false
                );
                mobileHelper.sendMessage("94" + userDetails[0].Mobile_No, smsMessage);
              });
            }

            return (response);
          }
        })
      } else {
        process(ordered_driver_index, index + 1, tripTime, tripDuration, tripDate, tripID, userName, res);
      }
    })
  }
}

module.exports.cancelTrip = function (req, res, next) {
  trip.cancelTrip(req.body.tripID)
    .then(function (response) {
      if (response.status === 'success') {
        res.send(response);
      } else {
        res.send(response);
      }
    })
    .catch(function (error) {
      console.log(error);
    })
}

cron.schedule("* * * * *", function () {

  trip.checkNotStarted(res => {
    res.result.forEach(element => {

      emailHelper.sendMessage(
        element.Username,
        'Reminder for ' + element.TripID,
        'Your trip with the above number has not started. Please cancel the trip or contact the Travel Manager.',
        false
      );

      mobileHelper.sendMessage(
        "94" + element.Mobile_No,
        "Your trip with the number" + element.TripID + " has not started. Please cancel the trip or contact the Travel Manager."
      );

      user.getUsersRole(5, respo => {
        respo.result.forEach(manager => {
          emailHelper.sendMessage(
            manager.Username,
            'Reminder for ' + element.TripID,
            'The trip with the above number has not started. Please cancel the trip.',
            false
          );

          mobileHelper.sendMessage(
            "94" + manager.Mobile_No,
            "Trip with the number" + element.TripID + " has not started. Please cancel the trip."
          );
        });
      });
    });
  });

  trip.checkOngoing(res => {
    res.result.forEach(element => {
      emailHelper.sendMessage(
        element.Username,
        'Reminder for ' + element.TripID,
        'You only have 30 minutes left in the allocated time for your trip with the above Trip ID.',
        false
      );

      mobileHelper.sendMessage(
        "94" + element.Mobile_No,
        "You only have 30 minutes left in the allocated time for your trip with the Trip ID " + element.TripID
      );

      user.getUser("driver" + element.Driver_ID + "@fao.org", response => {
        mobileHelper.sendMessage(
          "94" + response.Mobile_No,
          "You only have 30 minutes left in the allocated time for your current trip with the Trip ID " + element.TripID
        );
      });
    });
  });
})

//testing controllers
module.exports.testMobile = function (req, res) {
  //mobileHelper.getMessage();
  return res.send({ name: "sam" });
}

module.exports.driverAvailability = function (req, res) {
  trip.checkDriverAvailability(req.body.driverID, req.body.tripDate, req.body.tripStart, req.body.endTime, response => {
    if (response.status === 'success' && response.result === 0) {
      trip.assignDriver(req.body.tripID, req.body.driverID, req.body.tripStatus, response => {
        return res.send(response);
      })
    }
  })
}