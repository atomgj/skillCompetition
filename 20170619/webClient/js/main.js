var initLogin = function () {

    var isRem = localStorage.getItem('isRem'),
        loginInfo = localStorage.getItem('loginInfo');

    if (isRem) {
        loginInfo = JSON.parse(loginInfo);
        $('#username').val(loginInfo.username);
        $('#password').val(loginInfo.password);
        $('#isRem').attr('checked', true);
    } else {
        $('#username').val('');
        $('#password').val('');
        $('#isRem').attr('checked', false);
    }
};

var remember = function () {
    $('#isRem').attr('checked', !$('#isRem').attr('checked'));
};

var login = function () {
    var param = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: 'http://127.0.0.1:3000/login',
        data: param,
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                if($('#isRem').attr('checked')){
                    localStorage.setItem('loginInfo', JSON.stringify(param));
                    localStorage.setItem('isRem', 1);
                }else{
                    localStorage.removeItem('loginInfo');
                    localStorage.removeItem('isRem');
                }

                sessionStorage.setItem('user', JSON.stringify(result.data));
                var url = localStorage.getItem('url');
                location.href = url || 'index.html';
            } else {
                $('.errorMsg').text(result.message);
            }
        },
        error: function () {
            $('.errorMsg').text('http请求错误！');
        }
    })
};


var register = function () {
    var param = {
        username: $('#username').val(),
        mobile: $('#mobile').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        ckPassword: $('#ckPassword').val()
    };

    $.ajax({
        url: 'http://127.0.0.1:3000/register',
        data: param,
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                location.href = 'login.html';
            } else {
                $('.errorMsg').text(result.message);
            }
        },
        error: function () {
            $('.errorMsg').text('http请求错误！');
        }
    })
};


var search = {
    pageNo: 1,
    pageSize: 5,
    sortColumns: 'updateTime',
    sortType: 'ASC'
};

var user = sessionStorage.getItem('user');
if (user) {
    user = JSON.parse(user);
    search.userId = user.userId;
}

var cateQuery = function () {
    $.ajax({
        url: 'http://127.0.0.1:3000/category',
        data: {
            userId: user.userId
        },
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var rows = result.data, i;
                $('.s-item-c li:first').nextAll().remove();
                for (i = 0; i < rows.length; i++) {
                    $('.s-item-c').append(
                        `<li onclick="doCategory(${rows[i].categoryId}, this)">${rows[i].categoryName}</li>`
                    );
                }
            } else if (result.code == 401) {
                location.href = 'login.html';
            } else {
                $('.errorMsg').text(result.message);
            }
        },
        error: function () {
            $('.errorMsg').text('http请求错误！');
        }
    })
};


var pageQuery = function () {
    $.ajax({
        url: 'http://127.0.0.1:3000/list',
        data: search,
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var rows = result.data.rows, i;
                $('.d-items').empty();
                for (i = 0; i < rows.length; i++) {
                    $('.d-items').append(
                        `<li>
                            <div class="i-img"><a href="view.html?bookId=${rows[i].bookId}"><img src="images/${rows[i].bookId}.jpg"/></a></div>
                            <div class="i-price"><span class="unit">￥</span><span class="price">${rows[i].price}</span></div>
                            <div class="i-name">${rows[i].bookName}</div>
                            <div class="i-author">${rows[i].author}</div>
                            <div class="i-fav"><span class="fav">${rows[i].fav}</span><span class="zan">赞</span></div>
                        </li>`
                    );
                }

                var totalCount = result.data.count;
                var pageCount = Math.ceil(totalCount / search.pageSize);
                search.pageCount = pageCount;

                $('.page').empty();
                for (i = 1; i <= pageCount; i++) {
                    var isActive = (i == search.pageNo ? 'active' : '');
                    $('.page').append(
                        `<li class="${isActive}" onclick="gotoPage(${i})">${i}</li>`
                    );
                }

                checkPage();

            } else if (result.code == 401) {
                location.href = 'login.html';
            } else {
                $('.errorMsg').text(result.message);
            }
        },
        error: function () {
            $('.errorMsg').text('http请求错误！');
        }
    })
};


var gotoPage = function (symb, self) {
    var no = search.pageNo;
    if (symb == '--') {
        no = 1;
    } else if (symb == '-') {
        no = no - 1;
    } else if (symb == '+') {
        no = no + 1;
    } else if (symb == '++') {
        no = search.pageCount;
    } else {
        no = symb;
    }

    if (no < 1 || no > search.pageCount) {
        return false;
    }
    $('.page').removeClass('active');
    $(self).addClass('active');
    search.pageNo = no;
    pageQuery();
};


function checkPage() {
    if (search.pageCount == 1) {
        $('.pageArea').hide();
    } else {
        $('#first, #prev, #next, #last').removeClass('disabled');
        if (search.pageNo == 1) {
            $('#first, #prev').addClass('disabled');
        }
        if (search.pageCount == search.pageNo) {
            $('#next, #last').addClass('disabled');
        }
        $('.pageArea').show();
    }
}

function doPrice(type, self) {
    $('.s-item-p').find('li').removeClass('active');
    $(self).addClass('active');
    search.priceType = type;
    pageQuery();
}

function doTime(type, self) {
    $('.s-item-t').find('li').removeClass('active');
    $(self).addClass('active');
    search.timeType = type;
    pageQuery();
}

function doCategory(id, self) {
    $('.s-item-c').find('li').removeClass('active');
    $(self).addClass('active');
    search.categoryId = id;
    pageQuery();
}

function load(flag) {
    var url = location.href;
    var param = url.split('?')[1];
    var id = param.split('=')[1];
    view(id, flag);
}

function view(id, flag) {
    $.ajax({
        url: 'http://127.0.0.1:3000/view',
        data: {
            userId: user.userId,
            bookId: id
        },
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var data = result.data;
                if (flag) {

                    $('#categoryName').val(data.categoryName);
                    $('#bookName').val(data.bookName);
                    $('#price').val(data.price);
                    $('#author').val(data.author);

                } else {
                    $('.price').text(data.price);
                    $('.i-name').text(data.bookName);
                    $('.i-author').text(data.author);
                    $('.fav').text(data.fav);
                    $('.i-category').text(data.categoryName);
                }
                $('#bookId').val(id);
                $('#favorite').val(data.fav)
            } else if (result.code == 401) {
                location.href = 'login.html';
            } else {
                $('.errorMsg').text(result.message);
            }
        },
        error: function () {
            $('.errorMsg').text('http请求错误！');
        }
    })
}

function edit() {
    var id = $('#bookId').val();
    var param = {
        userId: user.userId,
        bookId: id,
        bookName: $('#bookName').val(),
        price: $('#price').val(),
        author: $('#author').val(),
        categoryName: $('#categoryName').val()
    };

    $.ajax({
        url: 'http://127.0.0.1:3000/edit',
        data: param,
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                location.href = 'index.html';
            } else if (result.code == 401) {
                location.href = 'login.html';
            } else {
                $('.errorMsg').text(result.message);
            }
        },
        error: function () {
            $('.errorMsg').text('http请求错误！');
        }
    });
}

function like() {
    var id = $('#bookId').val();
    var fav = $('#favorite').val();
    $.ajax({
        url: 'http://127.0.0.1:3000/like',
        data: {
            userId: user.userId,
            bookId: id
        },
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var count = parseInt(fav) + parseInt(result.data);
                $('#favorite').val(count);
                $('.fav').text(count);
            } else if (result.code == 401) {
                location.href = 'login.html';
            } else {
                $('.errorMsg').text(result.message);
            }
        },
        error: function () {
            $('.errorMsg').text('http请求错误！');
        }
    });
}