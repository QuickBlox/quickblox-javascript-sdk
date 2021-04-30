'use strict';


function Modal() {

    this.substrate = document.querySelector('#substrate');
    this.setListeners();
}

Modal.prototype.watch = function () {

    if(!app.modal.innerHTML.length){
        return null;
    }

    app.modal.style.top = "50%";
    app.modal.style.transform = "translate(-50%, -50%)";

    var
        imgPeview = app.modal.querySelector('.img_preview'),
        dialogForm = app.modal.querySelector('.dialog_form'),
        contentTitle = app.modal.querySelector('.content__title'),
        chatFilter = app.modal.querySelector('.group_chat__filter'),
        userList = app.modal.querySelector('.group_chat__user_list'),
        updateUserList = app.modal.querySelector('.update_chat__user_list'),
        modalInner = app.modal.querySelector('.modal__inner'),
        backToDashboard = app.modal.querySelector('.back_to_dashboard');

    if(contentTitle == null){
        contentTitle = {
            clientHeight:0
        }
    }

    if(chatFilter == null){
        chatFilter = {
            clientHeight:0
        }
    }

    var isImgPreview = app.modal.querySelector('.img_preview') !== null;

    if(document.documentElement.clientWidth >= 880 || isImgPreview) {


        if(backToDashboard !== null) {
            backToDashboard.classList.remove('active');
        }

        if (modal.substrate.classList.contains('show') && (app.modal.clientHeight > document.documentElement.clientHeight || app.modal.clientHeight > 600)) {
            app.modal.style.maxHeight = document.documentElement.clientHeight - 20 + 'px';
            if(document.documentElement.clientHeight > 664){
                app.modal.style.maxHeight = '644px';
            }
            if (imgPeview) {
                imgPeview.style.maxHeight = document.documentElement.clientHeight - 140 + 'px';
            }
        } else {
            app.modal.style.maxHeight = 'none';
        }

        let tmp = app.modal.style.maxHeight === "none" ? 600 : parseInt(app.modal.style.maxHeight);

        if(modal.substrate.classList.contains('show') && !imgPeview && document.documentElement.clientHeight > tmp+260) {
            app.modal.style.top = "130px";
            app.modal.style.transform = "translate(-50%, 0%)";
        }

        if(modalInner !== null){
            modalInner.style.maxHeight = app.modal.style.maxHeight;
        }


        app.modal.style.maxWidth = document.documentElement.clientWidth - 20 + 'px';
        if (imgPeview) {
            imgPeview.style.maxWidth = document.documentElement.clientWidth - 20 + 'px';
            app.modal.style.width = 'auto';
        } else {
            app.modal.style.width = '400px';
        }

        app.modal.style.height = 'auto';

        if(userList !== null) {
            userList.style.minHeight = 'none';
        }

        if(updateUserList !== null) {
            updateUserList.style.minHeight = 'none';
        }

        if(dialogForm !== null){
            dialogForm.style.minHeight = 'none';
        }

        app.modal.style.borderRadius = '6px';

    }else{

        if(backToDashboard !== null) {
            backToDashboard.classList.add('active');
        }

        app.modal.style.maxWidth = 'none';
        app.modal.style.maxHeight = 'none';
        app.modal.style.width = '100%';
        app.modal.style.height = '100%';
        app.modal.style.borderRadius = '0px';

        if(modalInner !== null){
            modalInner.style.maxHeight = app.modal.style.maxHeight;
        }

        console.log(
            document.documentElement.clientHeight,
            contentTitle.clientHeight,
            chatFilter.clientHeight
        );

        if(userList !== null ) {
            app.modal.querySelector('.group_chat__user_list').style.minHeight = document.documentElement.clientHeight -
                chatFilter.clientHeight -
                contentTitle.clientHeight + 'px';

            if(app.modal.querySelector('.dialog_form')) {
                app.modal.querySelector('.dialog_form').style.minHeight = document.documentElement.clientHeight -
                    app.modal.querySelector('.content__title').clientHeight + 'px';
            }
        }

        if(updateUserList !== null ) {
            app.modal.querySelectorAll('.update_chat__user_list').forEach(function (element) {
                element.style.minHeight = document.documentElement.clientHeight -
                    chatFilter.clientHeight -
                    contentTitle.clientHeight + 'px';
            });
        }

    }

};

Modal.prototype.setListeners = function () {

    var
        self = this,
        menu = document.querySelector('.menu'),
        menuList = document.querySelector('.menuList'),
        createChat = document.querySelector('.menuList li:nth-child(1)'),
        deleteChats = document.querySelector('.menuList li:nth-child(2)'),
        menuListInfo = document.querySelector('.menuList li:nth-child(3)'),
        logout = document.querySelector('.menuList li:nth-child(4)'),
        more = document.querySelector('.more'),
        moreList = document.querySelector('.moreList'),
        chatInfo = document.querySelector('.moreList li:nth-child(1)'),
        leaveChat = document.querySelector('.moreList li:nth-child(2)'),

        info = document.querySelector('.info'),
        params = app._config;
    params.version = QB.version;

    menuListInfo.addEventListener('click', function (e) {
        info.click();
    });

    info.addEventListener('click', function (e) {
        app.modal.innerHTML = helpers.fillTemplate('tpl_info', params);
        document.querySelector("#about-sample-close").addEventListener('click', function (e) {
            self.substrate.dispatchEvent(new Event("click"));
        });
        self.substrate.classList.add('show');
        self.watch();
    });

    createChat.addEventListener('click', function (e) {
        router.navigate('#!/dialog/create');
        self.substrate.classList.add('show');
        self.watch();
    });

    deleteChats.addEventListener('click', function (e) {

        helpers.clearView(app.modal);

        app.modal.innerHTML = helpers.fillTemplate('tpl_deleteChats');
        modal.substrate.classList.add('show');
        window.modal.watch();

        dialogModule.selectedDialogIds = [];

        var container = app.modal.querySelector('.j-group_chat__dialog_list');
        container.addEventListener('scroll', function loadMoreDialogs() {
            var position = container.scrollHeight - (container.scrollTop + container.offsetHeight);
            if (container.classList.contains('full')) {
                return false;
            }
            if (position <= 50 && !container.classList.contains('loading')) {
                dialogModule.getDialogs();
            }
        });

        document.forms.delete_dialog.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!app.checkInternetConnection()) {
                return false;
            }
            if (document.forms.delete_dialog.create_dialog_submit.disabled) return false;


            dialogModule.dialogId = null;

            function timer(i) {
                return dialogModule.quitFromTheDialog(dialogModule.selectedDialogIds[i]);
            }

            async function load () {
                for (var i = 0; i < dialogModule.selectedDialogIds.length; i++) {
                    await timer(i);
                }
            }

            load().then(function (i) {
                modal.substrate.click();
                if(dialogModule.dialogId === null) {
                    router.navigate('/dashboard');
                }
            });

        });

        dialogModule.initGettingDialogs('.j-group_chat__dialog_list', null, {
            selected: false
        }).then(function () {
            modal.substrate.classList.add('show');
            window.modal.watch();
        });
    });

    chatInfo.addEventListener('click', function (e) {
        document.querySelector('.j-add_to_dialog').click();
        self.substrate.classList.add('show');
        self.watch();
    });

    leaveChat.addEventListener('click', function (e) {
        dialogModule.quitFromTheDialog(dialogModule.dialogId).then(function () {
            router.navigate('/dashboard');
        });
    });

    logout.addEventListener('click', function (e) {

        if(!app.checkInternetConnection()){
            return;
        }

        menuList.classList.remove('active');
        loginModule.isLogin = false;
        app.isDashboardLoaded = false;
        localStorage.removeItem('user');
        helpers.clearCache();
        QB.chat.disconnect();
        QB.destroySession(() => null);
        router.navigate('#!/login');
    });

    document.addEventListener('click', e => {
        var
            target = e.target,
            messageSidebar = document.querySelector('.open_sidebar'),
            messageMenuActive = document.querySelectorAll(".message-menu.active"),
            menuIsActive = menuList.classList.contains('active'),
            moreIsActive = moreList.classList.contains('active');

        if (menu.contains(target) && !menuList.classList.contains('active')) {
            menuList.classList.add('active');
        } else if (menuIsActive) {
            menuList.classList.remove('active');
        }

        if (more.contains(target) && !moreList.classList.contains('active')) {
            moreList.classList.add('active');
        } else if (moreIsActive) {
            moreList.classList.remove('active');
        }

        if(messageSidebar !==null && messageSidebar.contains(target)) {
            router.navigate('/dashboard');
        }
        if(messageMenuActive.length>0) {
            document.querySelectorAll(".message-menu.active")[0].classList.remove('active');
        }
    });

    helpers._( document ).on("click", ".message-menu", function( _event, _element ) {
       var
           [FORWARD, DELIVERED, VIEWED] = ['Forward','Delivered to…','Viewed by…'].map(function (e) {
               return _event.target.innerText === e
           }),
           tpl = FORWARD ? 'tpl_forward' : DELIVERED ? 'tpl_delivered' : 'tpl_viewed',
           message = Object.values(dialogModule._cache[dialogModule.dialogId].messages).filter(function (message) {
                if (message._id === _element.dataset.messageId) return message;
            })[0],
           userListContainerSelector = FORWARD ? '.j-group_chat__dialog_list' : '.j-occupants_chat__user_list',
           params = FORWARD ? {
               selected: false,
               isLastMessage: false
           } : {
               selected: true,
               filter: {
                   field: 'id',
                   param: 'in',
                   value: DELIVERED ? message.delivered_ids.slice() : message.read_ids.slice()
               },
               per_page: DELIVERED ? message.delivered_ids.length : message.read_ids.length
           };

        helpers.clearView(app.modal);
        app.modal.innerHTML = helpers.fillTemplate(tpl, {message:message});
        modal.substrate.classList.add('show');
        window.modal.watch();

        if (FORWARD) {

            var container = app.modal.querySelector('.j-group_chat__dialog_list');
            container.addEventListener('scroll', function loadMoreDialogs() {
                var position = container.scrollHeight - (container.scrollTop + container.offsetHeight);
                if (container.classList.contains('full')) {
                    return false;
                }
                if (position <= 50 && !container.classList.contains('loading')) {
                    dialogModule['getDialogs'](params);
                }
            });

            document.forms.forward_dialog.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!app.checkInternetConnection()) {
                    return false;
                }
                dialogModule.sendForwardedMessage(message);
            });

            dialogModule.initGettingDialogs(userListContainerSelector, null, params).then(function () {
                modal.substrate.classList.add('show');
                window.modal.watch();
            });
        } else {
            userModule.initGettingUsers(userListContainerSelector, null, params).then(function () {
                modal.substrate.classList.add('show');
                window.modal.watch();
            });
        }
    });

    helpers._( document ).on( "click", ".j-create_dialog_link", function( _event, _element ) {
        dialogModule.beforeCreateDialog();
    });

    helpers._( document ).on( "click", ".download", function( _event, _element ) {

        let bloburl = void 0;
        let img = new Image;

        const getResourceName = fetch(app.modal.querySelector('.img_preview').children[0].src)
            .then(response => Promise.all([response.url, response.blob()]))
            .then(([resource, blob]) => {
                bloburl = URL.createObjectURL(blob);
                img.src = bloburl;

                var
                    e    = document.createEvent('MouseEvents'),
                    a    = document.createElement('a')

                a.download = new Date().getTime();
                a.href = window.URL.createObjectURL(blob)
                a.dataset.downloadurl =  [blob.type, a.download, a.href].join(':')
                e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
                a.dispatchEvent(e)

                return resource
            });

        getResourceName.then(res => console.log(res)).catch(err => console.log(err))

        return false;

    });

    helpers._( document ).on( "click", ".j-update_dialog_link", function( _event, _element ) {
        dialogModule.beforeUpdateDialog();
    });


    var isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    var contextmenuEvent = (isIPhone) ? "touchend" : "contextmenu";

    var message__attachments_wtap = function( _event, _element ) {
        app.modal.innerHTML = helpers.fillTemplate('tpl_imgPreview', {
            src : _element.querySelector('img').src,
            id : _element.querySelector('img').dataset.id
        });
        modal.substrate.classList.add('show');
        window.modal.watch();
    };

    //if(!isIPhone) {
        helpers._(document).on("click", ".message__attachments_wtap", message__attachments_wtap);
    //}

    // Timer for long touch detection
    var timerLongTouch;
    // Long touch flag for preventing "normal touch event" trigger when long touch ends
    var longTouch = false;

    if(isIPhone) {
        helpers._(document).on("touchstart", ".message__text_wrap", function (_event, _element) {
            // Prevent default behavior
            _event.preventDefault();
            // Test that the touch is correctly detected
            //alert("touchstart event");
            // Timer for long touch detection
            timerLongTouch = setTimeout(function () {
                // Flag for preventing "normal touch event" trigger when touch ends.
                longTouch = true;
                // Test long touch detection (remove previous alert to test it correctly)
                //alert("long mousedown");
            }, 300);
        });

        helpers._(document).on("touchmove", ".message__text_wrap", function (_event, _element) {
            // Prevent default behavior
            _event.preventDefault();
            // If timerLongTouch is still running, then this is not a long touch
            // (there is a move) so stop the timer
            clearTimeout(timerLongTouch);
            if (longTouch) {
                longTouch = false;
                // Do here stuff linked to longTouch move
            } else {
                // Do here stuff linked to "normal" touch move
            }
        });

        helpers._(document).on("touchend", ".message__text_wrap", function (_event, _element) {

            // If timerLongTouch is still running, then this is not a long touch
            // so stop the timer
            clearTimeout(timerLongTouch);

            if (longTouch) {

                // Prevent default behavior
                _event.preventDefault();

                longTouch = false;

                // Do here stuff linked to long touch end
                // (if different from stuff done on long touch detection)
                var
                    popup = _element.parentElement.parentElement.querySelector('.message-menu'),
                    message__wrap = _element.parentElement.parentElement.parentElement,
                    x = _event.offsetX === undefined ? _event.layerX : _event.offsetX,
                    y = _event.offsetY === undefined ? _event.layerY : _event.offsetY,
                    isYouMessage = _element.classList.contains('you'),
                    isAvatar = _element.parentElement.parentElement.parentElement.querySelector('.message__avatar'),
                    __ = {true: 'left', false: 'right'};
                popup.classList.add('active');
                popup.style[__[isYouMessage]] = 'auto';
                popup.style[__[!isYouMessage]] = ((!isYouMessage) ? x + (isAvatar ? 50 : '') : _element.offsetWidth - x - 10) + 'px';
                if (parseInt(popup.style[__[!isYouMessage]]) < 0) {
                    popup.style[__[!isYouMessage]] = '0px';
                } else if ((message__wrap.offsetWidth - popup.offsetWidth - parseInt(popup.style[__[!isYouMessage]])) < 0) {
                    popup.style[__[!isYouMessage]] = parseInt(popup.style[__[!isYouMessage]]) - popup.offsetWidth + 'px';
                }
                popup.style.top = y + 20 + 'px';
                /*popup.style.top = message__wrap.offsetHeight + 'px';*/
                return false;
                // Do here stuff linked to "normal" touch move

            } else {

                //_element = _element.querySelector(".message__attachments_wtap");
                //message__attachments_wtap(_event, _element);
                return false;

            }
        });

    }else {
        helpers._(document).on(contextmenuEvent, ".message__text_wrap", function (_event, _element) {
            _event.preventDefault();
            var
                popup = _element.parentElement.parentElement.querySelector('.message-menu'),
                message__wrap = _element.parentElement.parentElement.parentElement,
                x = _event.offsetX === undefined ? _event.layerX : _event.offsetX,
                y = _event.offsetY === undefined ? _event.layerY : _event.offsetY,
                isYouMessage = _element.classList.contains('you'),
                isAvatar = _element.parentElement.parentElement.parentElement.querySelector('.message__avatar'),
                __ = {true: 'left', false: 'right'};
            popup.classList.add('active');
            popup.style[__[isYouMessage]] = 'auto';
            popup.style[__[!isYouMessage]] = ((!isYouMessage) ? x + (isAvatar ? 50 : '') : _element.offsetWidth - x - 10) + 'px';
            if (parseInt(popup.style[__[!isYouMessage]]) < 0) {
                popup.style[__[!isYouMessage]] = '0px';
            } else if ((message__wrap.offsetWidth - popup.offsetWidth - parseInt(popup.style[__[!isYouMessage]])) < 0) {
                popup.style[__[!isYouMessage]] = parseInt(popup.style[__[!isYouMessage]]) - popup.offsetWidth + 'px';
            }
            popup.style.top = y + 20 + 'px';
            /*popup.style.top = message__wrap.offsetHeight + 'px';*/
            return false;
        });
    }

    this.substrate.addEventListener('click', function (e) {
        app.modal.innerHTML = "";
        app.modal.style.width = 'auto';
        app.modal.style.height = 'auto';
        modal.substrate.classList.remove('show');
        if(window.router._lastRouteResolved.url === "/dialog/create" ||
            window.router._lastRouteResolved.url.match(/^\/dialog\/[a-zA-Z0-9]{1,30}\/edit$/)!=null) {
            app.backToDialog();
        }
    });

    helpers._( document ).on( "click", ".back_to_dashboard", function( _event, _element ) {
        modal.substrate.click();
        return false;
    });

    helpers._( document ).on( "click", ".back_to_create", function( _event, _element ) {
        dialogModule.beforeCreateDialog();
    });


    window.addEventListener('resize', helpers.debounce(this.watch, 200, false), false);
    window.addEventListener('orientationchange', this.watch, false);
    window.addEventListener('orientationchange', helpers.debounce(this.watch, 200, false), false);


};

// QBconfig was loaded from QBconfig.js file
var modal = new Modal();
