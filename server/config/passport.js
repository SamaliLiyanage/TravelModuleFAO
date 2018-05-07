var db = require('../db.js');

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    db.connection.query('SELECT * FROM User WHERE Username = ?', id, function(err, rows){
      done(err, rows[0]);
    })
  });

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
       console.log("passport.use / local -login");
       db.connection.query('SELECT * FROM User WHERE Username = ?', email, function(err, rows){
         if(err) return done(err);
         if(!rows.length) {
           return done(null, false, req.flash('loginMessage', 'No user found.'));
         }
         if(!(rows[0].password == password))
           return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
         return done(null, rows[0]);
       });
     }));
};
