'use strict';

function User() {
    this._cache = {};
    this.selectedUserIds = [];

    this.userListConteiner = null;
    this.content = null;
    this.userListFilter = null;
    this.disabledUserIds = [];
    this._isFetching = false;

    var self = this;
    var fullName = '';
    var currentPage = 1;
    var totalPages = 1;
    var timeout;

    function getUsersFilteredByName () {
        helpers.clearView(self.userListConteiner);
        self.getUsers({ page: 1 });
    };

    /**
     * @typedef GetUsersParam
     * @type {object}
     * @property {string} full_name name of user to search by
     * @property {string} order see [API docs]{@link https://quickblox.com/developers/Users#Sort} for more info on order format
     * @property {number} page number of page to show
     * @property {number} per_page limit of items to show per page
     */
    /**
     * Gets users from API
     * @param {GetUsersParam} args
     * @returns {Promise} promise resolved with list of users or rejected with error
     */
    var _getUsers = function (args) {
        if (typeof args !== 'object') {
            args = {}
        }
        var params = {
            filter: {
                field: 'full_name',
                param: 'in',
                value: [args.full_name || fullName]
            },
            order: args.order || {
                field: 'updated_at',
                sort: 'desc'
            },
            page: args.page || currentPage,
            per_page: args.per_page || 100
        };
    
        return new Promise(function (resolve, reject) {
            self._isFetching = true;
            QB.users.listUsers(params, function (err, responce) {
                if (err) {
                    self._isFetching = false;
                    return reject(err);
                }
                currentPage = responce.current_page;
                totalPages = Math.ceil(responce.total_entries / responce.per_page);
                var userList = responce.items.map(function(data){
                    return self.addToCache(data.user);
                });
    
                self._isFetching = false;
                resolve(userList);
            });
        });
    };

    /**
     * Toggles loading state for users list element, load users and append results to the list of users
     * @param {GetUsersParam} args search / filter criteria
     * @param {boolean} [renderUsers=true] wheter to render fetched users (`true` by default)
     */
    this.getUsers = function (args, renderUsers) {
        var usersListEl = self.userListConteiner;
        usersListEl && usersListEl.classList.add('loading');
        return new Promise(function (resolve, reject) {
            _getUsers.call(self, args)
                .then(function (users) {
                    if (renderUsers !== false) {
                        users.forEach(function (user) {
                            self.buildUserItem(self._cache[user.id]);
                        });
                    }
                    usersListEl && usersListEl.classList.remove('loading');
                    resolve(users);
                })
                .catch(function (err) {
                    usersListEl && usersListEl.classList.remove('loading');
                    reject(err);
                });
        })
    };

    this.filter = function eventHandler (e) {
        fullName = e.target.value;
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(getUsersFilteredByName, 600);
    };

    this.scrollHandler = function (e) {
        var item = e.target.children.length
            ? e.target.children[0]
            : undefined;
        var itemHeight = item ? item.getBoundingClientRect().height : 0;
        var isFetching = self._isFetching;
        var scrolledToEnd = (
            e.target.clientHeight + e.target.scrollTop >= e.target.scrollHeight - itemHeight
        );
        var shouldLoadNextPage = scrolledToEnd && !isFetching;
        var notLastPage = currentPage < totalPages;
        if (shouldLoadNextPage && notLastPage) {
            self.getUsers({ page: currentPage + 1 });
        }
    };

    this.reset = function () {
        currentPage = 1;
        fullName = '';
        self.selectedUserIds = [];
        self.disabledUserIds = [];
        self._isFetching = false;
        self.userListContainer = null;
        self.userListFilter = null;
    }
}

/**
 * @param {string | HTMLElement} userListContainer HTMLElement or selector string (optional)
 * @param {string | HTMLElement} userListFilter HTMLElement or selector string (optional)
 */
User.prototype.initGettingUsers = function (userListContainer, userListFilter) {
    var userListSelector = '.j-group_chat__user_list';
    var userListFilterSelector = '.group_chat__filter > input';
    if (userListContainer) {
        if (userListContainer instanceof HTMLElement) {
            this.userListConteiner = userListContainer;
        } else {
            if (typeof userListContainer === 'string') {
                userListSelector = userListContainer;
            }
            this.userListConteiner = document.querySelector(userListSelector);
        }
    } else {
        this.userListConteiner = document.querySelector(userListSelector);
    }
    if (userListFilter) {
        if (userListFilter instanceof HTMLElement) {
            this.userListFilter = userListFilter;
        } else {
            if (typeof userListFilter === 'string') {
                userListFilterSelector = userListFilter;
            }
            this.userListFilter = document.querySelector(userListFilterSelector)
        }
    } else {
        this.userListFilter = document.querySelector(userListFilterSelector);
    }

    this.userListConteiner &&
    this.userListConteiner.addEventListener('scroll', this.scrollHandler);

    this.userListFilter &&
    this.userListFilter.addEventListener('input', this.filter);

    return this.getUsers();
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
    }else if(self._cache[id].name !== user.full_name ){
        self._cache[id].name = user.full_name;
    }

    self._cache[id].last_request_at = user.last_request_at;
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
        self._isFetching = true;
        QB.users.listUsers(params, function (err, responce) {
            if (err) {
                self._isFetching = false;
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
                self._isFetching = false;
                resolve();
            }
        });
    });
};

User.prototype.buildUserItem = function (user) {
    var self = this,
        userItem = JSON.parse(JSON.stringify(user));

    if (userItem.id === app.user.id) {
        userItem.selected = true;
    }

    if (this.disabledUserIds.indexOf(userItem.id) > -1) {
        userItem.selected = true;
    }

    var userTpl = helpers.fillTemplate('tpl_newGroupChatUser', {user: userItem}),
        elem = helpers.toHtml(userTpl)[0];

    if (this.selectedUserIds.indexOf(userItem.id) > -1) {
        elem.classList.add('selected');
    }
    
    elem.addEventListener('click', function () {
        if (elem.classList.contains('disabled')) return;
        var userId = +elem.getAttribute('id');
        var index = self.selectedUserIds.indexOf(userId);
        elem.classList.toggle('selected');
        if (index > -1) {
            self.selectedUserIds.splice(index, 1);
        } else {
            self.selectedUserIds.push(userId);
        }
        
        if (document.forms.create_dialog) {
            if (self.selectedUserIds.length) {
                document.forms.create_dialog.create_dialog_submit.disabled = false;
            } else {
                document.forms.create_dialog.create_dialog_submit.disabled = true;
            }

            if (self.selectedUserIds.length >= 2) {
                document.forms.create_dialog.dialog_name.disabled = false;
            } else {
                document.forms.create_dialog.dialog_name.disabled = true;
            }
        }
    });
    
    self.userListConteiner.appendChild(elem);
};

var userModule = new User();
