'use strict';

/*
 * Before start chatting you need to follow this steps:
 * 1. Initialize QB SDK ( QB.init() );
 * 2. Create user session (QB.createSession());
 * 3. Connect to the chat in the create session callback (QB.chat.connect());
 * 4. Set listeners;
 */

class QBConnectService {

    constructor(qb) {
        this.qb = _.clone(qb);
    }

}

const qbConnectService = new QBConnectService(QB);
Object.freeze(qbConnectService);

function App(config) {
    this._config = config;
    this.user = null;
    this.token = null;
    this.isDashboardLoaded = false;
    this.room = null;
    // Elements
    this.page = document.querySelector('#page');
    this.modal = document.querySelector('.modal');
    this.sidebar = null;
    this.content = null;
    this.userListConteiner = null;
    this.init(this._config);
    this.loading = true;
}

// Before start working with JS SDK you nead to init it.

App.prototype.init = function (config) {
    // Step 1. QB SDK initialization.
    QB = _.clone(qbConnectService.qb);
    QB.init(config.credentials.appId, config.credentials.authKey, config.credentials.authSecret, config.appConfig);
    console.log('QB version: ', QB.version, ' build number: ', QB.buildNumber, ' sample version: 1.0.0');
};

App.prototype.renderDashboard = function (activeTabName) {
    var self = this,
        renderParams = {
            user: self.user,
            tabName: ''
        };

    if (activeTabName) {
        renderParams.tabName = activeTabName;
    }

    helpers.clearView(app.page);

    document.querySelector('#user-name').innerHTML = this.user.name;

    self.page.innerHTML = helpers.fillTemplate('tpl_dashboardContainer', renderParams);

    /*var logoutBtn = document.querySelector('.j-logout');*/
    loginModule.isLoginPageRendered = false;
    self.isDashboardLoaded = true;
    self.content = document.querySelector('.j-content');
    self.sidebar = document.querySelector('.j-sidebar');

    if(document.documentElement.clientWidth < 880) {
        document.querySelector('.sidebar').style.position = "static";
        document.querySelector('.sidebar').style.flex = '1 0 100%';
    }

    dialogModule.init();

    self.loadWelcomeTpl();

    listeners.setListeners();

    this.tabSelectInit();
};

App.prototype.loadWelcomeTpl = function () {

    document.querySelector('.login__logo').classList.remove("show");

    var content = document.querySelector('.j-content'),
        welcomeTpl = helpers.fillTemplate('tpl_welcome');

    helpers.clearView(content);
    content.innerHTML = welcomeTpl;
};

App.prototype.tabSelectInit = function () {
    var self = this,
        tabs = document.querySelectorAll('.j-sidebar__tab_link');

    _.each(tabs, function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            if (!self.checkInternetConnection()) {
                return false;
            }

            var tab = e.currentTarget;
            self.loadChatList().then(function () {
                var activeTab = document.querySelector('.j-sidebar__tab_link.active'),
                    tabType = activeTab.dataset.type,
                    dialogType = dialogModule._cache[dialogModule.dialogId].type === 1 ? 'public' : 'chat',
                    isActiveTab = tabType === dialogType;

                if (isActiveTab && dialogModule._cache[dialogModule.dialogId].type === CONSTANTS.DIALOG_TYPES.CHAT) {
                    dialogModule.renderMessages(dialogModule.dialogId);
                }
            });
        });
    });
};

App.prototype.loadChatList = function () {
    return new Promise(function (resolve, reject) {
        helpers.clearView(dialogModule.dialogsListContainer);
        dialogModule.dialogsListContainer.classList.remove('full');

        dialogModule.loadDialogs().then(function (dialogs) {
            resolve(dialogs);
        }).catch(function (error) {
            reject(error);
        });
    });
};

App.prototype.buildCreateDialogTpl = function () {
    var self = this,
        createDialogTPL = helpers.fillTemplate('tpl_newGroupChat');

    helpers.clearView(app.modal);

    app.modal.innerHTML = createDialogTPL;

   /* var backToDialog = self.modal.querySelector('.j-back_to_dialog');
    backToDialog.addEventListener('click', self.backToDialog.bind(self));*/

    self.userListConteiner = self.modal.querySelector('.j-group_chat__user_list');

    document.forms.create_dialog.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!self.checkInternetConnection()) {
            return false;
        }

        if (document.forms.create_dialog.create_dialog_submit.disabled) return false;

        document.forms.create_dialog.create_dialog_submit.disabled = true;

        dialogModule.createDialog();
    });

    document.forms.create_dialog.dialog_name.addEventListener('input', function (e) {
        var titleText = document.forms.create_dialog.dialog_name.value,
            sylmbolsCount = titleText.length;
        if (sylmbolsCount > 40) {
            document.forms.create_dialog.dialog_name.value = titleText.slice(0, 40);
        }
    });

    userModule.initGettingUsers().then(function () {
        window.modal.watch();
    });
};

App.prototype.backToDashboard = function (e) {
    router.navigate('/dashboard');
};

App.prototype.backToDialog = function (e) {
    var self = this;
    self.sidebar.classList.add('active');
    if (dialogModule.dialogId) {
        router.navigate('/dialog/' + dialogModule.dialogId);
    } else {
        router.navigate('/dashboard');
    }
};

App.prototype.noInternetMessage = function () {
    var notifications = document.querySelector('.j-notifications');

    if (notifications === null) {
        alert('No internet connection!');
        return false;
    }

    notifications.classList.remove('hidden');
    notifications.innerHTML = helpers.fillTemplate('tpl_lost_connection');
};

App.prototype.checkInternetConnection = function () {
    if (!navigator.onLine) {
        alert('No internet connection!');
        return false;
    }
    return true;
};

// QBconfig was loaded from QBconfig.js file
var app = new App(QBconfig);
