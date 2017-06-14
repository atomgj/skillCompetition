var service, factory,
    serviceImpl = require('./serviceImpl');

factory = {
    getStartIndex: function (param) {
        param.pageNo = !param.pageNo ? 0 : parseInt(param.pageNo);
        param.pageSize = !param.pageSize ? 0 : parseInt(param.pageSize);

        if (param.pageNo < 1) {
            param.pageNo = 1;
        }
        param.startIndex = (param.pageNo - 1) * param.pageSize;
    }
};

service = {
    login: function (param, response) {
        serviceImpl.login(param, function (data) {
            response.end(JSON.stringify(data));
        });
    },
    register: function (param, response) {
        serviceImpl.register(param, function (data) {
            response.end(JSON.stringify(data));
        });
    },
    pageQuery: function (param, response) {
        if (!param.userId) {
            response.end("{code: 401, message: 'unauthorized!'}");
        } else {
            factory.getStartIndex(param);
            serviceImpl.pageQuery(param, function (data) {
                response.end(JSON.stringify(data));
            });
        }

    },
    getById: function (param, response) {
        if (!param.userId) {
            response.end("{code: 401, message: 'unauthorized!'}");
        } else {
            serviceImpl.getById(param, function (data) {
                response.end(JSON.stringify(data));
            });
        }
    },
    modify: function (param, response) {
        if (!param.userId) {
            response.end("{code: 401, message: 'unauthorized!'}");
        } else {
            serviceImpl.modify(param, function (data) {
                response.end(JSON.stringify(data));
            });
        }
    },
    like: function (param, response) {
        if (!param.userId) {
            response.end("{code: 401, message: 'unauthorized!'}");
        } else {
            serviceImpl.like(param, function (data) {
                response.end(JSON.stringify(data));
            });
        }
    }
};


module.exports = service;