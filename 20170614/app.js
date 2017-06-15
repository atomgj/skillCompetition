var http = require('http'),
    route = require('./routes'),
    server;


server = http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf8',
        'Access-Control-Allow-Origin': '*'
    });

    route.controller(request, response);
});

server.listen(3000);