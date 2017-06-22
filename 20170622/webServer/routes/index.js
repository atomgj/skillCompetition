/**
 * Created by lgj on 2017/6/22.
 */
var route = {},
    url = require('url'),
    service = require('../service/service'),
    queryString = require('querystring');

route.map = {
    '/login' : service.login,
    '/register' : service.register,
    '/check' : service.check,
    '/list' : service.list,
    '/category' : service.category,
    '/view' : service.view,
    '/like' : service.like,
    '/edit' : service.edit
};

route.controller = function(request, response){
    response.writeHead(200, {
        'Content-Type' : 'text/plain;charset=utf8',
        'Access-Control-Allow-Origin' : '*'
    });

    var path = url.parse(request.url),
        callback = route.map[path.pathname],
        str = "", param;

    if(callback){
        if(request.method.toUpperCase() == 'POST'){
            request.on('data', function(data){
                str += data;
            });
            request.on('end', function(){
                param = queryString.parse(str);
                callback(param, response);
            })
        }else{
            param = queryString.parse(path.query);
            callback(param, response);
        }
    }else{
        response.end('{"code": 404, "message": "not found"}');
    }

};

module.exports = route;