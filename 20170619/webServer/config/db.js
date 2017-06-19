/**
 * Created by lgj on 2017/6/19.
 */
var mysql = require('mysql'),
    db;

db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'skill'
});

module.exports = db;