var factory = {};

factory.getStartIndex = function (param) {

    if(param){
        if (param.pageNo < 1) {
            param.pageNo = 1;
        }

        param.startIndex = (param.pageNo - 1) * param.pageSize;
    }
};

module.exports = factory;