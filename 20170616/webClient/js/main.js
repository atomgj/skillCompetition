var search = {
    sortColumns: 'updateTime',
    sortType: 'ASC',
    pageNo: 1,
    pageSize: 10
};

var user = sessionStorage.getItem('user');
if (user) {
    user = JSON.parse(user);

    search.userId = user.userId;
    search.role = user.role;

    $('#login-user').text(user.username);
}

function setCate(self) {
    $('.c-li').removeClass('active');
    $(self).addClass('active');
    search.categoryName = $(self).html();
    if ($(self).html() == '全部') {
        search.categoryName = '';
    }
    pageQuery();
}

function cateQuery() {
    $.ajax({
        url: 'http://127.0.0.1:3000/category',
        type: 'POST',
        data: search,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var rows = result.data, i, li;
                li = '<li class="c-li active" onclick="setCate(this)">全部</li>';
                for (i = 0; i < rows.length; i++) {
                    li += '<li class="c-li" onclick="setCate(this)">' + rows[i].categoryName + '</li>';
                }
                $('.c-ul').empty().append(li);
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("http请求异常！");
        }
    });
}

function pageQuery() {

    search.bookName = $('#bookName').val();
    search.author = $('#author').val();
    search.price = $('#price').val();
    search.sortColumns = $('#sortColumns').val();
    search.sortType = $('#sortType').val();

    $.ajax({
        url: 'http://127.0.0.1:3000/list',
        type: 'POST',
        data: search,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var i, data = result.data, totalCount = data.count,
                    rows = data.rows;

                //处理数据

                /**
                 * <li class="d-li">
                 <div class="item-img"><a onclick="view(1)"><img src="images/1.png"/></a></div>
                 <div class="item-price">123</div>
                 <div class="item-name">巨流河</div>
                 <div class="item-favorite">4赞</div>
                 </li>
                 */
                var d_li = '';
                for (i = 0; i < rows.length; i++) {
                    var ed = '';
                    if (!user.role || user.userId == rows[i].userId) {
                        ed += '<div class="item-edit"><a onclick="edit(' + rows[i].bookId + ')">编辑</a></div>';
                    }
                    d_li += '<li class="d-li">' +
                        '<div class="item-img"><a onclick="view(' + rows[i].bookId + ')"><img src="images/' + rows[i].bookId + '.jpg"/></a></div>' +
                        '<div class="item-price">' + rows[i].price + '</div>' +
                        '<div class="item-name">' + rows[i].bookName + '</div>' +
                        '<div class="item-author">' + rows[i].author + '</div>' +
                        '<div class="item-favorite">' + (!!rows[i].fav ? rows[i].fav : 0) + '赞</div>' +
                        ed +
                        '</li>'
                }

                $('.d-ul').empty().append(d_li);

                //处理分页
                var pageCount = Math.ceil(totalCount / search.pageSize),
                    pageNo = search.pageNo;

                search.pageCount = pageCount;

                checkPage();

                var p_li = '';
                for (i = 1; i <= pageCount; i++) {
                    p_li += '<li class="p-li ' + (pageNo == i ? "active" : "") + '" onclick="gotoPage(' + i + ')">' + i + '</li>';
                }

                $('.p-item').empty().append(p_li);

            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("http请求异常！");
        }
    });
}

function checkPage() {
    if (search.pageCount <= 1) {
        $('.p-ul').hide();
    } else {
        $('#first, #prev, #next, #last').attr('disable', false);
        if (search.pageNo <= 1) {
            $('#first, #prev').attr('disable', true);
        } else if (search.pageNo >= search.pageCount) {
            $('#next, #last').attr('disable', true);
        }
        $('.p-ul').show();
    }
    $('#pageCount').text("共" + search.pageCount + "页");
}

function gotoPage(sb) {
    var pg = search.pageNo;
    if (sb == '--') {
        pg = 1;
    } else if (sb == '-') {
        pg = pg - 1;
    } else if (sb == '+') {
        pg = pg + 1;
    } else if (sb == '++') {
        pg = search.pageCount;
    } else {
        pg = sb;
    }

    if (pg < 1 || pg > search.pageCount) {
        return false;
    } else {
        search.pageNo = pg;
    }

    checkPage();
    pageQuery();
}

function doTime(type, self) {
    $('.t-li').removeClass('active');
    $(self).addClass('active');
    search.timeType = type;
    pageQuery();
}

function doSearch() {
    search.pageNo = 1;
    pageQuery();
}

function view(id) {
    location.href = 'view.html?bookId=' + id;
}

function edit(id) {
    location.href = 'edit.html?bookId=' + id;
}

function getById(id, type) {
    $('#bookId').val(id);
    $.ajax({
        url: 'http://127.0.0.1:3000/view',
        type: 'POST',
        data: {
            bookId: id,
            userId: user.userId
        },
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var rows = result.data, i, li;
                var fav = (!!rows.fav ? rows.fav : 0);
                if (type) {
                    $('#bookName').val(rows.bookName);
                    $('#author').val(rows.author);
                    $('#price').val(rows.price);
                    $('#categoryName').val(rows.categoryName);
                } else {
                    var d_li = '<li class="d-li">' +
                        '<div class="item-img"><a onclick="view(' + rows.bookId + ')"><img src="images/' + rows.bookId + '.jpg"/></a></div>' +
                        '<div class="item-price">' + rows.price + '</div>' +
                        '<div class="item-name">' + rows.bookName + '</div>' +
                        '<div class="item-author">' + rows.author + '</div>' +
                        '<div class="item-time">' + rows.updateTime + '</div>' +
                        '<div class="item-category">' + rows.categoryName + '</div>' +
                        '<div class="item-favorite"><b class="fav">' + fav + '</b><a onclick="like(' + rows.bookId + ',' + fav + ', this)">赞</a></div>' +
                        '</li>';
                    $('.d-ul').empty().append(d_li);
                }

            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("http请求异常！");
        }
    });
}

function like(id, fav, self) {
    $.ajax({
        url: 'http://127.0.0.1:3000/like',
        type: 'POST',
        data: {
            bookId: id,
            userId: user.userId
        },
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var data = result.data;
                fav = fav + data;
                $(self).closest('.item-favorite').html('<b class="fav">' + fav + '</b><a onclick="like(' + id + ',' + fav + ', this)">赞</a>');
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("http请求异常！");
        }
    });
}

function doEdit() {

    search.bookId = $('#bookId').val();
    search.bookName = $('#bookName').val();
    search.author = $('#author').val();
    search.price = $('#price').val();
    search.categoryName = $('#categoryName').val();

    $.ajax({
        url: 'http://127.0.0.1:3000/edit',
        type: 'POST',
        data: search,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                location.href = "index.html";
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("http请求异常！");
        }
    });
}