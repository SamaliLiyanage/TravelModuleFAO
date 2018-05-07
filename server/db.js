var mysql = require('mysql');

var state = {
  connection: null,
};

function dbConnect() {
  state.connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sam',
    database: 'travel_module',
  });

  //state.connection.query('INSERT INTO User(Username, Full_Name, Password, Role) VALUES ("Sam", "Liyanage", "Sucks", 1)');
  console.log('Connected to DB...');
}

dbConnect();

/*exports.get = function() {
  return state.connection;
}*/

exports.connection = state.connection;
