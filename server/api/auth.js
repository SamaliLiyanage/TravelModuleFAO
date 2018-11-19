var user = require('../model/user');

/*module.exports = function(app, passport) {
  app.post('/login', (req, res, next) => {
    user.findUser(req.body.username, req.body.password, res);
    console.log("auth/login");
  });
}*/

module.exports = function (app, passport) {
  // app.post('/login', passport.authenticate('local-login'), function(req, res) {
  //   res.redirect('/users/'+req.user.Username);
  // });

  app.post('/login', function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
      console.log(err, user, info);
      if (err) return res.send({status: "fail", err: err, info: info});
      if (!user) return res.send({status: "fail", err: err, info: info});
      req.logIn(user, function (err) {
        if (err) return res.send({status: "fail", err: err, info: info});
        return res.redirect('/users/'+user.Username);
      });
    })(req, res, next);
  });

  app.get('/loggedin', function (req, res) {
    res.send(req.user);
  })
}
