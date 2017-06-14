var search = {
    sortColumns: 'updateTime',
    sortType: 'asc',
    pageNo: 1,
    pageSize: 4
};


var login = function () {
    var username = $('#username').val(),
        password = $('#password').val(),
        isRem = $('#rem').attr("checked") ? 1 : 0,
        data = {
            "username": username,
            "password": password
        };

    if (isRem) {
        localStorage.setItem('isRem', isRem);
        localStorage.setItem('loginInfo', JSON.stringify(data));
    } else {
        localStorage.removeItem('isRem');
        localStorage.removeItem('loginInfo');
    }

    $.ajax({
        url: 'http://127.0.0.1:3000/login',
        type: 'POST',
        data: data,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                sessionStorage.setItem('user', JSON.stringify(result.data));
                location.href = 'index.html';
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("请求错误");
        }
    });
};

var register = function () {
    var username = $('#username').val(),
        password = $('#password').val(),
        email = $('#email').val(),
        mobile = $('#mobile').val(),
        data = {
            "username": username,
            "email": email,
            "mobile": mobile,
            "password": password
        };

    $.ajax({
        url: 'http://127.0.0.1:3000/register',
        type: 'POST',
        data: data,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                location.href = 'login.html';
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("请求错误");
        }
    });

};


var pageQuery = function () {
    var user = sessionStorage.getItem('user');
    if (user) {
        user = JSON.parse(user);
        search.userId = user.userId;
        search.role = user.role;
    }

    $.ajax({
        url: 'http://127.0.0.1:3000/list',
        type: 'POST',
        data: search,
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var rows = result.data.data;
                var i;
                $('.dataList').empty();
                for (i = 0; i < rows.length; i++) {
                    var html = "<tr class='" + (i % 2 == 0 ? "even" : "odd") + "'>";
                    html += "<td>" + rows[i].commodityId + "</td>";
                    html += "<td>" + rows[i].name + "</td>";
                    html += "<td>" + rows[i].price + "</td>";
                    html += "<td>" + rows[i].category + "</td>";
                    html += "<td>" + rows[i].updateTime + "</td>";
                    html += "<td>" + (rows[i].count == null ? 0 : rows[i].count) + "</td>";
                    html += "</tr>";
                    $('.dataList').append(html);
                }
                var totalCount = result.data.count,
                    pageSize = search.pageSize,
                    pageNo = search.pageNo,
                    pageCount;
                pageCount = Math.ceil(totalCount / pageSize);
                search.pageCount = pageCount;

                $('.page span').empty();
                var span = "";
                for (i = 1; i <= pageCount; i++) {
                    span += "<a onclick='gotoPage(" + i + ")' class='" + (i == pageNo ? "active" : "") + "'>" + i + "</a>";
                }
                $('.page span').append(span);

                if (pageCount == 1) {
                    $('.page').hide();
                } else {
                    $('#next, #last, #first, #prev').removeClass('disable');
                    if (pageNo == 1) {
                        $('#first, #prev').addClass('disable');
                    }
                    if (pageNo == pageCount) {
                        $('#next, #last').addClass('disable');
                    }
                }

            } else if (result.code == 401) {
                alert(result.message);
                location.href = "login.html";
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("请求错误");
        }
    });
};

function gotoPage(sb) {

    if (sb == '--') {
        search.pageNo = 1;
    } else if (sb == '-') {
        search.pageNo = search.pageNo - 1;
    } else if (sb == '+') {
        search.pageNo = search.pageNo + 1;
    } else if (sb == '++') {
        search.pageNo = search.pageCount;
    } else {
        search.pageNo = sb;
    }

    if (search.pageNo < 1 || search.pageNo > search.pageCount) {
        return false;
    }

    pageQuery();
}


function doSearch(){
    var name = $('#name').val(),
        category = $('#category').val(),
        price = $('#price').val(),
        sortColumns = $('#sortColumns').val(),
        sortType = $('#sortType').val(),
        timeType = $('#timeType').val();

    search.name = name;
    search.category = category;
    search.price = price;
    search.sortColumns = sortColumns;
    search.sortType = sortType;
    search.timeType = timeType;

    search.pageNo =  1;
    search.pageSize = 4;
    pageQuery();
}
