/**
 * Created by lgj on 2017/6/22.
 */
var db = require('../config/db'),
    serviceImpl;


serviceImpl = {
    login: function(param, callback){
        var sql, arr, rt = {};
        sql = "select * from t_user where (username = ? or email = ? or mobile = ? ) and password = ?";
        arr = [param.username, param.username, param.username, param.password];
        db.query(sql, arr, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;
            }else if(r.length){
                rt.code = 200;
                rt.data = r[0];
            }else{
                rt.code = 600;
                rt.message = "username or password is incorrect";
            }
            callback(rt);
        });
    },
    register: function(param, callback){
        var sql, arr, rt = {};
        sql = "insert into t_user (username,email,mobile,password,role) values (?,?,?,?,1)";
        arr = [param.username, param.email, param.mobile, param.password];
        db.query(sql, arr, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;
            }else{
                rt.code = 200;
                rt.message = "register success";
            }
            callback(rt);
        });
    },
    check: function(param, callback){
        var sql, arr, rt = {};
        sql = "select * from t_user where username = ? or email = ? or mobile = ?";
        arr = [param.value, param.value, param.value];
        db.query(sql, arr, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;
            }else if(r.length){
                rt.code = 500;
                rt.message = "existed";
            }else{
                rt.code = 200;
                rt.message = "usable";
            }
            callback(rt);
        });
    },
    category: function(param, callback){
        var sql, rt = {};
        sql = "select * from t_category";
        db.query(sql, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;
            }else{
                rt.code = 200;
                rt.data = r;
            }
            callback(rt);
        });
    },
    list: function(param, callback){
        var sql,  rt = {};
        var start = " select ",
            strc = " count(*) as count",
            strl = " a.*, c.categoryName, case when d.favorite is null then 0 else d.favorite end as favorite",
            end = " from t_book a left join t_book_category b on a.bookId = b.bookId left join t_category c on b.categoryId = c.categoryId left join (select count(*) as favorite , bookId from t_favorite group by bookId) d on a.bookId = d.bookId where 1=1 ",
            condition = "",
            order = " order by "+(param.sortColumns||'updateTime')+" "+(param.sortType||'ASC'),
            limit = " limit "+(param.startIndex||0)+", "+(param.pageSize||10)+" ";

        if(param.global){
            condition += " and (a.bookName like '%"+param.global+"%' or a.author like '%"+param.global+"%'  or c.categoryName like '%"+param.global+"%')";
        }
        if(param.categoryId){
            condition += " and c.categoryId ="+param.categoryId;
        }
        if(param.priceType){
            if(param.priceType ==1){
                condition += "and a.price between 1 and 50";
            }else if(param.priceType == 2){
                condition += "and a.price between 50 and 100";
            }else if(param.priceType == 3){
                condition += "and a.price between 100 and 200";
            }else if(param.priceType == 4){
                condition += "and a.price > 200 ";
            }
        }
        if(param.timeType){
            if(param.timeType ==1){
                condition += "and a.updateTime > data_sub(now(), interval 1 day)";
            }else if(param.timeType == 2){
                condition += "and a.updateTime < data_sub(now(), interval 3 day)";
            }else if(param.timeType == 3){
                condition += "and a.updateTime < data_sub(now(), interval 7 day)";
            }else if(param.timeType == 4){
                condition += "and a.updateTime > data_sub(now(), interval 5 minute)";
            }
        }
        sql = start + strc + end + condition;
        db.query(sql, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;
                callback(rt);
            }else{
                sql = start + strl + end + condition + order + limit;
                db.query(sql, function(e1, r1){
                    if(e1){
                        rt.code = 500;
                        rt.message = e1.message;
                    }else{
                        rt.code = 200;
                        rt.data = {
                            count : r[0].count,
                            rows: r1
                        };
                        rt.message = sql;
                    }
                    callback(rt);
                });
            }

        });
    },
    view: function(param, callback){
        var sql, arr, rt = {};
        var start = " select ",
            strl = " a.*, c.categoryName, case when d.favorite is null then 0 else d.favorite end as favorite",
            end = " from t_book a left join t_book_category b on a.bookId = b.bookId left join t_category c on b.categoryId = c.categoryId left join (select count(*) as favorite , bookId from t_favorite group by bookId) d on a.bookId = d.bookId where 1=1 ",
            condition = " and a.bookId = ?";
        arr = [param.bookId];
        sql = start + strl + end + condition;
        db.query(sql, arr, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;

            }else{
                rt.code = 200;
                rt.data = r[0];
            }
            callback(rt);

        });
    },
    edit: function(param, callback){
        var sql, arr, rt = {};
        arr = [param.bookName, param.price, param.author, param.bookId];
        sql = "update t_book set updateTime = now(), bookName = ?, price = ?, author = ? where bookId = ?";
        db.query(sql, arr, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;
                callback(rt);
            }else{
                sql = "update t_book_category set categoryId = (select categoryId from t_category where categoryName = ?) where bookId = ?";
                arr = [param.categoryName, param.bookId];
                db.query(sql, arr, function(e1, r1){
                    if(e1){
                        rt.code = 500;
                        rt.message = e1.message;
                        callback(rt);
                    }else{
                        rt.code = 200;
                        rt.message = "updated success";
                    }
                    callback(rt);
                });
            }
        });
    },
    like :  function(param, callback){
        var sql, arr, rt = {};
        arr = [param.bookId, param.userId];
        sql = "select * from t_favorite where bookId = ? and userId = ?";
        db.query(sql, arr, function(e, r){
            if(e){
                rt.code = 500;
                rt.message = e.message;
                callback(rt);
            }else if(r.length){
                sql = "delete from t_favorite where bookId = ? and userId = ?";
                db.query(sql, arr, function(e1){
                    if(e1){
                        rt.code = 500;
                        rt.message = e1.message;
                    }else{
                        rt.code = 200;
                        rt.data = -1;
                    }
                    callback(rt);
                });
            }else{
                sql = "insert into t_favorite (bookId, userId, updateTime) values (?,?,now())";
                db.query(sql, arr, function(e1){
                    if(e1){
                        rt.code = 500;
                        rt.message = e1.message;
                    }else{
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