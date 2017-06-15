var service,
    factory = require('./factory'),
    serviceImpl = require('./serviceImpl');

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
    /**
     {
         user: {
              username : 1,
              password : 1,
              role : 1,
              mobile : 1
          },
          userId: '',
          sortColumns : 'updateTime',
          sortType : 'asc',
          pageNo: 1,
          pageSize: 10,
          category : '',
          name : '',
          price : '',
          timeType : ''
     }
     */
    pageQuery: function (param, response) {
        if (!param.userId) {
            response.end('{code:401, message:"unauthorized!"}')
        } else {
            factory.getStartIndex(param);
            serviceImpl.pageQuery(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    },
    getById: function (param, response) {
        if (!param.userId) {
            response.end('{code:401, message:"unauthorized!"}')
        } else {
            serviceImpl.getById(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    },
    modify: function (param, response) {
        if (!param.userId) {
            response.end('{code:401, message:"unauthorized!"}')
        } else {
            serviceImpl.modify(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    },
    doLike: function (param, response) {
        if (!param.userId) {
            response.end('{code:401, message:"unauthorized!"}')
        } else {
            serviceImpl.doLike(param, function (result) {
                response.end(JSON.stringify(result));
            });
        }
    }
};

module.exports = service;
