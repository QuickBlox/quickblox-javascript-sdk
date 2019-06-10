'use strict';

var router = new Navigo(null, true, '#!');

router.on({
    '': function(){
        if(!loginModule.isLogin) {
            router.navigate('/login');
        } else {
            router.navigate('/dashboard');
        }
    },
    '/login': function(){
        if(!loginModule.isLogin) {
            loginModule.init().then(function(isLogedIn){
                if(isLogedIn){
                    router.navigate('/dashboard');
                } else {
                    loginModule.renderLoginPage();
                }
            }).catch(function(error){
                loginModule.renderLoginPage();
                console.error(error);
            });
        } else {
            router.navigate('/dashboard');
        }
    },
    '/dashboard': function(){
        if(!loginModule.isLogin) {
            loginModule.init().then(function(isLogedIn){
                if(!isLogedIn){
                    router.navigate('/login');
                    return;
                }
                app.renderDashboard('chat');
                dialogModule.loadDialogs('chat');
            }).catch(function() {
               router.navigate('/login');
            });
        } else if(app.isDashboardLoaded) {
            app.loadWelcomeTpl();
            app.sidebar.classList.add('active');
        } else {
            app.renderDashboard('chat');
            dialogModule.loadDialogs('chat');
        }
    },
    '/dialog/create': {
        uses: function() {
            if (!loginModule.isLogin){
                loginModule.init().then(function(isLogedIn){
                    if(!isLogedIn){
                        router.navigate('/login');
                        return;
                    }
                    if(!app.isDashboardLoaded) {
                        app.renderDashboard('chat');
                        dialogModule.loadDialogs('chat');
                    }
                    _renderNewDialogTmp();
                }).catch(function(error){
                    console.error(error);
                    router.navigate('/login');
                });
            } else {
                _renderNewDialogTmp();
            }

            function _renderNewDialogTmp(){
                var createDialogTab = document.querySelector('.j-sidebar__create_dialog');

                createDialogTab.classList.add('active');
                app.sidebar.classList.remove('active');

                app.buildCreateDialogTpl();
            }
        },
        hooks: {
            leave: function () {
                userModule.reset()
            }
        }
    },
    '/dialog/:dialogId': function(params){
        var dialogId = params.dialogId;

        dialogModule.prevDialogId = dialogModule.dialogId;
        dialogModule.dialogId = dialogId;

        if (!loginModule.isLogin){
            loginModule.init().then(function(isLogedIn){
                if(!isLogedIn){
                    router.navigate('/login');
                    return;
                }
                if(!app.isDashboardLoaded) {
                    app.renderDashboard();
                }
                _renderSelectedDialog();
            }).catch(function(error){
                console.error(error);
                router.navigate('/login');
            });
        } else {
            _renderSelectedDialog();
        }

        function _renderSelectedDialog(){
            var currentDialog = dialogModule._cache[dialogId];
            if(currentDialog) {
                dialogModule.selectCurrentDialog(dialogId);
            }
            dialogModule.getDialogById(dialogId).then(function(dialog){
                var tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                    tab = document.querySelector('.j-sidebar__tab_link[data-type="' + tabDataType + '"]');
                if(!currentDialog) {
                    app.loadChatList(tab).then(function () {
                        dialogModule.renderMessages(dialogId);
                        app.sidebar.classList.remove('active');
                    }).catch(function (error) {
                        console.error(error);
                    });
                }else if(tabDataType === 'chat') {
                    userModule.getUsersByIds(currentDialog.users).then(function () {
                        document.getElementById(dialogId).querySelector('.dialog__name').innerHTML = dialog.name;
                        dialogModule.renderMessages(dialogId);
                    }).catch(function (error) {
                        console.error(error);
                    });
                }else{
                    dialogModule.renderMessages(dialogId);
                }
            }).catch(function(error){
                console.error(error);
                var tab = document.querySelector('.j-sidebar__tab_link[data-type="chat"]');
                app.loadChatList(tab);
                router.navigate('/dashboard');
            });

        }

        document.addEventListener('visibilitychange', function() {
            var currentDialog = dialogModule._cache[dialogId],
                dialogType = currentDialog.type === 1 ? 'public' : 'chat';

            if (document.visibilityState !== 'visible') {
                dialogType = currentDialog.type === 1 ? 'chat' : 'public';
            }

            var tab = document.querySelector('.j-sidebar__tab_link[data-type="'+dialogType+'"]');
            app.loadChatList(tab).then(function () {
                if (document.visibilityState === 'visible'
                    && window.location.href.match(/\/dialog\/[a-zA-Z0-9]+$/)
                    && !window.location.href.match(/\/dialog\/create$/)) {
                    dialogModule.renderMessages(dialogModule.dialogId);
                }
            });
        });

    },
    '/dialog/:dialogId/edit': {
        uses: function(params) {
            var dialogId = params.dialogId;
            var currentDialog = null;

            if (!loginModule.isLogin){
                loginModule.init().then(function(isLogedIn){
                    if(!isLogedIn){
                        router.navigate('/login');
                        return;
                    }
                    _renderEditDialogPage();
                }).catch(function(error){
                    console.error(error);
                    router.navigate('/login');
                });
            } else {
                _renderEditDialogPage();
            }

            function _renderEditDialogPage(){
                if(!app.isDashboardLoaded) {
                    app.renderDashboard();
                }
                currentDialog = dialogModule._cache[dialogId];

                if(!currentDialog) {
                    dialogModule.dialogId = dialogId;
                    dialogModule.getDialogById(dialogId).then(function(dialog) {
                        var tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                            tab = document.querySelector('.j-sidebar__tab_link[data-type="' + tabDataType + '"]');
                        // add to dialog template
                        app.content.innerHTML = helpers.fillTemplate('tpl_UpdateDialogContainer', {title: dialog.name, _id: dialog._id});
                        _renderUsers(dialog.occupants_ids).then(_setEditDialogListeners);
                        app.loadChatList(tab).then(function(){})
                            .catch(function(error){
                                console.error(error);
                            });
                    }).catch(function(error){
                        router.navigate('#!/dashboard');
                    });
                } else {
                    app.content.innerHTML = helpers.fillTemplate('tpl_UpdateDialogContainer', {title: currentDialog.name, _id: currentDialog._id});
                    _renderUsers(currentDialog.users).then(_setEditDialogListeners);
                }
            }

            function _renderUsers(dialogOccupants){
                userModule.selectedUserIds = dialogOccupants.slice();
                userModule.disabledUserIds = dialogOccupants.slice();
                return userModule.initGettingUsers('.j-update_chat__user_list');
            }

            function _setEditDialogListeners(){
                var editTitleBtn = document.querySelector('.j-update_chat__title_button'),
                    editTitleForm = document.forms.update_chat_name,
                    addUsersBtn = document.querySelector('.j-update_dialog_btn'),
                    counterElem = document.querySelector('.j-update__chat_counter'),
                    editTitleInput = editTitleForm.update_chat__title,
                    userList = document.querySelector('.j-update_chat__user_list'),
                    editUsersCountForm = document.forms.update_dialog,
                    canselBtn = editUsersCountForm.update_dialog_cancel;

                // change Title listener
                editTitleBtn.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();


                    editTitleForm.classList.toggle('active');

                    if(editTitleForm.classList.contains('active')){
                        editTitleInput.removeAttribute('disabled');
                        editTitleInput.focus();
                    } else {
                        editTitleInput.setAttribute('disabled', true);
                        _updateDialogTitleRequest();
                    }
                });

                editTitleInput.addEventListener('input', function(e){
                    var titleText = editTitleInput.value,
                        sylmbolsCount = titleText.length;
                    if(sylmbolsCount > 40) {
                        editTitleInput.value = titleText.slice(0, 40);
                    }
                });

                userList.addEventListener('click', function (e) {
                    if (e.target.classList.contains('disabled')) return;
                    var addUsersCount = userModule.selectedUserIds.filter(function (userId) {
                        return userModule.disabledUserIds.indexOf(userId) === -1;
                    }).length;
                    counterElem.innerText = addUsersCount;
                    addUsersBtn.disabled = addUsersCount === 0;
                });

                editTitleForm.addEventListener('submit', function (e) {
                    e.preventDefault();

                    _updateDialogTitleRequest();
                });

                editUsersCountForm.addEventListener('submit', function(e){
                    e.preventDefault();

                    var params = {
                        id: dialogId,
                        userList: userModule.selectedUserIds
                    };

                    dialogModule.updateDialog(params);
                });

                canselBtn.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    router.navigate('/dialog/' + dialogId);
                });

                function _updateDialogTitleRequest(){
                    var params = {
                        id: dialogId,
                        title: editTitleInput.value.trim()
                    };

                    if(dialogModule._cache[dialogId].name !== params.title) {
                        dialogModule.updateDialog(params);
                        editTitleForm.classList.remove('active');
                        editTitleInput.setAttribute('disabled', true);
                    }
                }
            }
        },
        hooks: {
            leave: function () {
                userModule.reset()
            }
        }
    }
}).resolve();

router.notFound(function(){
   alert('can\'t find this page');
});
