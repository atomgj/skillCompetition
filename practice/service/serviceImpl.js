var serviceImpl,
    db = require('../config/db');

serviceImpl = {
    login: function (param, callback) {
        var sql, arr, rtl;
        sql = "select count(*) count from t_user where username = ? and password = ? ";
        arr = [param.username, param.password];
        rtl = {};
        db.query(sql, arr, function (error, result) {
            if (error) {
                rtl.code = 500;
                rtl.message = error.message;
            } else if (result[0].count) {
                rtl.code = 200;
                rtl.message = "login success!";
            } else {
                rtl.code = 600;
                rtl.message = "username or password is incorrect!";
            }
            callback(rtl);
        });
    },
    register: function (param, callback) {
        var sql, arr, rtl;
        sql = "select count(*) count from t_user where username = ? or mobile = ? ";
        arr = [param.username, param.mobile];
        rtl = {};
        db.query(sql, arr, function (error, result) {
            if (error) {
                rtl.code = 500;
                rtl.message = error.message;
                callback(rtl);
            } else if (result[0].count) {
                rtl.code = 600;
                rtl.message = "username or mobile is already exist!";
                callback(rtl);
            } else {
                sql = "select max(userId) as id from t_user";
                db.query(sql, function (_error, _result) {
                    if (_error) {
                        rtl.code = 500;
                        rtl.message = _error.message;
                        callback(rtl);
                    } else {
                        var nextId = _result[0].id + 1;
                        sql = "insert into t_user (userId, username, password, mobile, role) value (?,?,?,?,?)";
                        arr = [nextId, param.username, param.password, param.mobile, param.role || 1];
                        db.query(sql, arr, function (__error, __result) {
                            if (__error) {
                                rtl.code = 500;
                                rtl.message = __error.message;
                            } else {
                                rtl.code = 200;
                                rtl.data = __result;
                            }
                            callback(rtl);
                        });
                    }
                });
            }
        });
    },
    pageQuery: function (param, callback) {
        var sql, arr, rtl,
            start = " select ",

            countQuery = " count(*) as count ",
            listQuery = " a.*, b.count ",

            end = " from t_commodity a " +
                " left join " +
                " (select count(*) as count, commodityId from t_like group by commodityId ) b" +
                " on a.commodityId =  b.commodityId " +
                " where 1=1 ",

            orderBy = " order by ? ? limit ?, ? ",
            condition = "";

        if (param.role) {
            condition += " and a.userId = " + param.userId + " ";
        }
        if (param.name) {
            condition += " and a.name = " + param.name + " ";
        }
        if (param.category) {
            condition += " and a.category like '%" + param.category + "%' ";
        }
        if (param.price) {
            condition += " and a.price = " + param.price + " ";
        }
        if (param.timeType) {

            if (param.timeType == 1) { //今天的
                condition += " and to_days(a.updateTime) = to_days(now())";
            } else if (param.timeType == 2) { //近1天的
                condition += " and to_days(a.updateTime) > to_days(now())-1";
            } else if (param.timeType == 3) { //近3天的
                condition += " and to_days(a.updateTime) > to_days(now())-3";
            } else if (param.timeType == 4) { //近5分钟
                condition += " and a.updateTime > date_sub(now(), interval 5 minute)";
            }
        }

        sql = start + countQuery + end + condition;
        console.log(sql);
        db.query(sql, function (error, result) {
            rtl = {};
            if (error) {
                rtl.code = 500;
                rtl.message = error.message;
                callback(rtl);
            } else {
                sql = start + listQuery + end + condition + orderBy;
                arr = [param.sortColumns || 'updateTime', param.sortType || 'asc', parseInt(param.startIndex) || 0, parseInt(param.pageSize) || 5];
                db.query(sql, arr, function (_error, _result) {
                    if (_error) {
                        rtl.code = 500;
                        rtl.message = _error.message;
                        callback(rtl);
                    } else {
                        rtl.code = 200;
                        rtl.data = {
                            count: result[0].count,
                            rows: _result
                        };
                        callback(rtl);
                    }
                });
            }
        });
    },
    getById: function (param, callback) {
        var sql, arr, rtl,
            start = " select ",
            listQuery = " a.*, b.count ",
            end = " from t_commodity a " +
                " left join " +
                " (select count(*) as count, commodityId from t_like group by commodityId ) b" +
                " on a.commodityId =  b.commodityId " +
                " where 1=1 ",
            condition = " and a.commodityId = ?";

        sql = start + listQuery + end + condition;
        arr = [param.commodityId];
        db.query(sql, arr, function (_error, _result) {
            rtl = {};
            if (_error) {
                rtl.code = 500;
                rtl.message = _error.message;
                callback(rtl);
            } else {
                rtl.code = 200;
                rtl.data = _result;
                callback(rtl);
            }
        });
    },
    modify: function (param, callback) {
        var sql, arr, rtl;
        sql = "update t_commodity set updateTime= now() " +
            "name=? , category=? , price=? , " +
            "where commodityId = ?";
        arr = [param.name, param.category, param.price, param.commodityId];
        db.query(sql, arr, function (_error, _result) {
            rtl = {};
            if (_error) {
                rtl.code = 500;
                rtl.message = _error.message;
            } else {
                rtl.code = 200;
                rtl.data = _result;
            }
            callback(rtl);
        });
    },
    doLike: function (param, callback) {
        var sql, arr, rtl;
        sql = "select count(*) count from t_like where userId = ? and commodityId = ? ";
        arr = [param.userId, param.commodityId];
        rtl = {};
        db.query(sql, arr, function (error, result) {
            if (error) {
                rtl.code = 500;
                rtl.message = error.message;
                callback(rtl);
            } else if (result[0].count) {
                sql = "delete from t_like where userId = ? and commodityId = ?";
                db.query(sql, arr, function (__error) {
                    if (__error) {
                        rtl.code = 500;
                        rtl.message = __error.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = "unlike success!";
                    }
                    callback(rtl);
                });
            } else {
                sql = "insert into t_like (userId, commodityId, updateTime) value (?,?, now())";
                db.query(sql, arr, function (__error) {
                    if (__error) {
                        rtl.code = 500;
                        rtl.message = __error.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = "like success!";
                    }
                    callback(rtl);
                });
            }
        });
    }
};

module.exports = serviceImpl;