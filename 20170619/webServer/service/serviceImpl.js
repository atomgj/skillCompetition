/**
 * Created by lgj on 2017/6/19.
 */
var serviceImpl,
    db = require('../config/db');


serviceImpl = {
    login: function (param, callback) {
        var sql = "select * from t_user where (username=? or mobile=? or email=?) and password=?";
        var arr = [param.username, param.username, param.username, param.password];
        var rt = {};
        db.query(sql, arr, function (e, r) {
            if (e) {
                rt.code = 500;
                rt.message = e.message;
            } else if (r.length) {
                rt.code = 200;
                rt.data = r[0];
            } else {
                rt.code = 600;
                rt.message = "username and password is incorrect";
            }
            callback(rt);
        });
    },
    register: function (param, callback) {
        var sql = "select * from t_user where username=? or mobile=? or email=?";
        var arr = [param.username, param.mobile, param.email];
        var rt = {};
        db.query(sql, arr, function (e, r) {
            if (e) {
                rt.code = 500;
                rt.message = e.message;
                callback(rt);
            } else if (r.length) {
                rt.code = 600;
                rt.message = "username/email/mobile is already exist";
                callback(rt);
            } else {
                sql = "insert into t_user (username, email, mobile, password, role) values (?,?,?,?,1)";
                arr = [param.username, param.mobile, param.email, param.password];
                db.query(sql, arr, function (e1) {
                    if (e1) {
                        rt.code = 500;
                        rt.message = e1.message;
                    } else {
                        rt.code = 200;
                        rt.message = "register success";
                    }
                    callback(rt);
                });
            }

        });
    },
    category: function (param, callback) {
        var sql = "select * from t_category";
        var rt = {};
        db.query(sql, function (e, r) {
            if (e) {
                rt.code = 500;
                rt.message = e.message;
            } else {
                rt.code = 200;
                rt.data = r;
            }
            callback(rt);
        });
    },
    list: function (param, callback) {
        var sql = "";
        var arr = [];
        var rt = {};
        var start = " select ",
            strC = " count(*) as count ",
            strL = " a.*,c.categoryName,case when  d.fav is null then 0 else d.fav end as fav ",
            end = " from t_book a left join t_book_category b on a.bookId = b.bookId " +
                "left join t_category c on b.categoryId=c.categoryId " +
                "left join (select count(*) as fav, bookId from t_favorite group by bookId) d on a.bookId = d.bookId where 1=1",
            condition = "",
            order = " order by " + (param.sortColumns||'a.updateTime') + " " + (param.sortType||'ASC') + " limit ?, ?";

        if (param.categoryName) {
            condition += " and categoryName like '%" + param.categoryName + "%'";
        }
        if (param.categoryId) {
            condition += " and c.categoryId = '" + param.categoryId + "' ";
        }
        if (param.bookName) {
            condition += " and a.bookName = '" + param.bookName + "' ";
        }
        if (param.author) {
            condition += " and a.author = '" + param.author + "' ";
        }
        if (param.priceType) {
            if (param.priceType == 1) {
                condition += " and a.price between 1 and 50";
            } else if (param.priceType == 2) {
                condition += " and a.price between 50 and 100";
            } else if (param.priceType == 3) {
                condition += " and a.price between 100 and 150";
            } else if (param.priceType == 4) {
                condition += " and a.price between 150 and 200";
            }
        }
        if (param.timeType) {
            if (param.timeType == 1) {
                condition += " and a.updateTime < date_sub(now(), interval 1 day)";
            } else if (param.timeType == 2) {
                condition += " and a.updateTime < date_sub(now(), interval 1 hour)";
            } else if (param.timeType == 3) {
                condition += " and a.updateTime < date_sub(now(), interval 1 minute)";
            } else if (param.timeType == 4) {
                condition += " and a.updateTime < date_sub(now(), interval 7 day)";
            }
        }
        sql = start + strC + end + condition;
        db.query(sql, function (e, r) {
            if (e) {
                rt.code = 500;
                rt.message = e.message;
                callback(rt);
            } else {
                sql = start + strL + end + condition + order;
                arr = [param.startIndex, param.pageSize];
                db.query(sql, arr, function (e1, r1) {
                    if (e1) {
                        rt.code = 500;
                        rt.message = e1.message;
                    } else {
                        rt.code = 200;
                        rt.data = {
                            count: r[0].count,
                            rows: r1
                        };
                    }
                    callback(rt);

                });
            }
        });
    },
    view: function (param, callback) {
        var sql, arr, rt = {};
        var start = " select ",
            strL = " a.*,c.categoryName,case when  d.fav is null then 0 else d.fav end as fav ",
            end = " from t_book a left join t_book_category b on a.bookId = b.bookId " +
                "left join t_category c on b.categoryId=c.categoryId " +
                "left join (select count(*) as fav, bookId from t_favorite group by bookId) d on a.bookId = d.bookId where 1=1",
            condition = " and a.bookId=?";

        sql = start + strL + end + condition;
        arr = [param.bookId];
        db.query(sql, arr, function (e, r) {
            if (e) {
                rt.code = 500;
                rt.message = e.message;
            } else {
                rt.code = 200;
                rt.data = r[0];
            }
            callback(rt);
        });
    },
    edit: function (param, callback) {
        var sql, arr, rt = {};
        sql = "update t_book set bookName= ?, price=?, author=?, updateTime=now() where bookId=?";
        arr = [param.bookName, param.price, param.author, param.bookId];
        db.query(sql, arr, function (e, r) {
            if (e) {
                rt.code = 500;
                rt.message = e.message;
                callback(rt);
            } else {
                sql = "delete from t_book_category where bookId=?";
                arr = [param.bookId];
                db.query(sql, arr, function (e1) {
                    if (e1) {
                        rt.code = 500;
                        rt.message = e1.message;
                        callback(rt);
                    } else {
                        sql = "insert into t_book_category (bookId, categoryId) values (? ,(select categoryId from t_category where categoryName = ?))";
                        arr = [param.bookId, param.categoryName];
                        db.query(sql, arr, function (e2, r2) {
                            if (e2) {
                                rt.code = 500;
                                rt.message = e2.message;
                            } else {
                                rt.code = 200;
                                rt.data = "update success";
                            }
                            callback(rt);
                        });
                    }
                });
            }

        });
    },
    like: function (param, callback) {
        var sql = "select count(*) as count from t_favorite where bookId = ? and userId = ?";
        var arr = [param.bookId, param.userId];
        var rt = {};
        db.query(sql, arr, function (e, r) {
            if (e) {
                rt.code = 500;
                rt.message = e.message;
                callback(rt);
            } else if (r[0].count) {
                sql = "delete from t_favorite where bookId = ? and userId = ?";
                db.query(sql, arr, function (e1) {
                    if (e1) {
                        rt.code = 500;
                        rt.message = e1.message;
                    } else {
                        rt.code = 200;
                        rt.data = -1;
                    }
                    callback(rt);
                });
            } else {
                sql = "insert into  t_favorite (bookId, userId) values (?, ?)";
                db.query(sql, arr, function (e1) {
                    if (e1) {
                        rt.code = 500;
                        rt.message = e1.message;
                    } else {
                        rt.code = 200;
                        rt.data = 1;
                    }
                    callback(rt);
                });
            }

        });
    }
};


module.exports = serviceImpl;