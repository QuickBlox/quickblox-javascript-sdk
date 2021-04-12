'use strict';

function Login() {
    this.isLoginPageRendered = false;
    this.isLogin = false;

    this.qbConnect = function (data) {

        var
            self = this,
            timer,
            userRequiredParams = {
                'login': data.login,
                'password': data.password ? data.password : 'quickblox'
            };

        this.login = function() {
            return new Promise(function (resolve, reject) {
                QB.login(userRequiredParams, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        };

        this.userCreate = function(user) {
            return new Promise(function (resolve, reject) {
                QB.users.create(user, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        };

        this.createSession = function() {
            return new Promise(function(resolve, reject) {
                QB.createSession(function(error, result) {
                    if(error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        };

        this.chatConnect = function() {
            return new Promise(function(resolve, reject) {
                QB.chat.connect({
                    jid: QB.chat.helpers.getUserJid( app.user.id, app._config.credentials.appId ),
                    password: userRequiredParams.password
                }, function(error, result) {
                    if(error) {
                        reject(error);
                    } else {
                        resolve(result)
                    }
                });
            });
        };

        this.connect = async function () {
            self.stopReconnecting();
            app.user = null;
            /*app.init(app._config);*/

            var user = localStorage.getItem('user');

            var savedUser = JSON.parse(user);
            app.room = savedUser.tag_list;

            try {
                var isLogin = await loginModule.login(savedUser);
            }catch (e) {
                app.init(app._config);
                isLogin = await loginModule.login(savedUser);
            }

            listeners.setListeners();

            if(!isLogin) {
                router.navigate('/login');
            }

            return Promise.resolve();

        };

        this.reconnecting = function(interval) {
            timer = setInterval(this.connect, interval);
        };

        this.stopReconnecting = function() {
            clearInterval(timer);
        }

    }

}

Login.prototype.init = async function() {
    var self = this;

    var user = localStorage.getItem('user');

    if(!app.checkInternetConnection()){
        return false;
    }

    if(user && !app.user){
        var savedUser = JSON.parse(user);
        app.room = savedUser.tag_list;
        return await self.login(savedUser);
    }

    return Promise.resolve(false);

};

Login.prototype.login = async function (user) {
    var self = this;

    window.qbConnect = new self.qbConnect(user);

    var session = await window.qbConnect.createSession();

    app.token = session.token;

    try {
        var userData = await window.qbConnect.login();
    }catch (e) {
        await userModule.create(user);
        userData = await window.qbConnect.login();
    }

    if(userData.user_tags !== user.tag_list || userData.full_name !== user.full_name) {
        userData = await userModule.update(userData.id,{
            'full_name': user.full_name,
            'tag_list': user.tag_list
        });
    }
    
    app.user = userModule.addToCache(userData);
    app.user.user_tags = userData.user_tags;

    await window.qbConnect.chatConnect().then(function () {
        self.isLogin = true;
    });

    window.qbConnect.reconnecting(1800000);

    return Promise.resolve(true);

};

Login.prototype.renderLoginPage = function(){
    helpers.clearView(app.page);

    app.page.innerHTML = helpers.fillTemplate('tpl_login', {
        version: QB.version + ':' + QB.buildNumber
    });
    this.isLoginPageRendered = true;
    this.setListeners();
};

Login.prototype.renderLoadingPage = function(){
    helpers.clearView(app.page);
    app.page.innerHTML = helpers.fillTemplate('tpl_loading');
};

Login.prototype.setListeners = function(){
    var self = this,
        loginForm = document.forms.loginForm,
        formInputs = [loginForm.userName, loginForm.userLogin],
        loginBtn = loginForm.login_submit;

    loginForm.addEventListener('submit', function(e){
        e.preventDefault();

        if(
            !app.checkInternetConnection() ||
            loginForm.hasAttribute('disabled') ||
            !loginForm.userName.isValid ||
            !loginForm.userLogin.isValid) {
            return false;
        } else {
            loginForm.setAttribute('disabled', true);
        }

        var userName = loginForm.userName.value,
            userLogin = loginForm.userLogin.value;

        var user = {
            login: userLogin,
            password: 'quickblox',
            full_name: userName
        };

        localStorage.setItem('user', JSON.stringify(user));

        self.login(user).then(function(){
            router.navigate('/dashboard');
        }).catch(function(error){
            alert('lOGIN ERROR\n open console to get more info');
            loginBtn.removeAttribute('disabled');
            console.error(error);
            loginForm.login_submit.innerText = 'LOGIN';
        });
    });

    // add event listeners for each input;
    _.each(formInputs, function(i){
        i.addEventListener('focus', function(e){
            if(e.target.isValid){
                e.target.nextElementSibling.classList.remove('filled');
            }else{
                e.target.nextElementSibling.classList.add('filled');
            }
        });

        i.addEventListener('focusout', function(e){
            var elem = e.currentTarget;
            if (!elem.value.length || elem.isValid) {
                elem.nextElementSibling.classList.remove('filled');
            }
        });

        i.addEventListener('input', function(e){
            var userName = loginForm.userName.value,
                userLogin = loginForm.userLogin.value;

            loginForm.userName.isValid = 20 >= userName.length && userName.length >=3 &&
                (userName.match(/^[a-zA-Z][a-zA-Z0-9 ]{1,18}[a-zA-Z0-9]$/)!=null);
            loginForm.userLogin.isValid = 50 >= userLogin.length && userLogin.length >= 3 &&
                (userLogin.match(/[@]/g)==null || userLogin.match(/[@]/g).length <= 1) &&
                (userLogin.match(/^[a-zA-Z][a-zA-Z0-9@\-_.]{1,48}[a-zA-Z0-9]$/)!=null);

            userName.split(" ").forEach(function (str) {
                if(str.length < 1){
                    loginForm.userName.isValid = false;
                }
            });

            if(e.target.isValid){
                e.target.nextElementSibling.classList.remove('filled');
            }else{
                e.target.nextElementSibling.classList.add('filled');
            }

            if(loginForm.userName.isValid && loginForm.userLogin.isValid){
                loginBtn.removeAttribute('disabled');
            }else{
                loginBtn.setAttribute('disabled', true);
            }

        })
    });
};

var loginModule = new Login();
