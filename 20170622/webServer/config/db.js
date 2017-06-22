/**
 * Created by lgj on 2017/6/22.
 */
var mysql = require('mysql'),
    db;

db = mysql.createConnection({
    host: '192.168.1.200',
    user: 'root',
    password: 'root',
    database: 'skill'
});

module.exports = db;