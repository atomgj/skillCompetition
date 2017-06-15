var serviceImpl,
    db = require('../config/db');

serviceImpl = {
    login: function (param, callback) {
        var sql = "select * from t_user where username = ? and password = ?";
        var arr = [param.username, param.password];
        db.query(sql, arr, function (err, rows) {
            var rtl = {};
            if (err) {
                rtl.code = 500;
                rtl.message = err.message;
            } else if (rows.length) {
                rtl.code = 200;
                rtl.data = rows;
            } else {
                rtl.code = 600;
                rtl.message = "username or password is incorrect!";
            }
            callback(rtl);
        });
    },
    register: function (param, callback) {
        var sql = "select count(*) as count from t_user where username = ? or mobile = ?";
        var arr = [param.username, param.mobile];
        db.query(sql, arr, function (err, rows) {
            var rtl = {};
            if (err) {
                rtl.code = 500;
                rtl.message = err.message;
                callback(rtl);
            } else if (!rows[0].count) {
                sql = "select max(userId) id from t_user";
                db.query(sql, function (__err, __rows) {
                    if (__err) {
                        rtl.code = 500;
                        rtl.message = __err.message;
                        callback(rtl);
                    } else {
                        sql = "insert into t_user (userId, username, password, mobile, role) values (?, ?,?,?,?)";
                        arr = [__rows[0].id + 1, param.username, param.password, param.mobile, param.role || 0];
                        db.query(sql, arr, function (_err, _rows) {
                            if (_err) {
                                rtl.code = 500;
                                rtl.message = _err.message;
                            } else {
                                rtl.code = 200;
                                rtl.data = _rows;
                            }
                            callback(rtl);
                        });
                    }
                });
            } else {
                rtl.code = 600;
                rtl.message = "username or mobile is already exist!";
                callback(rtl);
            }
        });
    },
    pageQuery: function (param, callback) {
        var sql, arr,
            start = " select ",
            strCount = " count(*) as count",
            strList = " a.*, b.count ",
            end = " from t_commodity a left join (select count(*) as count , commodityId from t_like group by commodityId) b on a.commodityId = b.commodityId where 1=1 ",
            order = " order by ? ? limit ? , ? ",
            condition = "";

        if (!param.role) {
            condition = " and a.userId = " + param.userId;
        }
        if (param.name) {
            condition = " and a.name = " + param.name;
        }
        if (param.category) {
            condition = " and a.category like '%" + param.category + "%' ";
        }
        if (param.price) {
            condition = " and a.price = " + param.price;
        }
        if (param.timeType) {
            if (param.timeType == 1) {
                condition = " and to_days(a.updateTime) = to_days(now()) ";
            } else if (param.timeType == 2) {
                condition = " and to_days(a.updateTime) > to_days(now()) -1 ";
            } else if (param.timeType == 3) {
                condition = " and to_days(a.updateTime) > to_days(now()) - 7 ";
            } else if (param.timeType == 4) {
                condition = " and a.updateTime > date_sub(now(), interval 5 minute)";
            }
        }

        sql = start + strCount + end + condition;
        db.query(sql, function (err, rows) {
            var rtl = {};
            if (err) {
                rtl.code = 500;
                rtl.message = err.message;
            } else {
                sql = start + strList + end + condition + order;
                arr = [param.sortColumns || 'updateTime', param.sortType || 'ASC', param.startIndex || 0, param.pageSize || 10];
                db.query(sql, arr, function (_err, _rows) {
                    if (_err) {
                        rtl.code = 500;
                        rtl.message = _err.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = {
                            count: rows[0].count,
                            rows: _rows
                        };
                    }
                    callback(rtl);
                });
            }
        });
    },
    getById: function (param, callback) {
        var sql, arr,
            start = " select ",
            strList = " a.*, b.count ",
            end = " from t_commodity a left join (select count(*) as count , commodityId from t_like group by commodityId) b on a.commodityId = b.commodityId where 1=1 ",
            condition = " and a.commodityId = ? ";
        sql = start + strList + end + condition;
        arr = [param.commodityId];
        db.query(sql, arr, function (err, rows) {
            var rtl = {};
            if (err) {
                rtl.code = 500;
                rtl.message = err.message;
            } else {
                rtl.code = 200;
                rtl.data = rows;
            }
            callback(rtl);
        });

    },
    modify: function (param, callback) {
        var sql, arr;
        sql = "update t_commodity set name = ? , category = ? , price = ? , updateTime = now() where commodityId = ?";
        arr = [param.name, param.category, param.price, param.commodityId];
        db.query(sql, arr, function (err, rows) {
            var rtl = {};
            if (err) {
                rtl.code = 500;
                rtl.message = err.message;
            } else {
                rtl.code = 200;
                rtl.data = rows;
            }
            callback(rtl);
        });
    },
    like: function (param, callback) {
        var sql = "select count(*) as count from t_like where userId = ? and commodityId = ?";
        var arr = [param.userId, param.commodityId];
        db.query(sql, arr, function (err, rows) {
            var rtl = {};
            if (err) {
                rtl.code = 500;
                rtl.message = err.message;
                callback(rtl);
            } else if (!rows[0].count) {
                sql = "insert into t_like (userId, commodityId, updateTime) values (? , ? , now()) ";
                db.query(sql, arr, function (_err, _rows) {
                    if (_err) {
                        rtl.code = 500;
                        rtl.message = _err.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = _rows;
                    }
                    callback(rtl);
                });
            } else {
                sql = "delete from t_like where userId = ? and commodityId = ? ";
                db.query(sql, arr, function (_err, _rows) {
                    if (_err) {
                        rtl.code = 500;
                        rtl.message = _err.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = _rows;
                    }
                    callback(rtl);
                });
            }
        });
    }
};

module.exports = serviceImpl;