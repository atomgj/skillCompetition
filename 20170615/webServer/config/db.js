var mysql = require('mysql'),
    db;

db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'skill'
});

module.exports = db;