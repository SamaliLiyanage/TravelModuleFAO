var express = require('express'),
    router = express.Router(),
    userController =require('../controller/user-controller');

router.post('/new', userController.addUser);
router.get('/all', userController.getUsers);
router.get('/onbehalf/:id', userController.getOnBehalf);
router.get('/:fieldName/:fieldValue', userController.getUsersFilter);
router.get('/:id', userController.getUser);
router.post('/update', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/changepword', userController.changePassword);

module.exports = router;
