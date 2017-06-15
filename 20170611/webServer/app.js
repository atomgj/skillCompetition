var http = require('http'),
    route = require('./route/index');

http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain; charset = utf8',
        'Access-Control-Allow-Origin': '*'
    });

    route.controller(request, response);

}).listen(3000);
