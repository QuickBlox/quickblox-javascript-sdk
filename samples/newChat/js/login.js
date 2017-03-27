'use strict';

function Login() {}

Login.prototype.renderLoginPage = function(){
    helpers.clearView(app.page);

    app.page.innerHTML = helpers.fillTemplate('tpl_login',{
        users: usersList,
        version: QB.version
    });

    this.setListeners();
};

Login.prototype.setListeners = function(){
    var self = this,
        form = document.forms.loginForm,
        loginBtn = document.querySelector('.j-login__button');

    form.addEventListener('submit', function(e){
        e.preventDefault();

        var userName = form.userName.value,
            userGroup = form.userGroup.value;
    });

    

    // select.addEventListener('change', function () {
    //     if (!isNaN(this.value)) {
    //         loginBtn.removeAttribute('disabled');
    //     }
    // });
    //
    // loginBtn.addEventListener('click', function () {
    //     if (!self.checkInternetConnection()) {
    //         return false;
    //     }
    //
    //     var userId = +select.value;
    //
    //     if (loginBtn.classList.contains('loading')) return false;
    //
    //     self.user = _.findWhere(usersList, {id: userId});
    //     loginBtn.classList.add('loading');
    //
    //     self.login();
    //
    //     loginBtn.innerText = 'loading...'
    // });
};

App.prototype.login = function () {
    var self = this,
        userData = {
            login: self.user.login,
            password: self.user.pass
        };

    // Step 2. Create session with user credentials.
    QB.createSession(userData, function (err, res) {
        if (res) {
            self.token = res.token;
            // Step 3. Conect to chat.
            QB.chat.connect({userId: self.user.id, password: self.user.pass}, function (err, roster) {
                if (err) {
                    document.querySelector('.j-login__button').innerText = 'Login';
                    console.error(err);
                    alert('Connect to chat Error');
                } else {
                    helpers.redirectToPage('dashboard');
                }
            });
        } else {
            var loginBdt = document.querySelector('.j-login__button');
            loginBdt.innerText = 'Login';
            loginBdt.classList.remove('loading');
            console.error('create session Error', err);
            alert('Create session Error');
        }
    });
};

var loginModule = new Login();
