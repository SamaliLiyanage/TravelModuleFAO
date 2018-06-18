var user = require('../model/user');

//Insert a user
module.exports.addUser = function (req, res, next) {
  user.addUser(req.body.userName, req.body.realName, req.body.passWord, req.body.telePhone, req.body.role, res);
};

//Get all users with all fields
module.exports.getUsers = function (req, res, next) {
  user.getUsers(res);
};

//Get all users of given role
module.exports.getUsersFilter = function (req, res, next) {
  if(req.params.fieldName==='Role'){
    user.getUsersRole(req.params.fieldValue, response => {
      if(response.status==="success") res.send(response.result);
    });
  } else {
    res.send({status: 'fail'});
  }  
}

//Get user with specific ID
module.exports.getUser = function (req, res, next) {
  user.getUser(req.params.id, res);
}

//Update user with given ID
module.exports.updateUser = function (req, res, next) {
  user.updateUser(req.body.oldUsername, req.body.userName, req.body.realName, req.body.passWord, req.body.telePhone, req.body.role, res);
}

//Delete user with given ID
module.exports.deleteUser = function (req, res, next) {
  user.deleteUser(req.params.id, res);
}

//Check if a user is logged in
module.exports.isLogged = function (req, res, next) {
  console.log("SOMEWHERE :", req.isAuthenticated());
  res.json({hello:"Hello"});
  //user.isLoggedIn(res);
}