'use strict';

/*
 * Before start chatting you need to follow this steps:
 * 1. Initialize QB SDK ( QB.init() );
 * 2. Create user session (QB.createSession());
 * 3. Connect to chat in a creqte session callback (QB.chat.connect());
 * 4. Set listeners;
 */

function App (config) {
    this._config = config;
    this._isLogin = false;
    this.user = null;
    this.token = null;
    // Elements
    this.page = document.querySelector('#page');

    this.init(this._config);
};

// Before start working with JS SDK you nead to init it.
App.prototype.init = function(config, user){
    var self = this;
    // Step 1. QB SDK initialization.
    QB.init(config.credentials.appId, config.credentials.authKey, config.credentials, config.appConfig);
};

App.prototype.setLoginListeners = function() {
    var self = this,
        select = document.querySelector('.j-login__select'),
        loginBtn = document.querySelector('.j-login__button');

    select.addEventListener('change', function(){
        if(!isNaN(this.value)){
            loginBtn.removeAttribute('disabled');
        }
    });

    loginBtn.addEventListener('click', function(){
        var userId = +select.value;

        self.user = _.findWhere(usersList, {id: userId});
        helpers.redirrectToPage('dashboard');
    });
};

App.prototype.login = function(){
    // Step 2. Create session with user credentials.
    QB.createSession({login: self.user.login, password: self.user.pass}, function(err, res) {
        if (res) {
            self.token = res.token;
            console.log(res);
            // Step 3. Conect to chat.
            QB.chat.connect({userId: self.user.id, password: self.user.pass}, function(err, roster) {
                if (err) {
                    console.log(err);
                } else {
                    // Step 4. Set listeners. (listeners module - listeners.js file);
                    listeners.setListeners();
                }
            });
        }
    });
};

App.prototype.tabSelectInit = function(){

    var self = this,
        tabs = document.querySelectorAll('.j-sidebar__tab_link');

    _.each(tabs, addClickEvent);

    function addClickEvent (elem, i, array){
        elem.addEventListener('click', function(e){
            e.preventDefault();
            var tab = e.target;

            if(tab.classList.contains('active')){
                return false;
            }

            _.each(tabs, removeActiveClass);

            tab.classList.add('active');
        });
    }

    function removeActiveClass (elem){
        elem.classList.remove('active');
    }
}

// QBconfig was loaded from QBconfig.js file
var app = new App(QBconfig);
