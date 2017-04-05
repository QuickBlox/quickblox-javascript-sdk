'use strict';

var router = new Navigo(null, true, '#!');

router.on({
    '': function(){
        loginModule.init().then(function(){
            router.navigate('/dashboard');
        }).catch(function(error){
            console.log('login error');
            router.navigate('/login');
        });
    },
    '/login': function(){
        loginModule.init().then(function(){
            router.navigate('/dashboard');
        }).catch(function(error){
            console.log('login error');
            app.renderDashboard('chat');
        });
    },
    '/dashboard': function(){
        if(!loginModule.isLogin) {
            console.log('logging in');
            loginModule.init().then(function(){
                app.renderDashboard('chat');
                console.log('start loading dialogs');
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
        var dialogId = params.dialogId;
        dialogModule.dialogId = dialogId;

        if (!loginModule.isLogin){
            loginModule.init().then(function(){
                // render dashboard
                app.renderDashboard();
                dialogModule.dialogsListContainer.classList.add('loading');
                dialogModule.getDialogById(dialogId).then(function(dialog){
                    var dialogId = dialog._id,
                        tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                        tab = document.querySelector('.j-sidebar__tab_link[data-type="' + tabDataType + '"]');

                    dialogModule.dialogId = dialogId;

                    if(dialog.type === CONSTANTS.DIALOG_TYPES.CHAT){
                        userModule.addToCache({
                            name: dialog.name,
                            id: dialog.occupants_ids.filter(function (id) {
                                if (id !== app.user.id) return id;
                            })[0],
                            color: _.random(1,10)
                        });
                    }

                    if(!dialogModule._cache[dialogId]){
                        dialogModule._cache[dialogId] = helpers.compileDialogParams(dialog);
                    }

                    dialogModule.renderMessages(dialogId);
                    app.loadChatList(tab);


                }).catch(function(error){
                    console.log(error);
                });
            }).catch(function(error){
                app.renderDashboard('chat');
            });
        } else {
            var dialog = dialogModule._cache[dialogId];

            if(dialog){
                dialogModule.renderMessages(dialog, true);
            } else {
                dialogModule.getDialogById(dialog, function(dialog){
                    var type = dialog.type === 1 ? 'public' : 'chat';
                    app.loadChatList(type);
                });
            }
        }
    },
    'dialog/:dialogId/edit': function(params){
        var dialogId = params.dialogId;
        alert('/dialog/'+ dialogId + '/edit');
    }

}).resolve();

router.notFound(function(){
   alert('can\'t find this page');
});
