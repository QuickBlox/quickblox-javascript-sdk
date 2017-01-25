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
    this.messagesLimit = appConfig.messagesPerRequers || 50;
    this.usersLimit = appConfig.usersPerRequest || 50;
    this.usersPage = null;

    this.scroll = {
        messages: null,
        dialogs: null,
        users: null
    };

    // Elements
    this.page = document.querySelector('#page');
    this.contentTitle = null;
    this.contentInner = null;
    this.messagesContainer = null;
    this.conversationLinks = null;
    this.userListConteiner = null;

    this.init(this._config);
};

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
        self.login();
        loginBtn.classList.add('loading');
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
                    console.log(err);
                } else {
                    helpers.redirectToPage('dashboard');
                }
            });
        } else {
            console.log('create session Error',err);
        }
    });
};

App.prototype.loadDashboard = function(){
    this.contentTitle = document.querySelector('.j-content__title');
    this.contentInner =  document.querySelector('.j-content__inner');
    this.conversationLinks = document.querySelector('.j-conversation_links_container');

    listeners.setListeners();

    this.loadDialogs('chat');
    this.tabSelectInit();
};

App.prototype.tabSelectInit = function(){
    var self = this,
        tabs = document.querySelectorAll('.j-sidebar__tab_link');

    helpers.addEvent(tabs, 'click', tabClickEvent);

    function tabClickEvent (e){
        e.preventDefault();

        var tab = e.currentTarget;

        if(tab.classList.contains('active')){
            return false;
        }

        _.each(tabs, removeActiveClass);

        tab.classList.add('active');

        if(tab.dataset.type === 'create'){
            self.buildCreateDialogTpl();
        } else {
            self.loadDialogs(tab.dataset.type);
        }
    }

    function removeActiveClass (elem){
        elem.classList.remove('active');
    }
};

App.prototype.loadDialogs = function(type){
    var self = this,
        filter = {};

    if(type === 'chat'){
        filter['type[in]'] = '2,3';
    } else {
        filter.type = 1;
    }

    helpers.clearView(self.conversationLinks);

    QB.chat.dialog.list(filter, function(err, resDialogs){
        if(err){
            console.error(err);
            return;
        }

        var dialogs = resDialogs.items;
        // add info about users to cache.
        var pearToPearDialogs = dialogs.filter(function(dialog){
            if(dialog.type === 3) {
                return true
            }
        }).map(function(dialog){
            return {
                name: dialog.name,
                id: dialog.occupants_ids.filter(function(id){
                    if(id !== self.user.id) return id;
                })[0],
                color: _.random(1, 10)
            }
        });

        cache.setUser(pearToPearDialogs);

        _.each(dialogs, function(dialog){
            self.buildDialog(dialog);
        });

        if(self.dialogId){
            var dialog = document.getElementById(self.dialogId);
            if(dialog) dialog.classList.add('selected');
        }
    });
};

App.prototype.buildDialog = function(dialog, setAsFirst){
    var self = this,
        compiledDialogParams = helpers.compileDialogParams(dialog);

    cache.setDialog(dialog._id, compiledDialogParams);

    var template = helpers.fillTemplate('tpl_userConversations', {dialog: compiledDialogParams}),
        elem = helpers.toHtml(template)[0];

    elem.addEventListener('click', function(e){
        if(elem.classList.contains('selected')) return false;

        var selectedDialog = document.querySelector('.dialog__item.selected');

        if(selectedDialog){
            selectedDialog.classList.remove('selected');
        }

        elem.classList.add('selected');
        self.prevDialogId = self.dialogId;
        self.dialogId = e.currentTarget.id;
        self.renderDialog(e.currentTarget.id);
    });

    if(!setAsFirst) {
        self.conversationLinks.appendChild(elem);
    } else {
        self.conversationLinks.insertBefore(elem, self.conversationLinks.firstElementChild);
    }
};

App.prototype.renderDialog = function(id){
    var self = this,
        dialog = cache.getDialog(id);

    if(!cache.checkCachedUsersInDialog(id)) return false;

    this.contentTitle.innerText = dialog.name;

    if(!document.forms.send_message){
        helpers.clearView(this.contentInner);
        this.contentInner.innerHTML = helpers.fillTemplate('tpl_chatInput');
        self.messagesContainer = document.querySelector('.j-messages');
        document.forms.send_message.addEventListener('submit', self.sendMessage.bind(self));
    } else {
        var draft = document.forms.send_message.message_feald.value;

        if(self.prevDialogId) cache.setDialog(self.prevDialogId, null, null, draft);

        helpers.clearView(self.messagesContainer);
    }

    var dialogData = cache.getDialog(self.dialogId);

    document.forms.send_message.message_feald.value = dialogData.draft;

    if(dialogData && dialogData.messages.length){
        for(var i = 0; i < dialogData.messages.length; i++){
            self.renderMessage(dialogData.messages[i], false);
        }
        self.scrollTo('messages', 'bottom');
    } else {
        self.getMessages({
            chat_dialog_id: self.dialogId,
            sort_desc: 'date_sent',
            limit: self.messagesLimit,
            skip: 0
        });
    }
};

App.prototype.getMessages = function(params){
    var self = this;
    QB.chat.message.list(params, function(err, messages) {
        if (messages) {
            cache.setDialog(params.chat_dialog_id, null, messages.items, null);

            if(self.dialogId !== params.chat_dialog_id) return false;

            for(var i=0;i<messages.items.length; i++){
                var message = helpers.fillMessagePrams(messages.items[i]);
                self.renderMessage(message, false);
            }

            self.initLoadMoreBtn();

            if(!params.skip){
                self.scrollTo('messages', 'bottom');
            }

        } else {
            console.log(err);
        }
    });
};

App.prototype.initLoadMoreBtn = function(){
    var self = this,
        loadBtn = self.messagesContainer.querySelector('.j-load_more__btn');

    if(!cache.getDialog(self.dialogId).full){
        if (!loadBtn) {
            var tpl = helpers.fillTemplate('tpl_loadMore'),
                btnWrap = helpers.toHtml(tpl)[0],
                btn = btnWrap.firstElementChild;

            btn.addEventListener('click', function(){
                btn.innerText = 'Loading...';

                self.getMessages({
                    chat_dialog_id: self.dialogId,
                    sort_desc: 'date_sent',
                    limit: self.messagesLimit,
                    skip: cache.getDialog(self.dialogId).messages.length
                });
            });
            self.messagesContainer.insertBefore(btnWrap, self.messagesContainer.firstElementChild);
        } else {
            loadBtn.innerText = 'Load more';
            self.messagesContainer.insertBefore(loadBtn.parentElement, self.messagesContainer.firstElementChild);
        }
    } else {
        if (loadBtn) {
            self.messagesContainer.removeChild(loadBtn.parentElement);
        }
    }
};

App.prototype.renderMessage = function(message, setAsFirst){
    var self = this,
        sender = cache.getUser(message.sender_id);
    var messagesHtml = helpers.fillTemplate('tpl_message', {message: message, sender: sender}),
        elem = helpers.toHtml(messagesHtml)[0];

    if(message.attachments.length){
        var images = elem.querySelectorAll('.message_attachment');
        for(var i = 0; i < images.length; i++){
            images[i].addEventListener('load', function(e){
                var img = e.target,
                    imgPos = self.messagesContainer.offsetHeight + self.messagesContainer.scrollTop - img.offsetTop + self.contentTitle.offsetHeight,
                    scrollHeight = self.messagesContainer.scrollTop + img.offsetHeight;

                img.classList.add('loaded');

                if(imgPos > 0) app.messagesContainer.scrollTop = scrollHeight;
            });
        }
    }
    if(setAsFirst) {
        self.messagesContainer.appendChild(elem);
    } else {
        self.messagesContainer.insertBefore(elem, self.messagesContainer.firstElementChild);
    }
};

App.prototype.changeLastMessagePreview = function(dialogId, msg){
    var dialog = document.getElementById(dialogId);

    dialog.querySelector('.j-dialog__last_message ').innerText = msg.message;
};

App.prototype.sendMessage = function(e){
    e.preventDefault();

    var self = this,
        dialog = cache.getDialog(self.dialogId),
        msg = {
            type: dialog.type === 3 ? 'chat' : 'groupchat',
            body: document.forms.send_message.message_feald.value,
            extension: {
                save_to_history: 1,
            }
        },
        messageId = QB.chat.send(dialog.jidOrUserId, msg);

    document.forms.send_message.message_feald.value = '';

    msg.id = messageId;
    msg.extension.dialog_id = app.dialogId;

    var message = helpers.fillNewMessagePrams(self.user.id, msg),
        scrollPosition = self.messagesContainer.scrollHeight - (self.messagesContainer.offsetHeight + self.messagesContainer.scrollTop);

    cache.setDialog(self.dialogId, null, message);

    if(dialog.type === 3) {
        self.renderMessage(message, true);
    }

    if(scrollPosition < 10) {
        self.scrollTo('messages', 'bottom');
    }
};

App.prototype.buildCreateDialogTpl = function(){
    var self = this,
        titleTpl = helpers.fillTemplate('tpl_newGroupChatTitle'),
        contentTpl = helpers.fillTemplate('tpl_newGroupChatContent');


    helpers.clearView(self.contentTitle);
    helpers.clearView(self.contentInner);


    self.contentTitle.innerHTML = titleTpl;
    self.contentInner.innerHTML = contentTpl;

    self.messagesContainer = null;
    self.usersPage = null;

    var backToDialog = self.contentTitle.querySelector('.j-back_to_dialog');

    self.userListConteiner = self.contentInner.querySelector('.j-group_chat__user_list');

    document.forms.create_dialog.addEventListener('submit', function(e){
       e.preventDefault();

        var items = self.userListConteiner.querySelectorAll('.selected'),
            type = items.length > 1 ? 2 : 3,
            name = document.forms.create_dialog.dialog_name.value,
            occupants_ids = [];

        _.each(items, function(user){
            occupants_ids.push(+user.id);
        });


        var params = {
            type: type,
            occupants_ids: occupants_ids,
            name: name
        };

        console.log(params);
    });

    self.getUserList();

};

App.prototype.getUserList = function(){
    var self = this,
        params = {
            page: self.usersPage,
            per_page: self.usersLimit
        };

    QB.users.listUsers(params, function(err, responce){

        if(err){
            console.error(err);
            return false;
        }

        var users = responce.items;
        self.usersPage = ++responce.current_page;

        _.each(users, function(data){
            var user = data.user;

            user.color = _.random(1, 10);
            user.name = user.full_name || user.login;
            cache.setUser(user);
            self.buildUserItem(user);
        });

        self.initLoadMoreUsers(users.length < self.usersLimit);

    });
};

App.prototype.buildUserItem = function(user){
    var self = this,
        userTpl = helpers.fillTemplate('tpl_newGroupChatUser', {user: user}),
        elem = helpers.toHtml(userTpl)[0];

    elem.addEventListener('click', function(){
        elem.classList.toggle('selected');

        if(self.userListConteiner.querySelectorAll('.selected').length > 0){
            self.contentInner.querySelector('.j-create_dialog_btn').removeAttribute('disabled');
        } else {
            self.contentInner.querySelector('.j-create_dialog_btn').setAttribute('disabled', true);
        }
    });

    self.userListConteiner.appendChild(elem);
};

App.prototype.initLoadMoreUsers = function(remove){
    var self = this,
        btn = self.contentInner.querySelector('.j-load_more__btn');
    if(!remove){
        if(!btn) {
            var tpl = helpers.fillTemplate('tpl_loadMore'),
                btnWrap = helpers.toHtml(tpl)[0];

            btn = btnWrap.firstElementChild;

            self.userListConteiner.appendChild(btnWrap);

            btn.addEventListener('click', function(){
                btn.innerText = 'Loading...';
                self.getUserList();
            });

            self.userListConteiner.appendChild(btnWrap);

        } else {
            btn.innerText = 'Load more';
            self.userListConteiner.appendChild(btn.parentElement);
        }
    } else if(btn) {
        self.userListConteiner.removeChild(btn.parentElement);
    }

};

App.prototype.scrollTo = function (item, position) {
    var self = this,
        // users: null
        elem = item === 'messages' ? self.messagesContainer :
            'messages' ? self.conversationLinks : false,
        elemHeight = elem.offsetHeight,
        elemScrollHeight = elem.scrollHeight;

    if(position === 'bottom'){
        if((elemScrollHeight - elemHeight) > 0) {
            elem.scrollTop = elemScrollHeight;
        }
    } else if (position === 'top'){
        elem.scrollTop = 0;
    } else if(+position) {
        elem.scrollTop = +position
    }
};



// QBconfig was loaded from QBconfig.js file
var app = new App(QBconfig);