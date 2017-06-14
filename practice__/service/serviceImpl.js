var serviceImpl,
    db = require('../config/db');


serviceImpl = {
    login: function (param, callback) {
        var sql, arr, rtl = {};

        sql = "select * from t_user where (username=? or mobile =? or email = ?) and password = ?";
        arr = [param.username, param.username, param.username, param.password];

        db.query(sql, arr, function (e, rows) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
            } else if (rows.length) {
                rtl.code = 200;
                rtl.data = rows[0];
            } else {
                rtl.code = 500;
                rtl.message = "username or password is incorrect!";
            }
            callback(rtl);
        });
    },
    register: function (param, callback) {
        var sql, arr, rtl = {};

        sql = "select * from t_user where username=? or mobile =? or email =?";
        arr = [param.username, param.mobile, param.email];

        db.query(sql, arr, function (e, rows) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
                callback(rtl);
            } else if (rows.length) {
                rtl.code = 600;
                rtl.message = "username/mobile/email is already exist!";
                callback(rtl);
            } else {
                sql = "select max(userId) as id from t_user ";
                db.query(sql, function (ee, _rows) {
                    if (ee) {
                        rtl.code = 500;
                        rtl.message = ee.message;
                        callback(rtl);
                    } else {
                        sql = "insert into t_user (userId, username, mobile, email, password, role) values (?,?,?,?,?,?)";
                        arr = [_rows[0].id + 1, param.username, param.mobile, param.email, param.password, param.role || 1];
                        db.query(sql, arr, function (eee, __rows) {
                            if (eee) {
                                rtl.code = 500;
                                rtl.message = eee.message;
                            } else {
                                rtl.code = 200;
                                rtl.message = __rows;
                            }
                            callback(rtl);
                        });
                    }
                });
            }
        });
    },
    pageQuery: function (param, callback) {
        var sql, arr, rtl = {},
            start = " select ",
            strCount = " count(*) count ",
            strList = " a.*, b.count ",
            end = " from t_commodity a left join (select count(*) count , commodityId from t_like group by commodityId) b on a.commodityId = b.commodityId where 1=1 ",
            condition = "",
            order = " order by " + (param.sortColumns || 'updateTime') + " " + (param.sortType || 'ASC') + " limit ? , ? ";

        if (param.name) {
            condition += " and a.name = '" + param.name + "'";
        }
        if (param.price) {
            condition += " and a.price = " + parseFloat(param.price);
        }
        if (param.category) {
            condition += " and a.category like '%" + param.category + "%'";
        }
        if (parseInt(param.role)) {
            condition += " and a.userId = " + parseInt(param.userId);
        }
        if (param.timeType) {
            if (param.timeType == 1) {
                condition += " and to_days(a.updateTime) = to_days(now())";
            }
            if (param.timeType == 2) {
                condition += " and to_days(a.updateTime) > to_days(now() -1)";
            }
            if (param.timeType == 3) {
                condition += " and to_days(a.updateTime) = to_days(now() -7)";
            }
            if (param.timeType == 4) {
                condition += " and a.updateTime > date_sub(now(), interval 5 minute)";
            }
        }

        sql = start + strCount + end + condition;
        db.query(sql, function (e, rows) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
                callback(rtl);
            } else {
                sql = start + strList + end + condition + order;
                arr = [param.startIndex || 0, param.pageSize || 5];

                db.query(sql, arr, function (ee, _rows) {
                    if (ee) {
                        rtl.code = 500;
                        rtl.message = ee.message;
                        callback(rtl);
                    } else {
                        rtl.code = 200;
                        rtl.data = {
                            count: rows[0].count,
                            data: _rows
                        };
                        callback(rtl);
                    }
                });
            }
        });
    },
    getById: function (param, callback) {

        var sql, arr, rtl = {},
            start = " select ",
            strList = " a.*, b.count ",
            end = " from t_commodity a left join (select count(*) count , commodityId from t_like group by commodityId) b on a.commodityId = b.commodityId where a.commodityId = ? ",
            condition = "";

        sql = start + strList + end + condition;
        arr = [param.commodityId];

        db.query(sql, arr, function (ee, _rows) {
            if (ee) {
                rtl.code = 500;
                rtl.message = ee.message;
                callback(rtl);
            } else {
                rtl.code = 200;
                rtl.data = _rows[0];
                callback(rtl);
            }
        });
    },
    modify: function (param, callback) {
        var sql, arr, rtl = {};
        sql = "update t_commodity  set  name = ?, price = ?, category = ?, updateTime = now() where commodityId = ?";
        arr = [param.name, param.price, param.category, param.commodityId];
        db.query(sql, arr, function (ee, rows) {
            if (ee) {
                rtl.code = 500;
                rtl.message = ee.message;
            } else {
                rtl.code = 200;
                rtl.message = rows;
            }
            callback(rtl);
        });
    },
    like: function (param, callback) {
        var sql, arr, rtl = {};
        sql = "select * from t_like where userId = ? and commodityId = ? ";
        arr = [param.userId, param.commodityId];
        db.query(sql, arr, function (e, rows) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
                callback(rtl);
            } else if (rows.length) {
                sql = "delete from t_like where userId = ? and commodityId = ? ";
                db.query(sql, arr, function (ee) {
                    if (ee) {
                        rtl.code = 500;
                        rtl.message = ee.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = -1;
                    }
                    callback(rtl);
                });
            } else {
                sql = "insert into  t_like (userId, commodityId, updateTime) values (? , ? , now())";
                db.query(sql, arr, function (ee) {
                    if (ee) {
                        rtl.code = 500;
                        rtl.message = ee.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = 1;
                    }
                    callback(rtl);
                });
            }
        });
    }
};


module.exports = serviceImpl;