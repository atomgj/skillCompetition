var serviceImpl = require('./serviceImpl'),
    service;

service = {
    login: function (param, response) {
        serviceImpl.login(param, function (result) {
            response.end(JSON.stringify(result));
        });
    },
    register: function (param, response) {
        serviceImpl.register(param, function (result) {
            response.end(JSON.stringify(result));
        });
    },
    commodityList: function (param, response) {
        if(!param.user){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else{
            serviceImpl.commodityList(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    },
    commodityView: function (param, response) {
        if(!param.user){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else{
            serviceImpl.commodityView(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    },
    commodityLike: function (param, response) {
        if(!param.user){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else {
            serviceImpl.commodityLike(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    },
    commodityEdit: function (param, response) {
        if(!param.user){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else {
            serviceImpl.commodityEdit(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    }
};

module.exports = service;



