var db = require('../config/db'),
	serviceImpl;

serviceImpl = {
	login: function(param, callback){
	
		var sql, arr, rt = {};
		sql = "select * from t_user where (username = ? or email = ? or mobile = ?) and password = ?";
		arr = [param.username, param.username,param.username, param.password];
		db.query(sql, arr , function(e, r){
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

	check: function(param, callback){
		var sql, arr, rt = {};
		sql = "select * from t_user where username = ? or email = ? or mobile = ?";
		arr = [param.value,param.value,param.value];
		db.query(sql, arr , function(e, r){
			if(e){
				rt.code = 500;
				rt.message = e.message;
			}else if(r.length){
				rt.code = 600;
				rt.data = "existed";
			}else{
				rt.code = 200;
				rt.message = "usable";
			}
			callback(rt);
		});
	},

	register: function(param, callback){
	

		var sql, arr, rt = {};

		sql = "select * from t_user where username in (?,?,?) or mobile in (?,?,?) or email in (?,?,?)"
		arr = [param.username, param.email, param.mobile,param.username, param.email, param.mobile,param.username, param.email, param.mobile]

		db.query(sql,arr,function(e1, r1){
		
			if(e1){
				rt.code = 500;
				rt.message = e1.message;
				callback(rt);
			}else if(r1.length){
				rt.code = 600;
				rt.message = "already exist";
				callback(rt);
			}else{
				sql = "insert into t_user (username, email, mobile, password, role) values (?,?,?,?,0)";
				arr = [param.username, param.email, param.mobile, param.password];
				db.query(sql, arr , function(e, r){
					if(e){
						rt.code = 500;
						rt.message = e.message;
					}else{
						rt.code = 600;
						rt.message = "register success";
					}
					callback(rt);
				});
			}
		})
		
		
	},

	category: function(param, callback){
	
		var sql,  rt = {};
		sql = "select * from t_category";
		db.query(sql, function(e, r){
			if(e){
				rt.code = 500;
				rt.message = e.message;
			}else{
				rt.code = 200;
				rt.message = r;
			}
			callback(rt);
		});
		
	},
	
	list: function(param, callback){
	
		var sql, arr, rt = {};

		var start = " select ",
			strc = " count(*) as count ",
			strl = " a.*, c.categoryName, case when d.fav is null then 0 else d.fav end as fav ",
			end = " from t_book a left join t_book_category b on a.bookId = b.bookId left join t_category c on b.categoryId= c.categoryId left join (select count(*) as fav , bookId from t_favorite group by bookId) d on a.bookId = d.bookId where 1=1 ",
			condition = "",
			order = " order by "+(param.sortColumns || 'a.updateTime')+" "+(param.sortType|| 'asc ') +" limit ?,?";

		if(param.categoryId){
			condition = " and c.categoryId = "+param.categoryId;
		}
		if(param.global){
			condition = " and (a.bookName like '%"+param.global+"%' or c.categoryName like '%"+param.global+"%'  or a.author like '%"+param.global+"%' )";
		}

		if(param.timeType){
			if(param.timeType == 1){
				condition = " and a.updateTime > date_sub(nows(), interval 1 day)";
			}else if(param.timeType == 2){
				condition = " and a.updateTime > date_sub(nows(), interval 7 day)";
			}else if(param.timeType == 3){
				condition = " and a.updateTime > date_sub(nows(), interval 1 hour)";
			}else if(param.timeType == 4){
				condition = " and a.updateTime > date_sub(nows(), interval 5 minute)";
			}
		}

		if(param.priceType){
			if(param.priceType == 1){
				condition = " and a.price between 1 and 50";
			}else if(param.priceType == 2){
				condition = " and a.price between 50 and 100";
			}else if(param.priceType == 3){
				condition = " and a.price between 100 and 150";
			}else if(param.priceType == 4){
				condition = " and a.price between 150 and 200";
			}
		}

		if(param.author){
			condition = " and a.author like '%"+param.author+"%'";
		}
		if(param.bookName){
			condition = " and a.bookName like '%"+param.bookName+"%'";
		}

		sql = start + strc + end + condition;
		db.query(sql, function(e, r){
			if(e){
				rt.code = 500;
				rt.message = e.message;
				callback(rt);
			}else{
				sql = start + strl + end + condition + order;
				arr = [param.startIndex || 0, param.pageSize || 10];
				db.query(sql, arr, function(e1, r1){
					if(e1){
						rt.code = 500;
						rt.message = e1.message;
					}else{
						rt.code = 200;
						rt.data = {
							count : r[0].count,
							rows: r1
						};
					}
					callback(rt);
				});
			}
			
		});
		
	},

	view: function(param, callback){
	
		var sql, arr, rt = {};
		var start = " select ",
			strl = " a.*, c.categoryName, case when d.fav is null then 0 else d.fav end as fav ",
			end = " from t_book a left join t_book_category b on a.bookId = b.bookId left join t_category c on b.categoryId= c.categoryId left join (select count(*) as fav , bookId from t_favorite group by bookId) d on a.bookId = d.bookId where 1=1 ",
			condition = " and a.bookId="+ param.bookId,

		sql = start + strl + end + condition;
		db.query(sql, function(e, r){
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
		
		sql = "update t_book set bookName=?, price=?, author=?, updateTime= now() where bookId= ?";
		arr = [param.bookName, param.price, param.author, param.bookId];

		db.query(sql, arr, function(e, r){
			if(e){
				rt.code = 500;
				rt.message = e.message;
				callback(rt);
			}else{
				sql = "delete from t_book_category where bookId = ?";
				arr = [param.bookId];
				db.query(sql, arr, function(e1, r1){
					if(e1){
						rt.code = 500;
						rt.message = e1.message;
						callback(rt);
					}else{
						sql = "insert into t_book_category (bookId, categoryId) values (?, ?)";
						arr = [param.bookId, param.categoryId];

						db.query(sql, arr, function(e2, r2){
							if(e2){
								rt.code = 500;
								rt.message = e1.message;
							}else{
								rt.code = 200;
								rt.message = "update success";
							}
							callback(rt);
						})
					}
				})
			}
		});
		
	},

	edit1: function(param, callback){
	
		var sql, arr, str='',rt = {};
		arr = [param.bookId];

		if(param.price){
			str += " ,price="+param.price;
		}
		if(param.bookName){
			str += " ,bookName='"+param.bookName+"'";
		}
		if(param.author){
			str += " ,author='"+param.author+"'";
		}

		sql = "update t_book set updateTime= now() "+ str +" where bookId= ?";
		db.query(sql, arr, function(e, r){
			if(e){
				rt.code = 500;
				rt.message = e.message;
				callback(rt);
			}else if(param.categoryName){
				sql = "update t_book_category set categoryId = (select categoryId from t_category where categoryName = ? ) where bookId = ?";
				arr = [param.categoryName, param.bookId];
				db.query(sql, arr, function(e1, r1){
					if(e1){
						rt.code = 500;
						rt.message = e1.message;
						
					}else{
						rt.code = 200;
								rt.message = "update success";
					}
					callback(rt);
				})
			}else{
				rt.code = 200;
				rt.message = "update success";
				callback(rt);	
			}
		});
		
	},

	like :function(param, callback){
	
		var sql, arr, rt = {};
		
		sql = "select * from t_favorite where bookId=? and userId=?";
		arr = [param.bookId, param.userId];

		db.query(sql, arr, function(e, r){
			if(e){
				rt.code = 500;
				rt.message = e.message;
				callback(rt);
			}else if(r.length){
				sql = "delete from t_favorite where bookId=? and userId=?";
				db.query(sql, arr, function(e1, r1){
					if(e1){
						rt.code = 500;
						rt.message = e1.message;
					}else{
						rt.code = 200;
						rt.data = -1;
					}
					callback(rt);
				})
			}else {
				sql = "insert into t_favorite (bookId, userId, updateTime) values (?,?,now())";
				db.query(sql, arr, function(e1, r1){
					if(e1){
						rt.code = 500;
						rt.message = e1.message;
					}else{
						rt.code = 200;
						rt.data = 1;
					}
					callback(rt);
				})
			}
		});
		
	},
};


module.exports = serviceImpl;