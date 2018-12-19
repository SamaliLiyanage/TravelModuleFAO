var express = require('express'),
    router = express.Router(),
    driverController = require('../controller/driver-controller');

router.post('/', driverController.addLeave);
router.post('/gettrips', driverController.getTripsForDriverDate);
router.get('/getleave/:driverID/:year', driverController.viewLeave);
router.post('/deleteleave', driverController.deleteLeave);
router.post('/reassign', driverController.checkDriverAvailablity);
router.post('/isonleave', driverController.isDriverOnLeave);
router.get('/blockStatus', driverController.getDriverBlockStatus);
router.get('/blockHistory', driverController.getDriverBlockHistory);
router.get('/residentDriver', driverController.getCurrentResidentDriver);
router.get('/residentHistory', driverController.getResidentDriverHistory);
router.post('/blockDriver', driverController.setDriverBlockStatus);
router.post('/currentResidentDriver', driverController.setResidentDriver);

module.exports = router;