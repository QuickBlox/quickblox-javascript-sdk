'use strict';

function User() {
    this._cache = {};

    this.limit = appConfig.usersPerRequest || 50;
    this.page = 1;

    this.userListConteiner = null;
    this.content = null;
}

User.prototype.initGettingUsers = function () {
    var self = this;
    self.content = document.querySelector('.j-content');
    self.userListConteiner = document.querySelector('.j-group_chat__user_list');

    self.userListConteiner.addEventListener('scroll', function loadMoreUsers(e) {

        if (!navigator.onLine) return false;

        var container = self.userListConteiner,
            position = container.scrollHeight - (container.scrollTop + container.offsetHeight);

        if (container.classList.contains('full')) {
            container.removeEventListener('scroll', loadMoreUsers);
        }

        if (position <= 50 && !container.classList.contains('loading')) {
            self.getUsers();
        }
    });

    self.page = 1;

    self.getUsers();
};

User.prototype.addToCache = function(user) {
    var self = this,
        id = user.id;

    if (!self._cache[id]) {
        self._cache[id] = {
            name: user.full_name || user.login || 'Unknown user (' + id + ')',
            id: id,
            color: _.random(1, 10),
            last_request_at: user.last_request_at
        };
    } else {
        self._cache[id].last_request_at = user.last_request_at;
    }

    return self._cache[id];
};

User.prototype.getUsersByIds = function (userList) {
    var self = this,
        params = {
            filter: {
                field: 'id',
                param: 'in',
                value: userList
            },
            per_page: 100
        };
    return new Promise(function(resolve, reject) {
        QB.users.listUsers(params, function (err, responce) {
            if (err) {
                reject(err);
            } else {
                var users = responce.items;

                _.each(userList, function (id) {
                    var user = users.find(function (item) {
                        return item.user.id === id;
                    });
                    self.addToCache(user.user);
                });
                resolve();
            }
        });
    });
};

User.prototype.getUsers = function () {
    var self = this,
        params = {
            page: self.page,
            per_page: self.limit,
            tags: app.user.user_tags
        };

    self.userListConteiner.classList.add('loading');

    QB.users.get(params, function (err, responce) {
        if (err) {
            console.error(err);
            return false;
        }
        
        var users = responce.items;
        
        self.page = ++responce.current_page;
        
        _.each(users, function (data) {
            var user = data.user;

            self.addToCache(user);

            if (user.id !== app.user.id) {
                self.buildUserItem(self._cache[user.id]);
            }
        });

        if (users.length < self.limit) {
            self.userListConteiner.classList.add('full');
        }

        self.userListConteiner.classList.remove('loading');
    });
};

User.prototype.buildUserItem = function (user) {
    var self = this,
        userTpl = helpers.fillTemplate('tpl_newGroupChatUser', {user: user}),
        elem = helpers.toHtml(userTpl)[0];
    
    elem.addEventListener('click', function () {
        elem.classList.toggle('selected');
        
        if (self.userListConteiner.querySelectorAll('.selected').length > 0) {
            document.forms.create_dialog.create_dialog_submit.disabled = false;
        } else {
            document.forms.create_dialog.create_dialog_submit.disabled = true;
        }

        if (self.userListConteiner.querySelectorAll('.selected').length >= 2) {
            document.forms.create_dialog.dialog_name.disabled = false;
        } else {
            document.forms.create_dialog.dialog_name.disabled = true;
        }
    });
    
    self.userListConteiner.appendChild(elem);
};

var userModule = new User();
