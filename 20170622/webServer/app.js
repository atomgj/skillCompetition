/**
 * Created by lgj on 2017/6/22.
 */
var http = require('http'),
    route = require('./routes'),
    server;

server = http.createServer(function(request, response){
    route.controller(request, response);
});

server.listen(3000);
