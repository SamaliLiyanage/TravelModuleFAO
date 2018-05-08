var express = require('express'),
    router = express.Router(),
    tripController = require('../controller/trip-controller');

router.post('/new', tripController.newTrip);
router.get('/all', tripController.allTrips);
router.get('/lastindex', tripController.getLastIndex);

module.exports = router;