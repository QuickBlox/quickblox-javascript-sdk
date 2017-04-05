'use strict';

function Login() {
    this.isLoginPageRendered = false;
    this.isLogin = false;
}

Login.prototype.init = function(){
    var self = this;
    return new Promise(function(resolve, reject){
        var user = localStorage.getItem('user');
        if(user && !app.user){
            var savedUser = JSON.parse(user);
            app.room = savedUser.tag_list;
            self.login(savedUser).then(function(){
                resolve();
            }).catch(function(error){
                reject(error);
            });
            self.renderLoadingPage()
        } else {
            self.renderLoginPage();
            resolve();
        }
    });
};

Login.prototype.login = function (user) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(self.isLoginPageRendered){
            document.querySelector('.j-login__button').innerText = 'loading...';
        }

        QB.createSession(function(csErr, csRes) {
            app.token = csRes.token;
            var userRequiredParams = {
                'login':user.login,
                'password': user.password
            };
            if (csErr) {
                loginError(csErr);
            } else {
                QB.login(userRequiredParams, function(loginErr, loginUser){
                    if(loginErr) {
                        /** Login failed, trying to create account */
                        QB.users.create(user, function (createErr, createUser) {
                            if (createErr) {
                                console.log('[create user] Error:', createErr);
                                loginError(createErr);
                            } else {
                                QB.login(userRequiredParams, function (reloginErr, reloginUser) {
                                    if (reloginErr) {
                                        console.log('[relogin user] Error:', reloginErr);
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
                                    reject(updateError);
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
            alert(error + "\n" + error.detail);
            reject(error);
        }
    });
};

Login.prototype.renderLoginPage = function(){
    helpers.clearView(app.page);

    app.page.innerHTML = helpers.fillTemplate('tpl_login',{
        users: usersList,
        version: QB.version
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
        form = document.forms.loginForm,
        formInputs = [form.userName, form.userGroup];

    form.addEventListener('submit', function(e){
        e.preventDefault();

        var userName = form.userName.value,
            userGroup = form.userGroup.value;

        var user = {
            login: helpers.getUui(),
            password: 'webAppPass',
            full_name: userName,
            tag_list: userGroup
        };

        localStorage.setItem('user', JSON.stringify(user));

        self.login(user);
    });

    // add event listeners for each input;

    _.each(formInputs, function(i){
        i.addEventListener('focus', function(e){
            var elem = e.currentTarget,
                container = elem.closest('.login_form__row');

            if (!container.classList.contains('filled')) {
                container.classList.add('filled');
            }
        });

        i.addEventListener('focusout', function(e){
            var elem = e.currentTarget,
                container = elem.closest('.login_form__row');

            if (!elem.value.length && container.classList.contains('filled')) {
                container.classList.remove('filled');
            }
        });

        i.addEventListener('input', function(){
            var userName = form.userName.value,
                userGroup = form.userGroup.value;
            if(userName.length >=3 && userGroup.length >= 3){
                document.querySelector('.j-login__button').removeAttribute('disabled');
            }
        })
    });
};

var loginModule = new Login();
