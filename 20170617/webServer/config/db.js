var db, 
	mysql = require('mysql');

db = mysql.createConnection({
	host: '192.168.1.205',
	port: '3306',
	user: 'root',
	password: 'root',
	database : 'skill'
});


module.exports = db;