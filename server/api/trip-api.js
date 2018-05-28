var express = require('express'),
    router = express.Router(),
    tripController = require('../controller/trip-controller');

router.post('/new', tripController.newTrip);
router.get('/all', tripController.allTrips);
router.get('/lastindex', tripController.getLastIndex);
router.get('/all/:id', tripController.userTrips);
router.post('/assigndriver', tripController.assignDriver);
router.get('/gettrip/:tripID', tripController.getTrip);
router.get('/allfthrrq', tripController.getAllFurtherRequests);
router.post('/approval', tripController.setApproval);

module.exports = router;