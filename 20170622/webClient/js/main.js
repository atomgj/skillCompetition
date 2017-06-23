/**
 * Created by lgj on 2017/6/22.
 */
function initLogin(){
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

function ajaxRequest(url, param, success, error){

    var user = sessionStorage.getItem('user');
    if(user){
        user = JSON.parse(user);
        param.userId = user.userId;
    }
    $.ajax({
        url : 'http://127.0.0.1:3000/'+url,
        data: param,
        type: 'post',
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
                    $('.errorMsg').html(rt.message);
                    if(rt.code == 401){
                        localStorage.setItem('url', location.href);
                        location.href = 'login.html';
                    }
                }
            }
        },
        error: function(){
            $('.errorMsg').html('http server error');
        }
    });
}

function login(){

    var param = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    ajaxRequest('login', param, function(rt){
        var isRem = $('#isRem').attr('checked');
        if(isRem){
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

function checkInDB(param){
    ajaxRequest('check', param, 0, function(){
        $('#'+param.key).after(`<label class="error">${param.label}已使用！</label>`);
        $('#'+param.key).addClass('invalid');
    })
}

function register(){
    var form = {
        username : $('#username').val(),
        email : $('#email').val(),
        mobile : $('#mobile').val(),
        password : $('#password').val(),
        passwordCK : $('#passwordCK').val()
    };

    checkForm(form);

    setTimeout(function(){
        var valid = !$('.error').length;
        if(valid){
            ajaxRequest('register', form, function(){
                location.href = 'login.html';
            })
        }
    })
}

function checkForm(form){

    $('.error').remove();
    $('.invalid').removeClass('invalid');

    validate({key: 'username', value: form.username, label: '用户名'});
    validate({key: 'mobile', value: form.mobile, label: '手机号'});
    validate({key: 'email', value: form.email, label: '邮箱'});
    validate({key: 'password', value: form.password, _value: form.passwordCK, label: '密码'});
    validate({key: 'passwordCK', value: form.passwordCK, _value: form.password, label: '确认密码'});
}

function validate(param){
    var reg, valid = true;
    if(param.key == 'username'){
        reg = /^[A-Za-z]{1}([A-Za-z0-9_/./-]{0,29})$/
    }else if(param.key == 'mobile'){
        reg = /^1[3-8]{1}([0-9]{9})$/
    }else if(param.key == 'email'){
        reg = /^[A-Za-z0-9_/./-]+\@[A-Za-z0-9_/./-]+$/
    }else{
        reg = /.$/
    }

    if(!param.value){
        $('#'+param.key).after(`<label class="error">${param.label}不能为空！</label>`);
        $('#'+param.key).addClass('invalid');
        valid = false;
    }else if(!reg.test(param.value)){
        $('#'+param.key).after(`<label class="error">${param.label}不符合规定！</label>`);
        $('#'+param.key).addClass('invalid');
        valid = false;
    }else if(param.key.indexOf('password') < 0){
        checkInDB(param);
    }

    if(valid && param.key.indexOf('password') > -1){
        if(param.value != param._value){
            $('#'+param.key).after(`<label class="error">${param.label}两次密码不一致！</label>`);
            $('#'+param.key).addClass('invalid');
        }
    }

}

var search = {
    pageNo: 1,
    pageSize: 10,
    sortColumns: 'updateTime',
    sortType: 'ASC'
};


function cateQuery(){
    ajaxRequest('category', {}, function(rt){
        var i, rows = rt.data;
        $('.s-item-c li:first').nextAll().remove();
        for(i=0;i<rows.length;i++){
            $('.s-item-c').append(`<li onclick="doSearch(${rows[i].categoryId}, this, 1)">${rows[i].categoryName}</li>`);
        }
    });
}


function pageQuery(){

    ajaxRequest('list', search, function(rt){
        var i, totalCount = rt.data.count,
            pageCount,
            rows = rt.data.rows;

        $('.d-item').empty();
        for(i=0;i<rows.length;i++){
            var d = rows[i];
            $('.d-item').append(`
            <li>
                <div class="d-img"><a href="view.html?bookId=${d.bookId}"><img src="images/${d.bookId}.jpg" alt=""></a></div>
                <div class="d-name"><span class="bookName">>${d.bookName}</span></div>
                <div class="d-author"><span class="author">>${d.author}</span></div>
                <div class="d-category"><span class="categoryName">${d.categoryName}</span></div>
                <div class="d-price"><span class="price">${d.price}</span><span class="unit">￥</span></div>
                <div class="d-favorite"><span class="favorite">${d.favorite}</span><span class="zan">赞</span></div>
                <div class="d-edit"><a href="edit.html?bookId=${d.bookId}">编辑</a></div>
            </li>`);
        }


        pageCount = Math.ceil(totalCount / search.pageSize)
        search.pageCount = pageCount;
        $('.p-page').empty();
        for(i=1;i<=pageCount;i++){
            var active = (i == search.pageNo? 'active' : '');
            $('.p-page').append(`<li class="${active}" onclick="gotoPage(${i})">${i}</li>`)
        }

        checkPage();
    });
}

function checkPage(){

    if(search.pageCount <= 1){
        $('.p-item').hide()
    }else{
        $('#first, #prev, #next, #last').removeClass('disabled');
        if(search.pageNo == 1){
            $('#first, #prev').addClass('disabled');
        }else if(search.pageNo == search.pageCount){
            $('#next, #last').addClass('disabled');
        }
    }
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

function doSearch(v, self, type){
    $(self).siblings().removeClass('active');
    $(self).addClass('active');

    if(type == 1){
        if(v){
            search.categoryId = v;
        }else{
            delete search.categoryId;
        }
    }else if(type == 2){
        if(v){
            search.priceType = v;
        }else{
            delete search.priceType;
        }
    }else if(type == 3){
        if(v){
            search.timeType = v;
        }else{
            delete search.timeType;
        }
    }else if(type == 4){

        $(self).find('.sort-type').removeClass('up').removeClass('down');
        if(v == search.sortColumns){
            search.sortType = (search.sortType=='ASC'?'DESC':'ASC');
        }else{
            search.sortColumns = v;
            search.sortType = 'ASC';
        }

        var clazz = (search.sortType == 'ASC' ? 'down' : 'up');
        $(self).find('.sort-type').addClass(clazz);
    }

    pageQuery();
}

function searchAll(){
    search = {
        pageNo: 1,
        pageSize: 10,
        sortColumns: 'updateTime',
        sortType: 'ASC'
    };

    search.global = $('#global').val();
}

function parseURL(flag){
    var url = location.href,
        param = url.split('?')[1].split('&')[0],
        bookId = param.split('=')[1];
    view(bookId, flag);
}

function view(bookId, flag){
    var param = {
        bookId: bookId
    };
    ajaxRequest('view', param, function(rt){
        var d = rt.data;
        if(flag){
            $('#bookName').val(d.bookName);
            $('#price').val(d.price);
            $('#author').val(d.author);
            $('#categoryName').val(d.categoryName);
            $('#bookId').val(d.bookId);
            $('#favorite').val(d.favorite);
        }else{
            $('.bookName').text(d.bookName);
            $('.price').text(d.price);
            $('.author').text(d.author);
            $('.categoryName').text(d.categoryName);
            $('.favorite').text(d.favorite);
            $('#bookId').val(d.bookId);
            $('#favorite').val(d.favorite);
        }
        $('#img').attr('src', 'images/'+d.bookId+'.jpg');
        $('#edit').attr('href', 'edit.html?bookId='+d.bookId);
    })
}

function like(){
    var param = {
        bookId : $('#bookId').val()
    };

    ajaxRequest('like', param, function(rt){
        var count = parseInt($('#favorite').val()) + parseInt(rt.data);
        $('#favorite').val(count);
        $('.favorite').text(count);
    })
}

function showCategory(){

    ajaxRequest('category', {}, function(rt){
        $('.cate-list').empty();
        var categoryName = $('#categoryName').val();
        var i, rows = rt.data;
        for(i=0;i<rows.length;i++){
            var active = (categoryName == rows[i].categoryName ? 'active' : '');
            $('.cate-list').append(`<span class="${active}" onclick="setCategory(this)">${rows[i].categoryName}</span>`);
        }
        $('.cate-list').show();
    })
}

function setCategory(self){

    $('#categoryName').val($(self).text());
    $('.cate-list').hide();

}

function edit(){
    var param = {
        bookId : $('#bookId').val(),
        bookName : $('#bookName').val(),
        price : $('#price').val(),
        categoryName : $('#categoryName').val()
    };

    ajaxRequest('edit', param, function(){
        location.href = "index.html";
    });
}