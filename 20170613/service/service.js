var service,
    factory,
    serviceImpl = require('./seviceImpl');

factory = {
    getStartIndex : function(param){
        if(!param.pageNo){
            param.pageNo = 0;
        }else{
            param.pageNo = parseInt(param.pageNo);
        }

        if(!param.pageNo){
            param.pageSize = 0;
        }else{
            param.pageSize = parseInt(param.pageSize);
        }

        if(param.pageNo && param.pageSize){
            if(param.pageNo < 1){
                param.pageNo = 1;
            }
            param.startIndex = (param.pageNo - 1) * param.pageSize;
        }
    }
};
service = {
    login: function(param, response){
        serviceImpl.login(param, function(result){
            response.end(JSON.stringify(result));
        })
    },
    register: function(param, response){
        serviceImpl.register(param, function(result){
            response.end(JSON.stringify(result));
        })
    },
    pageQuery: function(param, response){
        if(!param.userId){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else{
            factory.getStartIndex(param);
            serviceImpl.pageQuery(param, function(result){
                response.end(JSON.stringify(result));
            })
        }

    },
    getById: function(param, response){
        if(!param.userId){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else{
            serviceImpl.getById(param, function(result){
                response.end(JSON.stringify(result));
            })
        }
    },
    modify: function(param, response){
        if(!param.userId){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else{
            serviceImpl.modify(param, function(result){
                response.end(JSON.stringify(result));
            })
        }
    },
    like: function(param, response){
        if(!param.userId){
            response.end("{code: 401, message: 'unauthorized!'}");
        }else{
            serviceImpl.like(param, function(result){
                response.end(JSON.stringify(result));
            })
        }
    }
};

module.exports = service;

