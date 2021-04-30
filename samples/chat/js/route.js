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
    '/login': async function(){

        document.querySelector('.login__logo').classList.remove("show");
        document.querySelector('.login__logo').classList.add("show");

        document.querySelector('.info').style.display = "block";
        document.querySelector('.more').style.display = "none";
        document.querySelector('.menu').classList.remove("show");
        document.querySelector('#dialogName').innerHTML = '';

        if(!loginModule.isLogin && !(await loginModule.init()) ) {
            loginModule.renderLoginPage();
        } else {
            router.navigate('/dashboard');
        }
    },
    '/dashboard': async function() {

        dialogModule.dialogId = null;

        document.querySelector('.info').style.display = "none";
        document.querySelector('.more').style.display = "none";
        document.querySelector('.menu').classList.add("show");
        document.querySelector('#dialogName').innerHTML = '';

        if(document.documentElement.clientWidth < 880) {
            document.querySelector('#back_to_dashboard').classList.remove('show');
            document.querySelector('.menu').classList.add('show');
        }else{
            document.querySelector('#back_to_dashboard').classList.remove('show');
            document.querySelector('.menu').classList.add('show');
        }

        document.querySelectorAll('.j-dialog__item').forEach(function (element) {
            element.classList.remove('selected');
        });

        if(!loginModule.isLogin && !(await loginModule.init())) {
            router.navigate('/login');
        } else if(app.isDashboardLoaded) {
            app.loadWelcomeTpl();
            app.sidebar.classList.add('active');
        } else {
            app.renderDashboard('chat');
            await dialogModule.loadDialogs('chat');
        }
    },
    '/dialog/create': {
        uses: async function() {

            if (!loginModule.isLogin && !(await loginModule.init())){
                router.navigate('/login');
                return;
            }

            if(!app.isDashboardLoaded) {
                app.renderDashboard('chat');
                await dialogModule.loadDialogs('chat');
            }

            app.sidebar.classList.remove('active');
            app.buildCreateDialogTpl();
            modal.substrate.classList.add('show');
            window.modal.watch();

        },
        hooks: {
            leave: function () {
                userModule.reset()
            }
        }
    },
    '/dialog/:dialogId': async function(params) {

        app.modal.innerHTML = "";
        app.modal.style.width = 'auto';
        app.modal.style.height = 'auto';

        if(document.documentElement.clientWidth < 880) {
            document.querySelector('#back_to_dashboard').classList.add('show');
            document.querySelector('.menu').classList.remove('show');
        }else{
            document.querySelector('#back_to_dashboard').classList.remove('show');
            document.querySelector('.menu').classList.add('show');
        }

        modal.substrate.classList.remove('show');

        var dialogId = params.dialogId;


        if(dialogModule._cache[dialogId] && dialogId !== dialogModule.dialogId){
            dialogModule._cache[dialogId].messages = [];
        }

        dialogModule.prevDialogId = dialogModule.dialogId;
        dialogModule.dialogId = dialogId;

        if (!loginModule.isLogin && !(await loginModule.init())){
            router.navigate('/login');
            return;
        }

        if(!app.isDashboardLoaded) {
            app.renderDashboard();
        }

        if(document.documentElement.clientWidth < 880) {
            document.querySelector('.sidebar').style.position = "fixed";
            document.querySelector('.sidebar').style.flex = 'none';
        }

        var currentDialog = dialogModule._cache[dialogId];
        if(currentDialog) {
            dialogModule.selectCurrentDialog(dialogId);
        }

        dialogModule.getDialogById(dialogId).then(async function(dialog) {

            document.querySelector('.info').style.display = "none";
            document.querySelector('.more').style.display = "block";

            if(document.querySelector('.attachments_preview') !== null) {
                dialogModule._cache[dialogModule.prevDialogId].draft.attachments = {};
                document.querySelector('.attachments_preview').style.display = 'none';
                document.querySelector('.send_message .send_btn').style.top = '10px';
            }

           if (dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
               document.querySelector('.moreList li:first-child').style.display = "block";
               document.querySelector('.moreList').style.height = '86px';
           }else{
               document.querySelector('.moreList li:first-child').style.display = "none";
               document.querySelector('.moreList').style.height = '50px';
           }

            document.querySelector('#dialogName').innerHTML = dialog.name;

            var tabDataType = dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat';
            if(!currentDialog) {
                app.loadChatList().then(function () {
                    if(!dialogModule._cache[dialog._id]) {
                        dialogModule._cache[dialog._id] = helpers.compileDialogParams(dialog);
                        dialogModule.renderDialog(dialogModule._cache[dialog._id]);
                    }
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
            app.loadChatList();
            router.navigate('/dashboard');
        });


    },
    '/dialog/:dialogId/edit': {
        uses: async function(params) {
            var dialogId = params.dialogId;
            var currentDialog = null;

            if (!loginModule.isLogin && !(await loginModule.init())){
                router.navigate('/login');
                return;
            }

            if(!app.isDashboardLoaded) {
                app.renderDashboard();
            }

            if(dialogModule.dialogId !== dialogId) {
                router.navigate('/dialog/' + dialogId);
                return;
            }

            currentDialog = dialogModule._cache[dialogId];
            if(!currentDialog) {
                dialogModule.dialogId = dialogId;
                dialogModule.getDialogById(dialogId).then(function(dialog) {
                    dialogModule._cache[dialog._id] = helpers.compileDialogParams(dialog);
                    _renderUsers(dialog.occupants_ids, {title: dialog.name, _id: dialog._id, type:dialog.type, users:dialog.users});
                    app.loadChatList().catch(function(error){
                        console.error(error);
                    });
                }).catch(function(error){
                    router.navigate('#!/dashboard');
                });
            } else {
                _renderUsers(currentDialog.users, {title: currentDialog.name, _id: currentDialog._id, type:currentDialog.type, users:currentDialog.users});
            }


            function _renderUsers(dialogOccupants, params) {
                app.modal.innerHTML = helpers.fillTemplate('tpl_UpdateDialogContainer', params);
                modal.substrate.classList.add('show');
                window.modal.watch();

                userModule.selectedUserIds = dialogOccupants.slice();
                userModule.disabledUserIds = [];
                userModule.initGettingUsers(
                    '.j-occupants_chat__user_list',
                    null,
                    {
                        selected: false,
                        filter: {
                            field: 'id',
                            param: 'in',
                            value: dialogOccupants.slice()
                        },
                        per_page: 100
                    }
                ).then(function () {
                    userModule.selectedUserIds = dialogOccupants.slice();
                    userModule.disabledUserIds = dialogOccupants.slice();

                    return userModule.initGettingUsers('.j-update_chat__user_list').then(function () {
                        _setEditDialogListeners();
                    })
                });

            }

            function _setEditDialogListeners() {
                var editTitleBtn = document.querySelector('.j-update_chat__title_button'),
                    editTitleForm = document.forms.update_chat_name,
                    addUsersBtn = document.querySelector('.j-update_dialog_btn'),
                    //counterElem = document.querySelector('.j-update__chat_counter'),
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

                    if(document.querySelector('.selectedUserIds')) {
                        document.querySelector('.selectedUserIds').innerHTML = addUsersCount === 1 ?
                            addUsersCount + ' user selected' :
                            addUsersCount + ' users selected';
                    }
                    addUsersBtn.disabled = addUsersCount === 0;
                });

                editTitleForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    _updateDialogTitleRequest();
                });

                editUsersCountForm.addEventListener('submit', function(e) {
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

                function _updateDialogTitleRequest() {
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
