'use strict';

var router = new Navigo(null, true, '#!');

router.on({
    '': function(){
        console.log('route /');
        if(!loginModule.isLogin) {
            router.navigate('/login');
        } else {
            router.navigate('/dashboard');
        }
    },
    '/login': function(){
        console.log('route /login');
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
        console.log('route /dashboard');
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
        } else {
            app.renderDashboard('chat');
            dialogModule.loadDialogs('chat');
        }
    },
    '/dialog/:dialogId': function(params){
        console.log('route /dialog/ID');
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
            if(!currentDialog){
                dialogModule.getDialogById(dialogId).then(function(dialog){
                    var tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                        tab = document.querySelector('.j-sidebar__tab_link[data-type="' + tabDataType + '"]');

                    app.loadChatList(tab).then(function(){
                        dialogModule.renderMessages(dialogId);
                    }).catch(function(error){
                        console.error(error);
                    });

                }).catch(function(error){
                    router.navigate('#!/dashboard');
                });
            } else {
                dialogModule.renderMessages(dialogId);
            }
        }
    },
    'dialog/:dialogId/edit': function(params){
        console.log('route /dialog/ID/edit');
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

            if(!currentDialog){
                dialogModule.dialogId = dialogId;
                dialogModule.getDialogById(dialogId).then(function(dialog){
                    var tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                        tab = document.querySelector('.j-sidebar__tab_link[data-type="' + tabDataType + '"]');
                    // add to dialog template
                    app.content.innerHTML = helpers.fillTemplate('tpl_UpdateDialogContainer', {title: dialog.name, _id: dialog._id});
                    app.loadChatList(tab).then(function(){
                    }).catch(function(error){
                        console.error(error);
                    });
                    _renderUsers(dialog.occupants_ids);
                }).catch(function(error){
                    router.navigate('#!/dashboard');
                });
            } else {
                app.content.innerHTML = helpers.fillTemplate('tpl_UpdateDialogContainer', {title: currentDialog.name, _id: currentDialog._id});
                _renderUsers(currentDialog.users);
            }
        }

        function _renderUsers(dialogOccupants){
            var userList = document.querySelector('.j-update_chat__user_list');

            userModule.getUsers().then(function(usersArray){
                var users = usersArray.map(function(user){
                    user.selected = dialogOccupants.indexOf(user.id) !== -1;
                    return user;
                });

                _.each(users, function(user){
                    var userTpl = helpers.fillTemplate('tpl_editChatUser', user),
                        userElem = helpers.toHtml(userTpl)[0];

                    userElem.addEventListener('click', function(e){
                        var elem = e.currentTarget;
                        if(elem.classList.contains('disabled')) return;
                        elem.classList.toggle('selected');
                    });

                    userList.appendChild(userElem);
                });

            }).catch(function(error){
                console.error(error);
            });
        }
    }

}).resolve();

router.notFound(function(){
   alert('can\'t find this page');
});
