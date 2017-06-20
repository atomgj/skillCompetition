function loadLogin(){

	var isRem = localStorage.getItem('isRem'),
		loginInfo = localStorage.getItem('loginInfo');

	if(isRem){
		loginInfo = JSON.parse(loginInfo);
		$('#username').val(loginInfo.username);
		$('#password').val(loginInfo.password);
		$('#isRem').attr('checked', true);
	}else{
		$('#username').val('');
		$('#password').val('');
		$('#isRem').attr('checked', false);
	}

}

function remember(){
	$('#isRem').attr('checked', !$('#isRem').attr('checked'));
}

function login(){
	var param = {
		username : $('#username').val(),
		password : $('#password').val()
	};

	$.ajax({
		url: 'http://127.0.0.1:3000/login',
		type: 'POST',
		data: param,
		success: function(rep){
			var rt = JSON.parse(rep);
			var isRem = $('#isRem').attr('checked');
			if(rt.code == 200){
				sessionStorage.setItem('user', JSON.stringify(rt.data));

				if(isRem){
					localStorage.setItem('isRem', true);
					localStorage.setItem('loginInfo', JSON.stringify(param));
				}else{
					localStorage.removeItem('isRem');
					localStorage.removeItem('loginInfo');
				}
				

				location.href = localStorage.getItem('url') || 'index.html';
			}else{
				$('.errorMsg').html(rt.message);
			}
		},
		error: function(){
			$('.errorMsg').html('http server error!');
		}
	});
}

function register(){
	var param = {
		username: $('#username').val(),
        email: $('#email').val(),
        mobile: $('#mobile').val(),
        password: $('#password').val(),
        ckPassword: $('#ckPassword').val()
	};

	var validate = validateForm(param);

	if(validate){
		$.ajax({
            url: 'http://127.0.0.1:3000/register',
            type: 'POST',
            data: param,
            success: function(rep){
                var rt = JSON.parse(rep);
                var isRem = $('#isRem').attr('checked');
                if(rt.code == 200){
                   location.href = 'login.html';
                }else{
                   $('.errorMsg').html(rt.message);
                }
            },
            error: function(){
                $('.errorMsg').html('http server error!');
            }
		});

	}

}

function validdate(param){
	var reg, valid = true;

	if(param.key == 'username'){
		reg = /^[A-Za-z]{1}([A-Za-z0-9]|[_]){0,29}$/;
	}else if(param.key == 'email'){
		reg = /^([a-zA-Z0-9_\.\-])+\@[a-zA-Z0-9_\-\.]+$/;
	}else if(param.key == 'mobile'){
		reg = /^1[3-8]{1}([0-9]{9})$/;
	}else{
		reg = /.$/;
	}

	if(!param.value){
		valid = false;
		$('#'+ param.key).after(`<label class='error' for="${param.key}">${param.label}不能为空！</label>`);
	}else if(!reg.test(param.value)){
		$('#'+ param.key).after(`<label class='error' for="${param.key}">${param.label}不合法！</label>`);
		valid = false;
	}
	
	if(valid && param.key=='ckPassword'){
		if(param.value != param._value){
			$('#'+ param.key).after(`<label class='error' for="${param.key}">两次密码不一致！</label>`);
			valid = false;
		}
	}

	if(!valid){
		$('#'+ param.key).addClass('invalid');
	}

	if(valid && param.key.indexOf('password') < 0){
		check(param);
	}

}

function validateForm(form){
	$('.error').remove();
	$('.invalid').removeClass('invalid');

	validdate({key:'username', value:form.username, label: "用户名"});
	validdate({key:'email', value:form.email, label: "邮箱"});
	validdate({key:'mobile', value:form.mobile, label: "手机号"});
	validdate({key:'password', value:form.password, _value: form.ckPassword, label: "密码"});
	validdate({key:'ckPassword', value:form.ckPassword, _value: form.password, label: "确认密码"});

	return !$('.error').length;
}


function check(param){
	$.ajax({
		url: 'http://127.0.0.1:3000/check',
		type: 'POST',
		data: param,
		success: function(rep){
			var rt = JSON.parse(rep);
			var isRem = $('#isRem').attr('checked');
			if(rt.code != 200){
			   $('#'+param.key).after(`<label for="${param.key}" class="error">${param.label}已被使用！</label>`)
			}
		},
		error: function(){
			$('.errorMsg').html('http server error!');
		}
	});

}


var search = {
	pageNo: 1,
	pageSize: 10,
	sortColumns: 'updateTime',
	sortType: 'ASC'
};

var user = sessionStorage.getItem('user');

if(user){
	user = JSON.parse(user);
	search.userId = user.userId;
	search.role = user.role;

	$('#loginUser').text(user.username);
}

function cateQuery(){
	var param = {
		userId: user.userId
	}
	$.ajax({
		url: 'http://127.0.0.1:3000/category',
		type: 'POST',
		data: param,
		success: function(rep){
			var rt = JSON.parse(rep);
			if(rt.code == 200){
			   var rows = rt.data, i;
			   $('.s-item-c li:first').nextAll().remove();
			   for(i=0; i<rows.length; i++){
					$('.s-item-c').append(`<li onclick="doCategory(${rows[i].categoryId}, this)">${rows[i].categoryName}</li>`);
			   }
			}else{
			   $('.errorMsg').html(rt.message); 
			}
		},
		error: function(){
			$('.errorMsg').html('http server error!');
		}
	});
}

function pageQuery(){
	$.ajax({
		url: 'http://127.0.0.1:3000/list',
		type: 'POST',
		data: search,
		success: function(rep){
			var rt = JSON.parse(rep);
			if(rt.code == 200){
			   var rows = rt.data.rows,
				   totalCount = rt.data.count, 
				   pageCount,
				   i;

			   //处理data
			   $('.d-item').empty();
			   for(i=0;i<rows.length;i++){
					$('.d-item').append(`<li>
					<div class="d-item-i"><a href="view?bookId=${rows[i].bookId}"><img src="images/${rows[i].bookId}.jpg"/></a></div>
					<div class="d-item-i"><span class="i-name">${rows[i].bookName}</span></div>
					<div class="d-item-i"><span class="i-author">${rows[i].author}</span></div>
					<div class="d-item-i"><span class="i-unit">￥</span><span class="i-price">${rows[i].price}</span></div>
					<div class="d-item-i"><span class="i-category">${rows[i].categoryName}</span></div>
					<div class="d-item-i"><span class="i-favorite">${rows[i].fav}</span><span class="i-zan">赞</span></div>
				</li>`);
			   }

			   //处理分页
			   pageCount =  Math.ceil(totalCount / search.pageSize);
			   search.pageCount = pageCount;

			   $('.p-page').empty();
			   for(i=1; i<=pageCount;i++){
					var isActive = (search.pageNo == i ? 'active':'');
					$('.p-page').append(`<li class="${isActive}" onclick="gotoPage(${i})">${i}</li>`);
			   }

			   checkPage();
			}else{
			   $('.errorMsg').html(rt.message); 
			}
		},
		error: function(){
			$('.errorMsg').html('http server error!');
		}
	});
}


function gotoPage(symb){
	var no = search.pageNo;
	if(symb == '--'){
		no = 1;
	}else if(symb == '-'){
		no = no - 1 ;
	}else if(symb == '+'){
		no = no + 1;
	}else if(symb == '++'){
		no = search.pageCount;
	}else{
		no = symb;
	}

	if(no < 1 || no > search.pageCount){
		return false;
	}

	search.pageNo = no;
	pageQuery();
}

function checkPage(){

	if(search.pageCount <= 1){
		$('.pageArea').hide();
	}else{
		$('#first, #prev, #next, #last').removeClass('disabled');
		if(search.pageNo == 1){
			$('#first, #prev').addClass('disabled');
		}else if(search.pageNo == search.pageCount){
			$('#next, #last').addClass('disabled');
		}
		$('.pageArea').show();
	}
}

function doCategory(id, self){
	$(self).siblings().removeClass('active');
	$(self).addClass('active');

	if(id){
		search.categoryId = id;
	}else{
		delete search.categoryId;
	}
	pageQuery();
}

function doPrice(id, self){
	$(self).siblings().removeClass('active');
	$(self).addClass('active');

	if(id){
		search.priceType = id;
	}else{
		delete search.priceType;
	}
	pageQuery();
}


function doTime(id, self){
	$(self).siblings().removeClass('active');
	$(self).addClass('active');

	if(id){
		search.timeType = id;
	}else{
		delete search.timeType;
	}
	
	pageQuery();
}

function globalSearch(){
	search = {
		pageNo: 1,
		pageSize: 10,
		sortColumns: 'updateTime',
		sortType: 'ASC'

	};

	var user = sessionStorage.getItem('user');

	if(user){
		user = JSON.parse(user);
		search.userId = user.userId;
		search.role = user.role;
	}

	search.global = $('#global').val();

	$('.s-item-c li').removeClass('active');
	$('.s-item-c li:first').addClass('active');

	$('.s-item-p li').removeClass('active');
	$('.s-item-p li:first').addClass('active');

	$('.s-item-t li').removeClass('active');
	$('.s-item-t li:first').addClass('active');
	pageQuery();

}

function doSort(columns, self){

	$('.sortType').remove();
	var sort = 'up';

	if(search.sortColumns == columns){
		if(search.sortType == 'ASC'){
			search.sortType = 'DESC';
			sort = 'down';
		}else{
			search.sortType = 'ASC';
			sort = 'up';
		}
	}else{
		$('.s-item-s li').removeClass('active');		
	}

	$(self).addClass('active');
	search.sortColumns = columns;

	$(self).append(`<div class="sortType ${sort}"></div>`);

	pageQuery();
}