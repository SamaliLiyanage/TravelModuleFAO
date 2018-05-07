var user = require('../model/user');

module.exports = function(app, passport) {
  app.post('/login', (req, res, next) => {
    user.findUser(req.body.username, req.body.password, res);
    //console.log("auth/login");
  });
}
