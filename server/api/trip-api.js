var express = require('express'),
    router = express.Router(),
    tripController = require('../controller/trip-controller');

router.post('/new', tripController.newTrip);
router.post('/newfaor', tripController.newFAORTrip);
router.get('/all', tripController.allTrips);
router.get('/lastindex', tripController.getLastIndex);
router.get('/all/:id', tripController.userTrips);
router.post('/assigndriver', tripController.assignDriver);
router.get('/gettrip/:tripID', tripController.getTrip);
router.get('/allfthrrq', tripController.getAllFurtherRequests);
router.get('/frexists/:tripID', tripController.getFurtherRequest);
router.post('/approval', tripController.setApproval);
//router.post('/testmobile', tripController.setTripStatus);
router.get('/destinations/:tripID', tripController.getDestinations);
router.get('/bentity/:tripID', tripController.getBudgetEntity);
router.post('/checkavailability', tripController.driverAvailability);
router.get('/checkavailabilityall', tripController.driverAvailabilityAll);
router.post('/canceltrip', tripController.cancelTrip);
router.post('/fetchStatus', tripController.fetchStatus);
router.post('/testing', tripController.testMobile);
router.get('/consReq/:tripID', tripController.consolidatedRequest);
router.get('/filterTrip', tripController.filterTrips);
router.post('/updateTrip', tripController.updateTrip);

module.exports = router;