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
        self.getUsers({ page: 1 }).catch(function (error) {

            if(error.code === 404){
                self.userListConteiner.innerHTML = "<div id='no-user'>No user with that name</div>";
            }

        })
    }

    this.create = function(user) {
        return new Promise(function (resolve, reject) {
            QB.users.create(user, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    };

    this.update = function(id, user) {
        return new Promise(function (resolve, reject) {
            QB.users.update(id, user, function(error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    };

    /**
     * @typedef GetUsersParam
     * @type {object}
     * @property {boolean} selected
     * @property {object} filter
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
            filter: args.filter || {
                field: 'full_name',
                param: 'in',
                type: 'string',
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

            var colback = function (err, responce) {
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
            };

            if(params.filter.field === 'full_name' && params.filter.value[0].length > 1) {
                params = {
                    'full_name': (args.full_name || fullName),
                    'order': params.order,
                    'page': params.page,
                    'per_page': params.per_page
                };
                QB.users.get(params, colback);
            }else {
                QB.users.listUsers(params, colback);
            }
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
                            if(args !== undefined && args.selected !== undefined) {
                                self.buildUserItem(Object.assign({selected:args.selected}, self._cache[user.id]));
                            }else{
                                self.buildUserItem(self._cache[user.id]);
                            }
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
 *
 * @param {string | HTMLElement} userListConteiner HTMLElement or selector string (optional)
 * @param {string | HTMLElement} userListFilter HTMLElement or selector string (optional)
 * @param params
 * @returns {Promise<unknown>}
 */
User.prototype.initGettingUsers = function (userListConteiner, userListFilter, params) {
    var
        self = this,
        elements = {
            userListConteiner: {
                selector: '.j-group_chat__user_list',
                element: userListConteiner
            },
            userListFilter: {
                selector: '.input-group-search input',
                element: userListFilter
            }
        };

    Object.keys(elements).forEach(function (key) {
        if (elements[key].element) {
            if (elements[key] instanceof HTMLElement) {
                self[key] = elements[key].element;
            } else {
                if (typeof elements[key].element === 'string') {
                    elements[key].selector = elements[key].element;
                }
                self[key] = document.querySelector(elements[key].selector);
            }
        } else {
            self[key] = document.querySelector(elements[key].selector);
        }
    });

    this.userListConteiner &&
    this.userListConteiner.addEventListener('scroll', this.scrollHandler);

    this.userListFilter &&
    this.userListFilter.addEventListener('input', this.filter);

    return this.getUsers(params);
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

    if (user.selected !== undefined) {
        userItem.selected = user.selected;
        user.event = { click: false };
    }

    var userTpl = helpers.fillTemplate('tpl_newGroupChatUser', {user: userItem}),
        elem = helpers.toHtml(userTpl)[0];

    if (this.selectedUserIds.indexOf(userItem.id) > -1) {
        elem.classList.add('selected');
    }

    if (user.event === undefined || user.event.click) {
        elem.addEventListener('click', function () {
            if (elem.classList.contains('disabled')) return;
            var userId = +elem.getAttribute('id');
            var index = self.selectedUserIds.indexOf(userId);

            if (elem.classList.contains('selected')) {
                elem.classList.remove('selected');
                elem.querySelector('input').checked = false;
                elem.querySelector('input').removeAttribute("checked");
            }else{
                elem.classList.add('selected');
                elem.querySelector('input').setAttribute("checked","checked");
                elem.querySelector('input').checked = true;
            }

            if (index > -1) {
                self.selectedUserIds.splice(index, 1);
            } else {
                self.selectedUserIds.push(userId);
            }

            if(document.querySelector('#selectedUserIds')) {
                document.querySelector('#selectedUserIds').innerHTML = self.selectedUserIds.length === 1 ?
                    self.selectedUserIds.length + ' user selected' :
                    self.selectedUserIds.length + ' users selected';
            }

            if (document.forms.create_dialog) {
                if (self.selectedUserIds.length) {
                    document.querySelector('.j-create_dialog .j-create_dialog_link').classList.remove('disabled');
                    document.forms.create_dialog.create_dialog_submit.disabled = false;
                } else {
                    document.querySelector('.j-create_dialog .j-create_dialog_link').classList.add('disabled');
                    document.forms.create_dialog.create_dialog_submit.disabled = true;
                }

                document.forms.create_dialog.dialog_name.disabled = self.selectedUserIds.length < 2;
            }
            return false;

        });
    }

    
    self.userListConteiner.appendChild(elem);
};

var userModule = new User();
