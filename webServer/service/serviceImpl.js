var db = require('../config/db');

var serviceImpl = {

    login: function (param, callback) {
        var rlt = {}, sql, arr;
        sql = "select count(*) as count from t_user where username = ? and password = ? ";
        arr = [param.username, param.password];
        db.query(sql, arr, function (error, result) {
            if (error) {
                rlt.code = 500;
                rlt.message = error.message;
            } else if (result[0].count) {
                rlt.code = 200;
                rlt.data = result;
            } else {
                rlt.code = 600;
                rlt.message = 'username or password is incorrect！';
            }
            callback(rlt);
        })
    },
    register: function (param, callback) {
        var rlt = {}, sql, arr;

        db.query('select count(*) as count from t_user where username = ?',
            [param.username],
            function (_error, _result) {
                if (_error) {
                    rlt.code = 500;
                    rlt.message = _error.message;
                    callback(rlt);
                } else if (_result[0].count) {
                    rlt.code = 600;
                    rlt.message = "username already exist!";
                    callback(rlt);
                } else {
                    db.query('select max(userid) as id from t_user', function (__error, __result) {
                        if (__error) {
                            rlt.code = 500;
                            rlt.message = __error.message;
                            callback(rlt);
                        } else {
                            sql = "insert t_user (userid, username, password, role) values (?,?,?,?) ";
                            arr = [__result[0].id + 1, param.username, param.password, param.role || 1];
                            db.query(sql, arr, function (error, result) {
                                if (error) {
                                    rlt.code = 500;
                                    rlt.message = error.message;
                                } else {
                                    rlt.code = 200;
                                    rlt.data = result;
                                }
                                callback(rlt);
                            })
                        }
                    });
                }
            });

    },
    commodityList: function (param, callback) {
        var rlt = {}, sql, arr;

        sql = " select a.*, b.count from t_commodity a " +
            " left join " +
            " (select count(*) as count, commodityId from t_like group by commodityId) b " +
            " on " +
            " a.commodityId = b.commodityId " +
            (param.user.role ? "" : " where a.userId = ? ")+
            " order by ? ? limit ?, ? ";

        arr = [param.orderBy || 'updateTime', param.orderType || 'asc', param.startIndex || 0, param.endIndex || 20];

        if(param.user.role){
            arr.unshift(param.user.userId);
        }
        db.query(sql, arr, function (error, result) {
            if (error) {
                rlt.success = false;
                rlt.message = error.message;
                console.log(error);
            } else {
                rlt.success = true;
                rlt.data = result;
            }
            callback(rlt);
        })
    },
    commodityView: function (param, callback) {
        var rlt = {}, sql, arr;

        sql = " select a.*, b.count from t_commodity a " +
            " left join " +
            " (select count(*) as count, commodityId from t_like group by commodityId) b " +
            " on " +
            " a.commodityId = b.commodityId " +
            " where a.commodityId = ? ";
        arr = [param.commodityId || 1];

        db.query(sql, arr, function (error, result) {
            if (error) {
                rlt.code = 500;
                rlt.message = error.message;
            } else {
                rlt.code = 200;
                rlt.data = result;
            }
            callback(rlt);
        })
    },
    commodityLike: function (param, callback) {
        var rlt = {}, sql, arr;
        sql = "select count(*) as count from t_like where commodityId = ? and userId = ? ";
        arr = [param.commodityId, param.user.userId];

        db.query(sql, arr, function (_error, _result) {
            if (_error) {
                rlt.code = 500;
                rlt.message = _error.message;
                callback(rlt);
            } else {
                if (_result[0].count) {
                    sql = "delete from t_like where commodityId = ? and userId = ? ";
                } else {
                    sql = "insert into t_like (commodityId, userId) values (?, ?) ";
                }
                db.query(sql, arr, function (error, result) {
                    if (error) {
                        rlt.code = 500;
                        rlt.message = error.message;
                    } else {
                        rlt.code = 200;
                        rlt.message = result;
                    }
                    callback(rlt);
                });
            }

        })
    },
    commodityEdit: function (param, callback) {
        var rlt = {}, sql, arr;
        sql = "update t_commodity set name = ?, category = ?, price = ?, updateTime = now() where commodityId = ? ";
        arr = [param.name, param.category, param.price, param.commodityId];
        db.query(sql, arr, function (error, result) {
            if (error) {
                rlt.code = 500;
                rlt.message = error.message;
            } else {
                rlt.code = 200;
                rlt.data = result;
            }
            callback(rlt);
        })
    }
};

module.exports = serviceImpl;