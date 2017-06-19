/**
 * Created by lgj on 2017/6/18.
 */


var login = function () {
    var param = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: 'http://127.0.0.1:3000/login',
        type: 'POST',
        data: param,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {

                var isRem = $('#isRem').attr('checked');
                if (isRem) {
                    localStorage.setItem('loginInfo', JSON.stringify(param));
                    localStorage.setItem('isRem', true);
                } else {
                    localStorage.removeItem('loginInfo');
                    localStorage.removeItem('isRem');
                }

                sessionStorage.setItem('user', JSON.stringify(result.data));

                var url = localStorage.getItem('url');
                if (url) {
                    location.href = url;
                } else {
                    location.href = 'index.html';
                }
            } else {
                $('#errorMsg').html(result.message);
            }
        },
        error: function () {
            $('#errorMsg').html('http server error!');
        }
    });

};

var register = function () {
    var param = {
        username: $('#username').val(),
        mobile: $('#mobile').val(),
        email: $('#email').val(),
        ckPassword: $('#ckPassword').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: 'http://127.0.0.1:3000/register',
        type: 'POST',
        data: param,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                location.href = 'login.html';
            } else {
                $('#errorMsg').html(result.message);
            }
        },
        error: function () {
            $('#errorMsg').html('http server error!');
        }
    });
};


var search = {
    pageSize: 10,
    pageNo: 1,
    sortColumns: 'updateTime',
    sortType: 'ASC'
};

var user = sessionStorage.getItem('user');
if (user) {
    user = JSON.parse(user);
    search.userId = user.userId;
    search.role = user.role;
}

var cateQuery = function () {
    $.ajax({
        url: 'http://127.0.0.1:3000/category',
        type: 'POST',
        data: search,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 401) {
                localStorage.setItem('url', Location.href);
                location.href = 'login.html';
            } else if (result.code == 200) {
                var i, rows = result.data;
                $('.s-item-cate').empty()
                    .append(`<li class="active" onclick="doCategory(0,this)">全部</li>`);
                for (i = 0; i < rows.length; i++) {
                    $('.s-item-cate').append(`<li onclick="doCategory(${rows[i].categoryId},this)">${rows[i].categoryName}</li>`);
                }
            } else {
                $('#errorMsg').html(result.message);
            }
        },
        error: function () {
            $('#errorMsg').html('http server error!');
        }
    });
};
var pageQuery = function () {

    $.ajax({
        url: 'http://127.0.0.1:3000/list',
        type: 'POST',
        data: search,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 401) {
                localStorage.setItem('url', Location.href);
                location.href = 'login.html';
            } else if (result.code == 200) {
                var i, rows = result.data.rows;
                $('.d-item-data').empty();
                for (i = 0; i < rows.length; i++) {
                    $('.d-item-data').append(`<li>
                    <div class="i-img"><a href="view.html?bookId=${rows[i].bookId}"><img src="images/${rows[i].bookId}.jpg"></a></div>
                    <div class="i-name"><span class="it-n">${rows[i].bookName}</span><span class="it-a">${rows[i].author}</span></div>
                    <div class="i-price"><span class="it-c">￥</span><span class="it-k">${rows[i].price}</span></div>
                    <div class="i-favorite"><span class="it-c">${rows[i].fav}</span><span class="it-k">赞</span></div>
                    </li>`);
                }


                var totalCount = result.data.count,
                    pageCount = Math.ceil(totalCount / search.pageSize);
                search.pageCount = pageCount;
                $('.page').empty();
                for (i = 1; i <= pageCount; i++) {
                    $('.page').append(`<li onclick="goToPage(${i})">${i}</li>`);
                }
                checkPage();
            } else {
                $('#errorMsg').html(result.message);
            }
        },
        error: function () {
            $('#errorMsg').html('http server error!');
        }
    });

};

var checkPage = function () {

    $('#first, #prev, #next, #last').removeClass('disabled');
    if (search.pageCount == 1) {
        $('.pageArea').hide();
    } else {
        $('.pageArea').show();
        if (search.pageNo == 1) {
            $('#first, #prev').addClass('disabled');
        } else if (search.pageNo == search.pageCount) {
            $('#last, #next').addClass('disabled');
        }
    }
};

var doSearch = function () {
    search = {
        pageSize: 10,
        pageNo: 1,
        sortColumns: 'updateTime',
        sortType: 'ASC'
    };
    search.bookName = $('#searchTxt').val();
    pageQuery();
};

var doTime = function (type, self) {

    $('.s-item-time').find('li').removeClass('active');
    $(self).addClass('active');
    search.timeType = type;
    pageQuery();
};


var doPrice = function (type, self) {

    $('.s-item-price').find('li').removeClass('active');
    $(self).addClass('active');
    search.priceType = type;
    pageQuery();
};

var doCategory = function (type, self) {

    $('.s-item-cate').find('li').removeClass('active');
    $(self).addClass('active');
    search.categoryName = $(self).text();
    pageQuery();
};

var goToPage = function (symb) {

    var n = search.pageNo;
    if (symb == '--') {
        n = 1;
    } else if (symb == '-') {
        n = n - 1;
    } else if (symb == '+') {
        n = n + 1;
    } else if (symb == '++') {
        n = search.pageCount;
    } else {
        n = symb;
    }

    if (n < 1 || n > search.pageCount) {
        return false;
    }
    search.pageNo = n;
    pageQuery();
};


var view = function(id, flag){
    $.ajax({
        url: 'http://127.0.0.1:3000/view',
        type: 'POST',
        data: {
            userId: user.userId,
            bookId: id
        },
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 401) {
                localStorage.setItem('url', Location.href);
                location.href = 'login.html';
            } else if (result.code == 200) {
                var d = result.data;
                var fav = (d.fav ? d.fav : 0);

                if(flag){
                    $('.it-name').val(d.bookName);
                    $('.it-author').val(d.author);
                    $('.it-price').val(d.price);
                    $('.it-cate').val(d.categoryName);
                }else{
                    $('.it-img').attr('src', 'images/'+d.bookId+'.jpg');
                    $('.it-name').text(d.bookName);
                    $('.it-author').text(d.author);
                    $('.it-price').text(d.price);
                    $('.it-fav').text(fav);
                    $('.it-cate').text(d.categoryName);
                    $('.it-time').text(d.updateTime);
                }
                $('#favorite').val(fav);
                $('#bookId').val(d.bookId);
            } else {
                $('#errorMsg').html(result.message);
            }
        },
        error: function () {
            $('#errorMsg').html('http server error!');
        }
    });
};

function parseURL(flag){
    var url = location.href;
    var param = url.split('?')[1];
    var id = param.split('=')[1];

    view(id, flag);
}


var like = function(){
    var count = $('#favorite').val();
    var bookId = $('#bookId').val();

    $.ajax({
        url: 'http://127.0.0.1:3000/like',
        type: 'POST',
        data: {
            userId: user.userId,
            bookId: bookId
        },
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 401) {
                localStorage.setItem('url', Location.href);
                location.href = 'login.html';
            } else if (result.code == 200) {
                var d = result.data;
                count = parseInt(count) + parseInt(d);
                $('.it-fav').text(count);
                $('#favorite').val(count);
            } else {
                $('#errorMsg').html(result.message);
            }
        },
        error: function () {
            $('#errorMsg').html('http server error!');
        }
    });
};

var edit = function(){
    var bookId = parseInt($('#bookId').val());

    $.ajax({
        url: 'http://127.0.0.1:3000/edit',
        type: 'POST',
        data: {
            userId: user.userId,
            bookId: bookId,
            bookName: $('.it-name').val(),
            author: $('.it-author').val(),
            price: parseInt($('.it-price').val()),
            categoryName: $('.it-cate').val()
        },
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 401) {
                localStorage.setItem('url', Location.href);
                location.href = 'login.html';
            } else if (result.code == 200) {
                location.href="view.html?bookId="+bookId;
            } else {
                $('#errorMsg').html(result.message);
            }
        },
        error: function () {
            $('#errorMsg').html('http server error!');
        }
    });
};