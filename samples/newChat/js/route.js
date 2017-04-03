'use strict';

var router = new Navigo(null, true, '#!');

router.on({
    '': function(){
        loginModule.init(function(){
            router.navigate('/dashboard');
        });
    },
    '/login': function(){
        loginModule.init(function(){
            router.navigate('/dashboard');
        });
    },
    '/dashboard': function(){
        if(!loginModule.isLogin) {
            loginModule.init(function(){
                console.log('test');
                app.loadDashboard('chat');
            });
        } else {
            app.loadDashboard('chat');
        }
    },
    '/dialog/:dialogId': function(params){
        var dialogId = params.dialogId;
        dialogModule.dialogId = dialogId;

        if (!loginModule.isLogin){
            loginModule.init(function(){
                dialogModule.getDialogById(dialogId, function(dialog){
                    var type = dialog.type === 1 ? 'public' : 'chat';

                    app.loadDashboard(type, function(){
                        var tab = document.querySelector('.j-sidebar__tab_link[data-type="'+ type +'"]');
                        app.loadChatList(tab, function(){
                            console.log('test');
                        });
                    });
                });
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
