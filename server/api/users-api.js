var express = require('express'),
    router = express.Router(),
    userController =require('../controller/user-controller');

router.post('/new', userController.addUser);
router.get('/all', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/update', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
