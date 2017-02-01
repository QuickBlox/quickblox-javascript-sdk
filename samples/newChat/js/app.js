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
    this.user = null;
    this.token = null;

    this.dialogId = null;
    this.prevDialogId = null;

    // Elements
    this.page = document.querySelector('#page');
    this.content = null;
    this.conversationLinks = null;
    this.userListConteiner = null;
    this.init(this._config);
}

// Before start working with JS SDK you nead to init it.

App.prototype.init = function(config){
    // Step 1. QB SDK initialization.
    QB.init(config.credentials.appId, config.credentials.authKey, config.credentials.authSecret, config.appConfig);
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
        if (loginBtn.classList.contains('loading')) return false;
        self.user = _.findWhere(usersList, {id: userId});
        loginBtn.classList.add('loading');

        self.login();

        loginBtn.innerText = 'loading...'
    });
};

App.prototype.login = function(){
    var self = this,
        userData = {
            login: self.user.login,
            password: self.user.pass
        };

    // Step 2. Create session with user credentials.
    QB.createSession(userData, function(err, res) {
        if (res) {
            self.token = res.token;
            // Step 3. Conect to chat.
            QB.chat.connect({userId: self.user.id, password: self.user.pass}, function(err, roster) {
                if (err) {
                    document.querySelector('.j-login__button').innerText = 'Login';
                    console.log(err);
                    alert('Connect to chat Error');
                } else {
                    helpers.redirectToPage('dashboard');
                }
            });
        } else {
            document.querySelector('.j-login__button').innerText = 'Login';
            console.log('create session Error',err);
            alert('Create session Error');
        }
    });
};

App.prototype.loadDashboard = function(){
    var self = this,
        logoutBtn = document.querySelector('.j-logout');

    self.content = document.querySelector('.j-content');

    dialogModule.init();

    self.loadWelcomeTpl();

    listeners.setListeners();

    logoutBtn.addEventListener('click', function(){
        QB.chat.disconnect();

        QB.logout(function(err){
            if(err){
                console.error(err);
            }
            helpers.redirectToPage('login');
        });
    });

    dialogModule.loadDialogs('chat');

    this.tabSelectInit();
};

App.prototype.loadWelcomeTpl = function(){

    var content = document.querySelector('.j-content'),
        welcomeTpl = helpers.fillTemplate('tpl_welcome');

    helpers.clearView(content);
    content.innerHTML = welcomeTpl;
};

App.prototype.tabSelectInit = function(){
    var self = this,
        tabs = document.querySelectorAll('.j-sidebar__tab_link'),
        createDialogTab = document.querySelector('.j-sidebar__create_dilalog');

    createDialogTab.addEventListener('click', function(e){
        if(e.currentTarget.classList.contains('active')) return false;

        createDialogTab.classList.add('active');
        self.buildCreateDialogTpl();
    });

    _.each(tabs, function(item){
        item.addEventListener('click', function(e){
            var tab = e.currentTarget;

            if(tab.classList.contains('active')){
                return false;
            }

            _.each(tabs, function(elem){
                elem.classList.remove('active');
            });

            createDialogTab.classList.remove('active');
            tab.classList.add('active');

            helpers.clearView(dialogModule.dialogsListContainer);
            dialogModule.loadDialogs(tab.dataset.type);
        });
    });
};

App.prototype.buildCreateDialogTpl = function(){
    var self = this,
        createDialogTPL = helpers.fillTemplate('tpl_newGroupChat');

    helpers.clearView(self.content);

    self.content.innerHTML = createDialogTPL;

    var backToDialog = self.content.querySelector('.j-back_to_dialog');

    self.userListConteiner = self.content.querySelector('.j-group_chat__user_list');

    document.forms.create_dialog.addEventListener('submit', function(e){
       e.preventDefault();

        var users = self.userListConteiner.querySelectorAll('.selected'),
            type = users.length > 1 ? 2 : 3,
            name = document.forms.create_dialog.dialog_name.value,
            occupants_ids = type === 3 ? [] : [self.user.id];

        _.each(users, function(user){
            occupants_ids.push(+user.id);
        });

        if(!name && type === 2) {
            var userNames = [];

            _.each(occupants_ids, function(id){
                if(id === self.user.id) {
                    userNames.push(self.user.name);
                } else {
                    userNames.push(userModule._cache[id].name);
                }
            });
            name = userNames.join(', ');
        }

        var params = {
            type: type,
            occupants_ids: occupants_ids,
        };

        if(type !== 3 && name) {
            params.name = name;
        }

        dialogModule.createDialog(params);
    });
    
    userModule.intGettingUsers();
};

// QBconfig was loaded from QBconfig.js file
var app = new App(QBconfig);
