/**
 * Created by lgj on 2017/6/22.
 */
var service, factory,
    serviceImpl = require('./serviceImpl');

factory = {
    setStartIndex : function(param){
        param.pageNo = parseInt(param.pageNo) ? parseInt(param.pageNo) : 1;
        param.pageSize = parseInt(param.pageSize) ? parseInt(param.pageSize) : 10;
        param.startIndex =  (param.pageNo - 1 ) * param.pageSize;
    }
};

service = {
    login: function(param, response){
        serviceImpl.login(param, function(result){
            response.end(JSON.stringify(result));
        });
    },
    check: function(param, response){
        serviceImpl.check(param, function(result){
            response.end(JSON.stringify(result));
        });
    },
    register: function(param, response){
        serviceImpl.register(param, function(result){
            response.end(JSON.stringify(result));
        });
    },
    list: function(param, response){
        if(param.userId){
            factory.setStartIndex(param);
            serviceImpl.list(param, function(result){
                response.end(JSON.stringify(result));
            });
        }else{
            response.end(JSON.stringify({code:401, message: "unauthorized"}));
        }
    },
    category: function(param, response){
        if(param.userId){
            serviceImpl.category(param, function(result){
                response.end(JSON.stringify(result));
            });
        }else{
            response.end(JSON.stringify({code:401, message: "unauthorized"}));
        }
    },
    view: function(param, response){
        if(param.userId){
            serviceImpl.view(param, function(result){
                response.end(JSON.stringify(result));
            });
        }else{
            response.end(JSON.stringify({code:401, message: "unauthorized"}));
        }
    },
    edit: function(param, response){
        if(param.userId){
            serviceImpl.edit(param, function(result){
                response.end(JSON.stringify(result));
            });
        }else{
            response.end(JSON.stringify({code:401, message: "unauthorized"}));
        }
    },
    like: function(param, response){
        if(param.userId){
            serviceImpl.like(param, function(result){
                response.end(JSON.stringify(result));
            });
        }else{
            response.end(JSON.stringify({code:401, message: "unauthorized"}));
        }
    }
};


module.exports = service;