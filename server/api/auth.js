var user = require('../model/user');

/*module.exports = function(app, passport) {
  app.post('/login', (req, res, next) => {
    user.findUser(req.body.username, req.body.password, res);
    console.log("auth/login");
  });
}*/

module.exports = function (app, passport) {
  app.post('/login', passport.authenticate('local-login'), function(req, res) {
    res.redirect('/users/'+req.user.Username);
  });

  app.get('/loggedin', function (req, res) {
    res.send(req.user);
  })
}
