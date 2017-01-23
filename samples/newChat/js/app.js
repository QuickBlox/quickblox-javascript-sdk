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
    this.limit = config.limit || 50;
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

    //
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
            self.createDialog();
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
            limit: self.limit,
            skip: 0
        });
    }
};

App.prototype.getMessages = function(params){
    var self = this;
    QB.chat.message.list(params, function(err, messages) {
        if (messages) {
            cache.setDialog(params.chat_dialog_id, null, messages.items, null);

            for(var i=0;i<messages.items.length; i++){
                var message = helpers.fillMessagePrams(messages.items[i]);
                self.renderMessage(message, false);
            }

            if(!params.skip){
                self.scrollTo('messages', 'bottom');
            }


            if(!cache.getDialog(params.chat_dialog_id).full){
                console.log('can load more');
                if (!self.messagesContainer.querySelector('.load_more__btn')) {
                    var tpl = helpers.fillTemplate('tpl_loadMoreMessages'),
                        btnWrap = helpers.toHtml(tpl)[0],
                        btn = btnWrap.firstElementChild;

                    btn.addEventListener('click', function(){
                        self.getMessages({
                            chat_dialog_id: self.dialogId,
                            sort_desc: 'date_sent',
                            limit: self.limit,
                            skip: cache.getDialog(self.dialogId).messages.length
                        });
                    });

                    self.messagesContainer.insertBefore(btnWrap, self.messagesContainer.firstElementChild);
                } else {

                }
            } else {
                if (self.messagesContainer.querySelector('.load_more__btn')) {
                    console.log('need to remove');
                }
            }
        } else {
            console.log(err);
        }
    });
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

App.prototype.createDialog = function(){
    console.log('create new dialog');
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

    var message = helpers.fillNewMessagePrams(self.user.id, msg);

    cache.setDialog(self.dialogId, null, message);

    if(dialog.type === 3) {
        self.renderMessage(message, true);
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
