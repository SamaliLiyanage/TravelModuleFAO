var trip = require('../model/trip');
var user = require('../model/user');
var driver = require('../model/driver');
var cron = require('node-cron');
var emailHelper = require('../helper/email-helper');
var mobileHelper = require('../helper/mobile-helper');
var selectionHelper = require('../helper/selection-helper');

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
      if (response.status === "fail") {
        return res.send({ status: "fail" })
      }
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

        // Send Email and SMS to Travel Requester
        var mailMgr = '<ul><li>Trip ID:' + req.body.tripID +
          '</li><li>Name: ' + userDetails[0].Full_Name +
          '</li><li>Trip Type: ' + selectionHelper.tripType(req.body.tripType) +
          '</li><li>Trip Date: ' + req.body.tripDate +
          '</li><li>Trip Time: ' + req.body.tripTime +
          '</li><li>Destination: ' + destinationList +
          '</li><li>Purpose: ' + req.body.tripPurpose +
          fRHTML +
          '</li></ul>';

        emailHelper.sendMessage(
          userDetails[0].Username,
          'Trip Request ' + req.body.tripID,
          mailMgr,
          true
        );

        // Email and SMS to Travel Manager
        var smsMessage = userDetails[0].Full_Name + " has requested a trip with Trip ID: " + req.body.tripID;
        user.getUsersRole(2, mgrs => {
          mgrs.result.forEach(mgr => {
            emailHelper.sendMessage(
              mgr.Username,
              'Trip Request ' + req.body.tripID,
              mailMgr,
              true
            );

            mobileHelper.sendMessage("94" + mgr.Mobile_No, smsMessage, (result) => {
              console.log(result);
            });
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
      if ((req.body.furtherRmrks === "") && (req.body.cabRequested === false)) {
        user.getUsersRole(3, driversDetails => {
          let driverList = driversDetails.result.map((driverDetail) => {
            return driverDetail.Username;
          });
          trip.countMonthlyTripsForAvailableDrivers(month.getFullYear(), month.getMonth() + 1, req.body.tripType, driverList)
            .then(function (response) {
              const monthList = response.result;

              let sortableDriverList = [];
              let sortedDriverList = [];

              for (let driver in driverList) {
                if (monthList[driverList[driver]] != null) {
                    sortableDriverList.push([driverList[driver], monthList[driverList[driver]]]);
                  }
              }

              sortableDriverList.sort(function (a, b) {
                return a[1] - b[1];
              })

              sortableDriverList.forEach((driverDetail) => {
                sortedDriverList.push(driverDetail[0]);
              })

              console.log("Lists ", sortableDriverList, sortedDriverList);

              let index = 0;
              process(sortedDriverList, index, req.body.tripTime, req.body.tripType, req.body.tripDuration, req.body.tripDurationMin, req.body.tripDate, req.body.tripID, userDetails[0].Username, res);
            })
            .catch(function (error) {
              console.log(error);
            })
        });
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
  trip.consolidatedRequested(req.body.tripID, tripDetail => {
    trip.assignDriver(req.body.tripID, req.body.driverID, req.body.tripStatus, response => {
      if (tripDetail.driverID != '0' && tripDetail.driverID != 'cab') {
        emailHelper.sendMessage(
          tripDetail.driverID,
          'Trip Request ' + req.body.tripID,
          "You have been removed from your trip with Trip ID: " + req.body.tripID,
          false
        );
      }
      res.send(response);
    });
  
    var text = null;
    var smsMessage = null;
  
    switch (req.body.driverID) {
      case '0', '1', '2', '3', 'cab':
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
              detail.data.Username,
              'Trip Request ' + req.body.tripID,
              text,
              false
            );
            mobileHelper.sendMessage("94" + req.body.Mobile_No, smsMessage, result => {
              console.log(result);
            });
          };
        });
  
        break;
  
      default:
        user.getUser(req.body.driverID, driverDetail => {
          smsMessage = driverDetail.result[0].Full_Name.split(" ")[0] + " has been assigned to your trip with Trip ID: " + req.body.tripID;
          text = driverDetail.result[0].Full_Name.split(" ")[0] + ' has been assigned to your trip with Trip ID: ' + req.body.tripID;
  
          trip.getFullTripDetail(req.body.tripID, (detail) => {
            if (req.body.driverID != '0') {
              //Send message to travel requester
              emailHelper.sendMessage(
                detail.data.Username,
                'Trip Request ' + req.body.tripID,
                text,
                false
              );
              mobileHelper.sendMessage("94" + req.body.Mobile_No, smsMessage, result => {
                console.log(result);
              });
  
              //Send message to driver
              user.newGetUser(detail.data.Username, (requester) => {
                emailHelper.sendMessage(
                  driverDetail.result[0].Username,
                  'Trip Request ' + req.body.tripID,
                  "You have been assigned to " + requester[0].Full_Name + "\'s trip with Trip ID " + req.body.tripID,
                  false
                );
              });
            };
          });
        });
        break;
    }
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
        detail.data.Username,
        'Trip Request ' + req.body.tripID,
        text,
        false
      );

      mobileHelper.sendMessage("94" + detail.data.Mobile_No, smsMessage, result => {
        console.log(result);
      });

      user.getUsersRole(3, driverDetails => {
        let driverList = driverDetails.result.map((driverDetail) => {
          return driverDetail.Username;
        });
        const month = new Date(detail.data.Trip_Date);
        trip.countMonthlyTripsForAvailableDrivers(month.getFullYear(), month.getMonth() + 1, detail.data.Trip_Type, driverList)
          .then(function (respo) {
            const monthList = respo.result;

            let sortableDriverList = [];
            let sortedDriverList = [];

            for (let driver in driverList) {
                if (monthList[driverList[driver]] != null) {
                  sortableDriverList.push([driverList[driver], monthList[driverList[driver]]]);
                }
            }

            sortableDriverList.sort(function (a, b) {
              return a[1] - b[1];
            })

            sortableDriverList.forEach((driverDetail) => {
              sortedDriverList.push(driverDetail[0]);
            })

            console.log("Lists ", sortableDriverList, sortedDriverList);

            let index = 0;
            process(sortedDriverList, index, detail.data.Trip_Time, detail.data.Trip_Type, detail.data.Duration, detail.data.Duration_Minute, detail.data.Trip_Date, detail.data.TripID, detail.data.Username, res);
          })
          .catch(function (error) {
            console.log(error);
          })
      });

    });
    //res.send(response);
  })

  trip.changeStatus(req.body.tripID, 1, response => {
    //console.log(response);
  })
}

//Trip start and end
module.exports.fetchStatus = function (req, res) {
  const message = req.body.response.trim();
  var state, tripID, mileage;
  console.log(message);

  [state, tripID, mileage] = message.split(" ");
  state = state.substr(0, 1).toUpperCase() + state.slice(1).toLowerCase();

  trip.getTripStatus(tripID, response => {
    if (state === 'Start') {
      if ((response.End === null) && (response.Start === null)) {
        trip.setTripStatus(tripID, state, mileage, 3, resp => {
          console.log(resp);
          mobileHelper.sendMessage('Successfully recorded trip start', req.body.source, result => {
            res.send(result);
          });
        })
      } else {
        mobileHelper.sendMessage('Error in format of text message', req.body.source, result => {
          res.send(result);
        });
      }
    } else if (state === 'End') {
      if ((response.Start !== null) && (response.End === null)) {
        trip.setTripStatus(tripID, state, mileage, 4, resp => {
          console.log(resp);
          mobileHelper.sendMessage(req.body.source, 'Successfully recorded trip end', result => {
            res.send(result);
          });
        })
      } else {
        mobileHelper.sendMessage(req.body.source, 'Error in format of text message', result => {
          res.send(result);
        });
      }
    } else {
      mobileHelper.sendMessage(req.body.source, 'Error in format of text message', result => {
        res.send(result);
      });
    }
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

function process(ordered_driver_index, index, tripTime, tripType, tripDuration, tripDurationMin, tripDate, tripID, userName, res) {
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
        mobileHelper.sendMessage("94" + userDetails[0].Mobile_No, smsMessage, result => {
          console.log(result);
        });
      })

      return (response);
    });
  } else {
    trip.checkDriverAvailabilityAllTypes(ordered_driver_index[index], tripDate, tripTime, tripType, tripDuration, tripDurationMin, response => {
      if (response.status === 'success' && response.result === 0) {
        //check if the driver is on leave
        driver.isDriverOnLeave(ordered_driver_index[index], tripDate, tripTime, tripDuration, tripDurationMin, driverLeaveCount => {
          //if the driver is not on leave assign them to trip
          if (driverLeaveCount.status === 'success' && driverLeaveCount.result === 0) {
            trip.assignDriver(tripID, ordered_driver_index[index], 2, response => {
              if (response.status === 'success') {

                var text = null;
                var smsMessage = null;
                var driverMessage = null;

                user.newGetUser(ordered_driver_index[index], tripDriverDetail => {
                  if (ordered_driver_index[index] != '0') {
                    smsMessage = tripDriverDetail[0].Full_Name.split(" ")[0] + " has been assigned to your trip with Trip ID: " + tripID;
                    text = tripDriverDetail[0].Full_Name.split(" ")[0] + ' has been assigned to your trip with Trip ID: ' + tripID;
                    //Send emails to travel requester
                    user.newGetUser(userName, userDetails => {
                      emailHelper.sendMessage(
                        userDetails[0].Username,
                        'Trip Request ' + tripID,
                        text,
                        false
                      );
                      mobileHelper.sendMessage("94" + userDetails[0].Mobile_No, smsMessage, result => {
                        console.log(result);
                      });

                      //Send emails to driver
                      trip.getDestinations(tripID, result => {
                        console.log(result);
                        let destinationList = "";
                        result.data.forEach((destination, index) => {
                          (index < (result.data.length - 1)) ?
                            destinationList += (' ' + destination.Destination + ', ' + destination.Destination_Town+ '\n') :
                            destinationList += (' ' + destination.Destination + ', ' + destination.Destination_Town)
                        });

                        driverMessage = 'You have been assigned to the following trip: <ul><li>Trip ID:' + tripID +
                        '</li><li>Username: ' + userDetails[0].Full_Name +
                        '</li><li>Trip Date: ' + tripDate +
                        '</li><li>Trip Time: ' + tripTime +
                        '</li><li>Destination: ' + destinationList +
                        '</li></ul>';

                        emailHelper.sendMessage(
                          tripDriverDetail[0].Username,
                          'Trip Request ' + tripID,
                          driverMessage,
                          true
                        );
                        mobileHelper.sendMessage(
                          "94" + tripDriverDetail[0].Mobile_No,
                          "You have been assigned to " + userDetails[0].Full_Name + "\'s trip with Trip ID: " + tripID,
                          result => {console.log(result)}
                        );
                      });
                    });
                  }
                });

                return (response);
              }
            })
          } else if (driverLeaveCount.status === 'success' && driverLeaveCount.result !== 0){
            // if the driver is on leave move on to next driver
            process(ordered_driver_index, index + 1, tripTime, tripType, tripDuration, tripDurationMin, tripDate, tripID, userName, res);    
          }
        });
      } else {
        process(ordered_driver_index, index + 1, tripTime, tripType, tripDuration, tripDurationMin, tripDate, tripID, userName, res);
      }
    })
  }
}

module.exports.cancelTrip = function (req, res, next) {
  trip.consolidatedRequested(req.body.tripID, (detail) => {
    trip.cancelTrip(req.body.tripID)
      .then(function (response) {
        if (response.status === 'success') {
          const message = "Trip with the Trip ID " + req.body.tripID + " has been cancelled";
          const subject = "Trip Request " + req.body.tripID;

          // Email and SMS to Traveller
          emailHelper.sendMessage(
            detail.username,
            subject,
            message,
            false
          );

          mobileHelper.sendMessage(
            "94" + detail.mobileNumber,
            message,
            (msgResult) => { console.log(msgResult) }
          );

          // Send messages to driver if driver has been assigned
          if (detail.driverID !== '0' && detail.driverID !== 'cab') {
            user.newGetUser(detail.driverID, driverDetails => {
              emailHelper.sendMessage(
                detail.driverID,
                subject,
                message,
                false
              );

              mobileHelper.sendMessage(
                "94" + driverDetails[0].Mobile_No,
                message,
                (driverMsgReslt) => { console.log(driverMsgReslt) }
              );
            });
          }


          // Send message to managers indicating that a trip has been cancelled
          user.getUsersRole(2, (result) => {
            if (result.status === "success") {
              result.result.forEach((manager) => {
                emailHelper.sendMessage(
                  manager.Username,
                  subject,
                  message,
                  false
                );

                mobileHelper.sendMessage(
                  "94" + manager.Mobile_No,
                  message,
                  (msgResult) => { console.log(msgResult) }
                );
              });
            }
          });

          res.send(response);
        } else {
          res.send(response);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
  });
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
        "Your trip with the number" + element.TripID + " has not started. Please cancel the trip or contact the Travel Manager.",
        result => { console.log(result) }
      );

      user.getUsersRole(2, respo => {
        respo.result.forEach(manager => {
          emailHelper.sendMessage(
            manager.Username,
            'Reminder for ' + element.TripID,
            'The trip with the above number has not started. Please cancel the trip.',
            false
          );

          mobileHelper.sendMessage(
            "94" + manager.Mobile_No,
            "Trip with the number" + element.TripID + " has not started. Please cancel the trip.",
            (x) => { console.log(x) }
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
        "You only have 30 minutes left in the allocated time for your trip with the Trip ID " + element.TripID,
        (x) => {console.log(x)}
      );

      user.getUser("driver" + element.Driver_ID + "@fao.org", response => {
        mobileHelper.sendMessage(
          "94" + response.Mobile_No,
          "You only have 30 minutes left in the allocated time for your current trip with the Trip ID " + element.TripID,
          (x) => {console.log(x)}
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

module.exports.consolidatedRequest = function (req, res) {
  trip.consolidatedRequested(req.params.tripID, response => {
    return res.send(response);
  });
}

module.exports.filterTrips = function (req, res) {
  const driver = req.query.driverID;
  const tripType = req.query.tripType;
  const tripStatus = req.query.tripStatus;

  let queries = {}

  if (driver != null) {
    queries['Driver_ID'] = driver;
  }

  if (tripType != null) {
    queries['Trip_Type'] = tripType;
  }

  if (tripStatus != null) {
    queries['Trip_Status'] = tripStatus;
  }

  trip.filterTrips(queries, result => {
    res.send(result);
  });
}

module.exports.driverAvailabilityAll = function (req, res) {
  trip.checkDriverAvailabilityAllTypes(req.query.driverID, req.query.tripDate, req.query.tripTime, req.query.tripType, req.query.duration, req.query.durationMinutes, result => {
    return res.send(result)
  });
}