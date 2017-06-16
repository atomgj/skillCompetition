var db = require('../config/db'),
    serviceImpl;

serviceImpl = {
    login: function (param, callback) {
        var sql, arr, rtl = {};
        sql = "select * from t_user where (username = ? or email = ? or mobile = ?) and password = ?";
        arr = [param.username, param.username, param.username, param.password];
        db.query(sql, arr, function (e, r) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
            } else if (r.length) {
                rtl.code = 200;
                rtl.data = r[0];
            } else {
                rtl.code = 600;
                rtl.message = "username or password is incorrect!";
            }
            callback(rtl);
        });
    },
    register: function (param, callback) {
        var sql, arr, rtl = {};
        sql = "select * from t_user where username = ? or email = ? or mobile = ?";
        arr = [param.username, param.username, param.username];
        db.query(sql, arr, function (e, r) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
                callback(rtl);
            } else if (r.length) {
                rtl.code = 600;
                rtl.message = "username is already exist!";
                callback(rtl);
            } else {
                sql = "insert into t_user (username, email, mobile, password, role) values (?, ? ,? ,?, 1)";
                arr = [param.username, param.email, param.mobile, param.password];
                db.query(sql, arr, function (ee, rr) {
                    if (ee) {
                        rtl.code = 500;
                        rtl.message = ee.message;
                    } else{
                        rtl.code = 200;
                        rtl.data = rr;
                    }
                    callback(rtl);
                });
            }
        });
    },
    getCategory: function (param, callback) {
        var sql, rtl = {};
        sql = "select * from t_category";
        db.query(sql, function (e, r) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
            } else {
                rtl.code = 200;
                rtl.data = r;
            }
            callback(rtl);
        });
    },
    pageQuery: function (param, callback) {
        var sql, arr, rtl = {},
            start = "select ",
            strList = " a.*, c.categoryName, d.fav ",
            strCount = " count(*) as count ",
            end = " from t_book a left join t_book_category b" +
                " on a.bookId = b.bookId" +
                " left join t_category c" +
                " on b.categoryId = c.categoryId" +
                " left join (select count(*) as fav, bookId from t_favorite group by bookId) d" +
                " on a.bookId = d.bookId where 1=1 ",
            condition = "",
            order = " order by " + (param.sortColumns || 'a.updateTime') + " " + (param.sortType || 'asc') + " limit ?, ?";

        if(param.categoryName){
            condition += " and c.categoryName like '%"+param.categoryName+"%'";
        }
        if(param.bookName){
            condition += " and a.bookName = '"+param.bookName+"'";
        }
        if(param.price){
            condition += " and a.price = '"+param.price+"'";
        }
        if(param.author){
            condition += " and a.author = '"+param.author+"'";
        }
        if(param.timeType){
            if(param.timeType == 1){
                condition += " and a.updateTime > date_sub(now(), interval 0 day)";
            }else if(param.timeType == 2){
                condition += " and a.updateTime > date_sub(now(), interval 3 day)";
            }else if(param.timeType == 3){
                condition += " and a.updateTime > date_sub(now(), interval 7 day)";
            }else if(param.timeType == 4){
                condition += " and a.updateTime > date_sub(now(), interval 5 minute)";
            }
        }
        if(param.role){
            condition += " and a.userid = '"+param.userId+"'";
        }
        sql = start + strCount + end + condition;
        db.query(sql, function (e, r) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;
                callback(rtl);
            } else {
                sql = start + strList + end + condition + order;
                arr = [param.startIndex || 0, param.pageSize || 10];
                db.query(sql, arr, function (ee, rr) {
                    if (ee) {
                        rtl.code = 500;
                        rtl.message = ee.message;
                        callback(rtl);
                    } else {
                        rtl.code = 200;
                        rtl.data = {
                            count: r[0].count,
                            rows: rr
                        };
                        callback(rtl);
                    }
                });
            }
        });
    },
    getById: function (param, callback) {
        var sql, arr, rtl = {},
            start = "select ",
            strList = " a.*, c.categoryName, d.fav ",
            end = "from t_book a left join t_book_category b" +
                " on a.bookId = b.bookId" +
                " left join t_category c" +
                " on b.categoryId = c.categoryId" +
                " left join (select count(*) as fav, bookId from t_favorite group by bookId) d" +
                " on a.bookId = d.bookId where 1=1 and a.bookId = ?"

        sql = start + strList + end;
        arr = [param.bookId];
        db.query(sql, arr, function (e, r) {
            if (e) {
                rtl.code = 500;
                rtl.message = e.message;

            } else {
                rtl.code = 200;
                rtl.data = r[0];
            }
            callback(rtl);
        });
    },
    modify: function (param, callback) {
        var sql, arr, rtl = {}

        sql = "update t_book set bookName = ? , price = ?, author = ?, updateTime = now() where bookId= ?";
        arr = [param.bookName, param.price, param.author, param.bookId];
        db.query(sql, arr, function (ee, rr) {
            if (ee) {
                rtl.code = 500;
                rtl.message = ee.message;
                callback(rtl);
            } else {
                sql = "delete from t_book_category where bookId = ?";
                arr = [param.bookId];
                db.query(sql, arr, function (eee) {
                    if (eee) {
                        rtl.code = 500;
                        rtl.message = eee.message;
                        callback(rtl);
                    } else {
                        sql = "insert into t_book_category (bookId, categoryId) values (?, (select categoryId from t_category where categoryName = ?))";
                        arr = [param.bookId, param.categoryName];
                        db.query(sql, arr, function (e, r) {
                            if (e) {
                                rtl.code = 500;
                                rtl.message = e.message;
                            } else {
                                rtl.code = 200;
                                rtl.data = r;
                            }
                            callback(rtl);
                        });
                    }
                });
            }
        });
    },
    like: function (param, callback) {
        var sql, arr, rtl = {};
        sql = "select * from t_favorite where userId=? and bookId = ?";
        arr = [param.userId, param.bookId];
        db.query(sql, arr, function (ee, rr) {
            if (ee) {
                rtl.code = 500;
                rtl.message = ee.message;
                callback(rtl);
            } else if (rr.length) {
                sql = "delete from t_favorite where userId=? and bookId = ?";
                db.query(sql, arr, function (e) {
                    if (e) {
                        rtl.code = 500;
                        rtl.message = e.message;
                    } else {
                        rtl.code = 200;
                        rtl.data = -1;
                    }
                    callback(rtl);
                });
            } else {
                sql = "insert into t_favorite (userId, bookId, updateTime) values (?, ?, now())";
                db.query(sql, arr, function (e) {
                    if (e) {
                        rtl.code = 500;
                        rtl.message = e.message;
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