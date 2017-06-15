function remember() {
    var checked = $('#isRem').attr('checked');
    if(checked){
        $('#isRem').attr('checked', false);
    }else{
        $('#isRem').attr('checked', true);
    }
}

function login() {

    var loginInfo = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    var checked = $('#isRem').attr('checked');
    if (!checked) {
        localStorage.removeItem('isRem');
        localStorage.removeItem('loginInfo');
    } else {
        localStorage.setItem('isRem', 1);
        localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
    }

    $.ajax({
        url: 'http://127.0.0.1:3000/login',
        data: loginInfo,
        type: 'POST',
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
            alert("http请求异常！");
        }
    });
}

function register(){
    var data = {
        username : $('#username').val(),
        mobile : $('#mobile').val(),
        email : $('#email').val(),
        password : $('#password').val(),
        ckPassword : $('#ckPassword').val()
    };
    if(data.password !== data.ckPassword){
        alert("两次密码不正确");
    }

    $.ajax({
        url: 'http://127.0.0.1:3000/register',
        data: data,
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                location.href = 'login.html';
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("http请求异常！");
        }
    });
}

function getCategory(){

    var user = sessionStorage.getItem('user');
    if(user){
        user = JSON.parse(user);
    }
    $.ajax({
        url: 'http://127.0.0.1:3000/category',
        data: {
            userId: user.userId
        },
        type: 'POST',
        success: function (rep) {
            var result = JSON.parse(rep);
            if (result.code == 200) {
                var i, rows = result.data, ul = "";
                $('.category').empty();
                for(i=0;i<rows.length;i++){
                    ul += "<li>"+rows[i].categoryName+"</li>"
                }
                $('.category').append(ul);
            } else {
                alert(result.message);
            }
        },
        error: function () {
            alert("http请求异常！");
        }
    });
}

function pageQuery(){

}