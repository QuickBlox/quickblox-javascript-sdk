'use strict';

function User() {
    this._cache = {};

    this.userListConteiner = null;
    this.content = null;
}

User.prototype.initGettingUsers = function () {
    var self = this;
    self.content = document.querySelector('.j-content');
    self.userListConteiner = document.querySelector('.j-group_chat__user_list');

    self.userListConteiner.classList.add('loading');

    self.getUsers().then(function(userList){
        _.each(userList, function(user){
            self.buildUserItem(self._cache[user.id]);
        });
        self.userListConteiner.classList.remove('loading');
    }).catch(function(error){
        self.userListConteiner.classList.remove('loading');
    });
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

                    if(user !== undefined) {
                        self.addToCache(user.user);
                    }
                });
                resolve();
            }
        });
    });
};

User.prototype.getUsers = function () {
    var self = this,
        params = {
            tags: app.user.user_tags,
            per_page: 100
        };

    return new Promise(function(resolve, reject){
        QB.users.get(params, function (err, responce) {
            if (err) {
                reject(err);
            }

            var userList = responce.items.map(function(data){
                return self.addToCache(data.user);
            });

            resolve(userList);
        });
    })
};

User.prototype.buildUserItem = function (user) {
    var self = this,
        userItem = JSON.parse(JSON.stringify(user));

    if(userItem.id === app.user.id){
        userItem.selected = true;
    }

    var userTpl = helpers.fillTemplate('tpl_newGroupChatUser', {user: userItem}),
        elem = helpers.toHtml(userTpl)[0];
    
    elem.addEventListener('click', function () {
        if (elem.classList.contains('disabled')) return;

        elem.classList.toggle('selected');
        
        if (self.userListConteiner.querySelectorAll('.selected').length > 1) {
            document.forms.create_dialog.create_dialog_submit.disabled = false;
        } else {
            document.forms.create_dialog.create_dialog_submit.disabled = true;
        }

        if (self.userListConteiner.querySelectorAll('.selected').length >= 3) {
            document.forms.create_dialog.dialog_name.disabled = false;
        } else {
            document.forms.create_dialog.dialog_name.disabled = true;
        }
    });
    
    self.userListConteiner.appendChild(elem);
};

var userModule = new User();
