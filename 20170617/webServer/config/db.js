var db, 
	mysql = require('mysql');

db = mysql.createConnection({
	host: '192.168.25.200',
	port: '3306',
	user: 'root',
	password: 'root',
	database : 'skill'
});


module.exports = db;