var route = {},
    url = require('url'),
    queryString = require('querystring'),
    service = require('../service/service');

route.map = {
    '/login': service.login,
    '/register': service.register,
    '/category': service.getCategory,
    '/list': service.pageQuery,
    '/view': service.getById,
    '/edit': service.modify,
    '/like': service.like
};

route.controller = function (request, response) {
    var path = url.parse(request.url),
        callback = route.map[path.pathname],
        str = "", param;

    if (callback) {
        if (request.method.toUpperCase() == 'POST') {
            request.on('data', function (data) {
                str += data;
            });
            request.on('end', function () {
                param = queryString.parse(str);
                callback(param, response);
            });
        } else {
            param = queryString.parse(path.query);
            callback(param, response);
        }
    } else {
        response.end('{"code": 404, "message": "not found!"}');
    }

};

module.exports = route;