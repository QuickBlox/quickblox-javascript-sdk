'use strict';

function Login() {
    this.isLoginPageRendered = false;
    this.isLogin = false;
}

Login.prototype.init = function(){
    var self = this;

    return new Promise(function(resolve, reject) {
        var user = localStorage.getItem('user');
        if(user && !app.user){
            var savedUser = JSON.parse(user);
            app.room = savedUser.tag_list;
            self.login(savedUser)
                .then(function(){
                    resolve(true);
                }).catch(function(error){
                reject(error);
            });
        } else {
            resolve(false);
        }
    });
};

Login.prototype.login = function (user) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(self.isLoginPageRendered){
            document.forms.loginForm.login_submit.innerText = 'loading...';
        } else {
            self.renderLoadingPage();
        }
        QB.createSession(function(csErr, csRes) {
            var userRequiredParams = {
                'login':user.login,
                'password': user.password
            };
            if (csErr) {
                loginError(csErr);
            } else {
                app.token = csRes.token;
                QB.login(userRequiredParams, function(loginErr, loginUser){
                    if(loginErr) {
                        /** Login failed, trying to create account */
                        QB.users.create(user, function (createErr, createUser) {
                            if (createErr) {
                                loginError(createErr);
                            } else {
                                QB.login(userRequiredParams, function (reloginErr, reloginUser) {
                                    if (reloginErr) {
                                        loginError(reloginErr);
                                    } else {
                                        loginSuccess(reloginUser);
                                    }
                                });
                            }
                        });
                    } else {
                        /** Update info */
                        if(loginUser.user_tags !== user.tag_list || loginUser.full_name !== user.full_name) {
                            QB.users.update(loginUser.id, {
                                'full_name': user.full_name,
                                'tag_list': user.tag_list
                            }, function(updateError, updateUser) {
                                if(updateError) {
                                    loginError(updateError);
                                } else {
                                    loginSuccess(updateUser);
                                }
                            });
                        } else {
                            loginSuccess(loginUser);
                        }
                    }
                });
            }
        });

        function loginSuccess(userData){
            app.user = userModule.addToCache(userData);
            app.user.user_tags = userData.user_tags;
            QB.chat.connect({userId: app.user.id, password: user.password}, function(err, roster){
                if (err) {
                    document.querySelector('.j-login__button').innerText = 'Login';
                    console.error(err);
                    reject(err);
                } else {
                    self.isLogin = true;
                    resolve();
                }
            });
        }

        function loginError(error){
            self.renderLoginPage();
            console.error(error);
            var message = Object.keys(error.detail).map(function (key) { 
                return key + ' ' + error.detail[key].join('')
            })
            alert(message);
            reject(error);
        }
    });
    
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

        if(loginForm.hasAttribute('disabled') || !loginForm.userName.isValid || !loginForm.userLogin.isValid){
            return false;
        } else {
            loginForm.setAttribute('disabled', true);
        }

        var userName = loginForm.userName.value.trim(),
            userLogin = loginForm.userLogin.value.trim();

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
            var elem = e.currentTarget,
                container = elem.parentElement;

            if (!container.classList.contains('filled')) {
                container.classList.add('filled');
            }
        });

        i.addEventListener('focusout', function(e){
            var elem = e.currentTarget,
                container = elem.parentElement;

            if (!elem.value.length && container.classList.contains('filled')) {
                container.classList.remove('filled');
            }
        });

        i.addEventListener('input', function(e){
            var userName = loginForm.userName.value.trim(),
                userLogin = loginForm.userLogin.value.trim();

            loginForm.userName.isValid = 15 >= userName.length && userName.length >=3;
            loginForm.userLogin.isValid = 15 >= userLogin.length && userLogin.length >= 3 && (userLogin.match(/^[a-zA-Z]{1}[a-zA-Z0-9]+$/)!=null);

            formInputs.forEach(function(e) {
                var container = e.parentElement;
                if(e.isValid){
                    container.classList.remove('error');
                }else{
                    container.classList.add('error');
                }
            });

            loginBtn.removeAttribute('disabled');

        })
    });
};

var loginModule = new Login();
