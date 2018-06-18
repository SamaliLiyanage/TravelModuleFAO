var http = require("http");
var db = require('./db');
var bodyParser = require('body-parser');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var router = express.Router();

var passport =require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');

require('./config/passport')(passport);

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

require('./api/auth')(app, passport);
app.get('/logout',function (req, res) {
  if(req.user==null) {
    res.send("logged out");
  } else { 
    req.logout();    
    res.send("success");
  }
})

var usersRouter = require('./api/users-api');
var tripsRouter = require('./api/trip-api');

app.use('/users', usersRouter);
app.use('/trips', tripsRouter);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  res.send("error");
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //res.status(err.status || 500);
  //res.render('error');
});

var server = app.listen(3001, "127.0.0.1", function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s",host,port)
});

module.exports = app;
