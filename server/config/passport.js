var db = require('../db.js');

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    //console.log(user);
    done(null, user.Username);
  });

  passport.deserializeUser(function(id, done) {
    db.connection.query('SELECT * FROM User WHERE Username = ?', id, function(err, rows){
      done(err, rows[0]);
    })
  });

  passport.use('local-login', new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, username, password, done) {
       console.log("passport.use / local -login");
       db.connection.query('SELECT * FROM User WHERE Username = ?', username, function(err, rows){
         //console.log("username ::::", rows);
         if(err) return done(err);
         if(!(rows.length===1)) {
           //console.log("Here !!!!!");
           return done(null, false);
         }
         if(!(rows[0].Password == password)){
          //console.log("Here 2!!!!!");
          return done(null, false, {message: 'Incorrect password'});
         }
         //console.log("Here 3!!!!!", rows[0]);            
         return done(null, rows[0]);
       });
     }));
};
