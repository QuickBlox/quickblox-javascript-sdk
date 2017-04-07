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
            // var dialog = dialogModule._cache[dialogId];
            //
            // if(dialog){
            //     dialogModule.renderMessages(dialog, true);
            // } else {
            //     dialogModule.getDialogById(dialog, function(dialog){
            //         var type = dialog.type === 1 ? 'public' : 'chat';
            //         app.loadChatList(type);
            //
            //     });
            // }
        }

        function _renderSelectedDialog(){
            var currentDialog = dialogModule._cache[dialogId];
            if(!currentDialog){
                dialogModule.dialogsListContainer.classList.add('loading');
                dialogModule.getDialogById(dialogId).then(function(dialog){
                    var dialogId = dialog._id,
                        tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                        tab = document.querySelector('.j-sidebar__tab_link[data-type="' + tabDataType + '"]');

                    dialogModule.dialogId = dialogId;

                    if(dialog.type === CONSTANTS.DIALOG_TYPES.CHAT){
                        console.log('from route');
                        userModule.addToCache({
                            full_name: dialog.name,
                            id: dialog.occupants_ids.filter(function (id) {
                                if (id !== app.user.id) return id;
                            })[0],
                            color: _.random(1,10)
                        });
                    }

                    dialogModule._cache[dialogId] = helpers.compileDialogParams(dialog);
                    currentDialog = dialogModule._cache[dialogId];

                    dialogModule.checkCachedUsersInDialog(dialogId).then(function(){
                        dialogModule.renderMessages(dialogId);
                    }).catch(function(error){
                        console.error(error);
                    });
                    app.loadChatList(tab);
                }).catch(function(error){
                    console.info('redirrect to dashboard');
                    router.navigate('#!/dashboard');
                    alert('can\'t find dialog with id: ' + dialogId);
                });
            }
        }
    },
    'dialog/:dialogId/edit': function(params){
        console.log('route /dialog/edit');
        var dialogId = params.dialogId;
        alert('/dialog/'+ dialogId + '/edit');
    }

}).resolve();

router.notFound(function(){
   alert('can\'t find this page');
});
