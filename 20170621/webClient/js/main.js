
function ajaxRequest(url, param, success, error){
    $.ajax({
        url: 'http://127.0.0.1:3000/'+url,
        type: 'POST',
        data: param,
        success: function(rep){
            var rt = JSON.parse(rep);
            if(rt.code == 200){
                if(success){
                    success(rt);
                }
            }else{
                if(error){
                    error(rt);
                }else{
                    if(rt.code == 401){
                        localStorage.setItem('url', location.href);
                        location.href = 'login.html';
                    }else{
                        $('.errorMsg').text(rt.message);
                    }
                }
            }

        },
        error: function(){
            $('.errorMsg').text('http server error');
        }
    });
}

function loadLogin(){
    var isRem = localStorage.getItem('isRem'),
        loginInfo = localStorage.getItem('loginInfo');

    if(isRem && loginInfo){
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
    $('#isRem').attr('checked',!$('#isRem').attr('checked'));
}
function login(){
    var param = {
      username: $('#username').val(),
      password: $('#password').val()
    };

    ajaxRequest('login', param, function(rt){
        var checked = $('#isRem').attr('checked');
        if(checked){
            localStorage.setItem('isRem', true);
            localStorage.setItem('loginInfo', JSON.stringify(param));
        }else{
            localStorage.removeItem('isRem');
            localStorage.removeItem('loginInfo');
        }

        sessionStorage.setItem('user', JSON.stringify(rt.data));
        location.href = localStorage.getItem('url') || 'index.html';
    });
}

function register(){
    var param = {
        username: $('#username').val(),
        mobile: $('#mobile').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        passwordCK: $('#passwordCK').val()
    };

    checkForm(param);
    setTimeout(function(){
        if(!$('.error').length){
            ajaxRequest('register', param, function(){
                location.href = 'login.html';
            });
        }
    },1000);

}


function checkForm(form){

    $('.error').remove();
    $('.invalid').removeClass('invalid');

    validate({key:'username', value:form.username, label: '用户名'});
    validate({key:'email', value:form.email, label: '邮箱'});
    validate({key:'mobile', value:form.mobile, label: '手机号'});
    validate({key:'password', value:form.password, _value : form.passwordCK, label: '密码'});
    validate({key:'passwordCK', value:form.passwordCK, _value : form.password, label: '确认密码'});

    return !$('.error').length;
}

function validate(param){
    var reg, valid = true;
    if(param.key == 'username'){
        reg = /^[A-Za-z]{1}([A-Za-z0-9]|[_]){0,29}$/;
    }else if(param.key == 'email'){
        reg = /^([A-Za-z0-9_\-\.])+\@[A-Za-z0-9_\-\.]+$/;
    }else if(param.key == 'mobile'){
        reg = /^1[3-8]{1}[0-9]{9}$/;
    }else{
        reg = /.$/;
    }

    if(!param.value){
        $('#'+param.key).after(`<label class="error" for="${param.key}">${param.label}不能为空！</label>`);
        $('#'+param.key).addClass('invalid');
        valid = false;
    }else if(!reg.test(param.value)){
        $('#'+param.key).after(`<label class="error" for="${param.key}">${param.label}不合法！</label>`);
        $('#'+param.key).addClass('invalid');
        valid = false;
    }else if(param.key.indexOf('password')<0){
        checkInDB(param);
    }

    if(valid){
        if(param.key == 'passwordCK'){
            if(param.value != param._value){
                $('#'+param.key).after(`<label class="error" for="${param.key}">两次密码不一致！</label>`);
                $('#'+param.key).addClass('invalid');
            }
        }
    }
}

function checkInDB(param){
    ajaxRequest('check', param, null, function(){
        $('#'+param.key).after(`<label class="error" for="${param.key}">${param.label}已使用！</label>`);
        $('#'+param.key).addClass('invalid');
    });
}

var search = {
    pageNo : 1,
    pageSize: 10,
    sortColumns: 'updateTime',
    sortType : 'ASC'
};

var user = sessionStorage.getItem('user');
if(user){
    user = JSON.parse(user);
    search.userId = user.userId;
    search.role = user.role;
    $('.login-user').text(user.username);
}

function cateQuery(){
    var param = {
        userId: user.userId
    };
    ajaxRequest('category', param, function(rt){
        var i, rows = rt.data;

        $('.s-item-c li:first').nextAll().remove();
        for(i=0;i<rows.length;i++){
            $('.s-item-c').append(` <li onclick="doSearch(${rows[i].categoryId}, this, 1)">${rows[i].categoryName}</li>`);
        }
    })
}

function pageQuery(){
    ajaxRequest('list', search, function(rt){
        var i, rows = rt.data.rows, totalCount = parseInt(rt.data.count);

        $('.d-item').empty();
        for(i=0;i<rows.length;i++){
            var d = rows[i];
            $('.d-item').append(`
                <li>
                    <div class="i-item"><a href="view.html?bookId=${d.bookId}"><img class="d-img" src="images/${d.bookId}.jpg"/></a></div>
                    <div class="i-item"><div class="d-name">${d.bookName}</div></div>
                    <div class="i-item"><div class="d-author">${d.author}</div></div>
                    <div class="i-item"><div class="d-price"><span class="unit">￥</span><span class="price">${d.price}</span></div></div>
                    <div class="i-item"><div class="d-category">${d.categoryName}</div></div>
                    <div class="i-item"><div class="d-favorite"><span class="fav">${d.fav}</span><span class="d-zan">赞</span></div></div>
                    <div class="i-item"><a href="edit.html?bookId=${d.bookId}">编辑</a></div>
                </li>
            `);
        }

        var pageCount = Math.ceil(totalCount/search.pageSize);
        search.pageCount = pageCount;
        $('.p-page').empty();
        for(i=1;i<=pageCount;i++){
            var active = i==search.pageNo? 'active': '';
            $('.p-page').append(`<li class="${active}" onclick="gotoPage(${i})">${i}</li>`);
        }

        checkPage();

    });
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

function searchAll(){
    search.global = $('#searchAll').val();
    pageQuery();
}

function doSearch(v, self, type){
    $(self).siblings().removeClass('active');
    $(self).addClass('active');

    if(type == 1){
        search.categoryId = v;
    }else if(type == 2){
        search.priceType = v;
    }else if(type == 3){
        search.timeType = v;
    }else if(type == 4){

        if(search.sortColumns == v){
            search.sortType = (search.sortType == 'ASC' ? 'DESC' : 'ASC');
        }else{
            search.sortColumns = v;
            search.sortType = 'ASC';
        }
        var clazz = (search.sortType == 'ASC' ? 'up' : 'down');
        $('.sortType').removeClass('up').removeClass('down');
        $(self).find('.sortType').addClass(clazz);
    }

    if(v == 0 && type == 1){
        delete search.categoryId;
    }else if(v == 0 && type == 2){
        delete search.priceType;
    }else if(v == 0 && type == 3){
        delete search.timeType;
    }

    pageQuery();
}

function gotoPage(symb){
    var no = search.pageNo;
    if(symb == '--'){
        no = 1;
    }else if(symb == '-'){
        no = no - 1;
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

function parseURL(flag){
    var url = location.href,
        param = url.split('?')[1],
        bookId = param.split('=')[1];
    view(bookId, flag);
}

function view(bookId, flag){
    var param = {
        userId: user.userId,
        bookId: bookId
    };

    if(flag){
        ajaxRequest('category', param, function(rt){
            $('.cate-list').empty();
            var i, rows = rt.data;
            for(i = 0; i< rows.length; i++){
                $('.cate-list').append(`<span onclick="setCategory(this)">${rows[i].categoryName}</span>`);
            }
        });
    }
    ajaxRequest('view', param, function(rt){
       var d = rt.data;
       if(flag){
           $('#bookName').val(d.bookName);
           $('#author').val(d.author);
           $('#price').val(d.price);
           $('#categoryName').val(d.categoryName);
           $('.d-img').attr('src', 'images/'+d.bookId+".jpg");
       }else{
           $('.dataArea').empty().append(`
                    <div class="i-item"><img class="d-img" src="images/${d.bookId}.jpg"/></div>
                    <div class="i-item"><div class="d-name">${d.bookName}</div></div>
                    <div class="i-item"><div class="d-author">${d.author}</div></div>
                    <div class="i-item"><div class="d-price"><span class="unit">￥</span><span class="price">${d.price}</span></div></div>
                    <div class="i-item"><div class="d-category">${d.categoryName}</div></div>
                    <div class="i-item"><div class="d-favorite"><span class="favorite">${d.fav}</span><span class="d-zan" onclick="like()">赞</span></div></div>
            `);
       }
       $('#bookId').val(d.bookId);
       $('#favorite').val(d.fav);
    });
}

function showCateList(){
    $('.cate-list').show();
}

function setCategory(self){
    $(self).siblings().removeClass('active');
    $(self).addClass('active');
    $('#categoryName').val($(self).text());
    $('.cate-list').hide();
}

function edit(){
    var param = {
        bookId: $('#bookId').val(),
        bookName: $('#bookName').val(),
        price: $('#price').val(),
        categoryName: $('#categoryName').val(),
        author: $('#author').val(),
        userId: user.userId
    };

    ajaxRequest('edit', param, function(){
        location.href = 'index.html';
    });
}

function like(){
    var param = {
        userId: user.userId,
        bookId: $('#bookId').val()
    };
    ajaxRequest('like', param, function(rt){
        var count = parseInt($('#favorite').val()) + parseInt(rt.data);
        $('#favorite').val(count);
        $('.favorite').text(count);
    })
}

var geo = [
    {
        "name": "江苏",
        "level": 0,
        "list" : [
            {
                "name": "南京",
                "level": 1,
                "list" : []
            },{
                "name": "苏州",
                "level": 1,
                "list" : []
            },{
                "name": "常州",
                "level": 1,
                "list" : []
            },{
                "name": "镇江",
                "level": 1,
                "list" : []
            }
        ]
    },
    {
        "name": "浙江",
        "level": 0,
        "list" : [
            {
                "name": "杭州",
                "level": 1,
                "list" : []
            },{
                "name": "宁波",
                "level": 1,
                "list" : []
            },{
                "name": "台州",
                "level": 1,
                "list" : []
            }
        ]
    }
];
function showProList(){
    $('.pro-list').show();

    var i, rows = geo;
    var province = $('#province').val();
    $('.pro-list').empty();
    for(i=0;i<rows.length;i++){
        var active = province == rows[i].name ? 'active' :'';
        $('.pro-list').append(`<span class="${active}" onclick="setPro(this)">${rows[i].name}</span>`);
    }
}

function setPro(self){
    $(self).siblings().removeClass('active');
    $(self).addClass('active');
    $('#province').val($(self).text());
    $('.pro-list').hide();
    $('.step2').show();
    $('#city').val('');
}

function showCityList(){
    $('.city-list').show();

    var i, rows = geo,
        rows_,
        pro = $('#province').val();

    for(i = 0;i<rows.length;i++){
        if(rows[i].name == pro){
            rows_ = rows[i].list;
        }
    }

    var city = $('#city').val();


    $('.city-list').empty();
    for(i=0;i<rows_.length;i++){
        var active = '';
        if(city && city == rows_[i].name){
            active = 'active';
        }
        $('.city-list').append(`<span class="${active}" onclick="setCity(this)">${rows_[i].name}</span>`);
    }
}

function setCity(self){
    $(self).siblings().removeClass('active');
    $(self).addClass('active');
    $('#city').val($(self).text());
    $('.city-list').hide();
}