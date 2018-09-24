var express = require('express'),
    router = express.Router(),
    driverController = require('../controller/driver-controller');

router.post('/', driverController.addLeave);
router.post('/gettrips', driverController.getTripsForDriverDate);
router.get('/getleave/:driverID/:year', driverController.viewLeave);
router.post('/deleteleave', driverController.deleteLeave);
router.post('/reassign', driverController.checkDriverAvailablity);

module.exports = router;