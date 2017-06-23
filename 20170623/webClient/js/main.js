/**
 * Created by lgj on 2017/6/23.
 */

function initLogin(){
    var isRem =  localStorage.getItem('isRem'),
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
    $('#isRem').attr('checked', !$('#isRem').attr('checked'));
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
                }else if(rt.code == 401){
                    localStorage.setItem('url', location.href);
                    location.href = 'login.html';
                }else{
                    $('.errorMsg').html(rt.message);
                }
            }
        },
        error: function(){
            $('.errorMsg').html('http server error');
        }
    })
}


function register(){
    var param = {
        username: $('#username').val(),
        email: $('#email').val(),
        mobile: $('#mobile').val(),
        password: $('#password').val(),
        passwordCK: $('#passwordCK').val()
    };

    checkForm(param);

    setTimeout(function () {
        var valid = !$('.error').length
        if(valid){
            ajaxRequest('register', param, function(){
                location.href = 'login.html';
            })
        }
    },1000)
}

function checkForm(form){

    $('.error').remove();
    $('.invalid').removeClass('invalid');

    validate({key: 'username', value: form.username, label: '用户名'});
    validate({key: 'email', value: form.email, label: '邮箱'});
    validate({key: 'mobile', value: form.mobile, label: '手机号'});
    validate({key: 'password', value: form.password, _value: form.passwordCK, label: '密码'});
    validate({key: 'passwordCK', value: form.passwordCK, _value: form.password, label: '确认密码'});

}

function validate(param){

    var reg, valid = true;

    if(param.key == 'username'){
        reg = /^[A-Za-z]{1}([A-Za-z0-9_\-\.]{0,29})$/;
    }else if(param.key == 'mobile'){
        reg = /^1[3-8]{1}[0-9]{9}$/;
    }else if(param.key == 'email'){
        reg = /^[A-Za-z0-9_\-\.]+\@[A-Za-z0-9_\-\.]+$/;
    }else){
        reg = /.$/;
    }

    if(!param.value){
        valid = false;
        $('#'+param.key).addClass('invalid');
        $('#'+param.key).after(`<label class="error">${param.label}不能为空!</label>`);
    }else if(!reg.test(param.value)){
        valid = false;
        $('#'+param.key).addClass('invalid');
        $('#'+param.key).after(`<label class="error">${param.label}不合法!</label>`);
    }else if(param.key.indexOf('password') < 0){
        checkInDB(param);
    }

    if(valid && param.key.indexOf('passwordCK') >= 0){
        if(param.value != param._value){
            $('#'+param.key).addClass('invalid');
            $('#'+param.key).after(`<label class="error">两次密码不一致!</label>`);
        }
    }
}

function checkInDB(param){
    ajaxRequest('check', param, false, function(){
        $('#'+param.key).addClass('invalid');
        $('#'+param.key).after(`<label class="error">${param.label}已使用!</label>`);
    })
}