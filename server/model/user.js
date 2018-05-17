var db = require('../db.js');

exports.addUser = function(userName, fullName, passWord, role, res) {
  var values = [userName, fullName, passWord, role];
  console.log(values);
  db.connection.query('INSERT INTO User (Username, Full_Name, Password, Role) VALUES (?, ?, ?, ?)', values, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    }else{
    res.send(results);
  }})
}

exports.findUser = function(userName, passWord, res) {
  var values = [userName, passWord];
  db.connection.query('SELECT * FROM User WHERE Username= ? AND Password=?', values, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    }else{
      res.send(results);
    }
  });
}

exports.getUsers = function(res) {
  db.connection.query('SELECT * FROM User', function(err, results, fields) {
    if(err) {
      console.log(err);
      return res.send(err);
    }else{
      res.send(JSON.stringify(results));
    }
  });
}

exports.getUser = function(userName, res) {
  const value = [userName];

  db.connection.query('SELECT * FROM User WHERE Username=?', value, function(err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    }else{
      res.send(results);
    }
  });
}

exports.updateUser = function(oldUserName, userName, realName, passWord, role, res) {
  const values = [userName, realName, passWord, role, oldUserName];

  db.connection.query('UPDATE User SET Username=?, Full_Name=?, Password=?, Role=? WHERE Username=?', values, function (err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    }else {
      res.send(results);
    }
  });
}

exports.deleteUser = function(userName, res) {
  const value = [userName];

  db.connection.query('DELETE FROM User WHERE Username=?', value, function (err, results) {
    if(err) {
      console.log(err);
      return res.send(err);
    }else {
      res.send(results);
    }
  });
}

exports.isLoggedIn = function(res) {
  db.connection.query('SELECT * FROM User', function(err, results, fields) {
    if(err) {
      console.log(err);
      return res.send(err);
    }else{
      res.send(JSON.stringify(results));
    }
  });
}
