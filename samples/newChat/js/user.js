'use strict';

function User() {
    this._cache = {};

    this.limit = appConfig.usersPerRequest || 50;
    this.page = null;

    this.userListConteiner = null;
    this.content = null;
}

User.prototype.getUsersByIds = function(userList, callback){
    var self = this,
        params = {
        filter: {
            field: 'id',
            param: 'in',
            value: userList
        },
        per_page: 100
    };

    QB.users.listUsers(params, function(err, responce){
        if(err) {
            callback(err);
        } else {
            var users = responce.items;

            _.each(userList, function(id){
                var user = users.find(function(item){
                    return item.user.id === id;
                });

                if(!self._cache[id]){
                    if(user){
                        self._cache[id] = {
                            name: user.user.login,
                            color: _.random(1, 10)
                        };
                    } else {
                        self._cache[id] = {
                            name: 'Unknown user (' + id + ')',
                            color: _.random(1, 10)
                        };
                    }
                }
            });
            callback(null, true);
        }
    });
};

User.prototype.initGettingUsers = function(){
    var self = this;
    self.content = document.querySelector('.j-content');
    self.userListConteiner = document.querySelector('.j-group_chat__user_list');

    self.userListConteiner.addEventListener('scroll', function loadMoreUsers(e){
        var container = self.userListConteiner,
            position = container.scrollHeight - (container.scrollTop + container.offsetHeight);
        console.log('scroll');
        if(container.classList.contains('full')){
            container.removeEventListener('scroll', loadMoreUsers);
        }

        if(position <= 50 && !container.classList.contains('loading')) {
            self.getUsers();
        }
    });
    self.page = null;

    self.getUsers();
};

User.prototype.getUsers = function(){
    var self = this,
        params = {
            page: self.page,
            per_page: self.limit
        };

    self.userListConteiner.classList.add('loading');

    QB.users.listUsers(params, function(err, responce){
        
        if(err){
            console.error(err);
            return false;
        }
        
        var users = responce.items;
        
        self.page = ++responce.current_page;
        
        _.each(users, function(data){
            var user = data.user;

            if(self._cache[user.id]){
                self._cache[user.id].last_request_at = user.last_request_at;
            } else {
                self._cache[user.id] = {
                    name: user.full_name || user.login,
                    id: user.id,
                    last_request_at: user.last_request_at,
                    color: _.random(1, 10)
                };
            }

            if(user.id !== app.user.id){
                self.buildUserItem(self._cache[user.id]);
            }
        });

        if(users.length < self.limit){
            self.userListConteiner.classList.add('full');
        }
        self.userListConteiner.classList.remove('loading');
    });
};


User.prototype.buildUserItem = function(user){
    var self = this,
        userTpl = helpers.fillTemplate('tpl_newGroupChatUser', {user: user}),
        elem = helpers.toHtml(userTpl)[0];
    
    elem.addEventListener('click', function(){
        elem.classList.toggle('selected');
        
        if(self.userListConteiner.querySelectorAll('.selected').length > 0){
            self.content.querySelector('.j-create_dialog_btn').removeAttribute('disabled');
        } else {
            self.content.querySelector('.j-create_dialog_btn').setAttribute('disabled', true);
        }
    });
    
    self.userListConteiner.appendChild(elem);
};

User.prototype.initLoadMoreUsers = function(remove){
    var self = this,
        btn = self.content.querySelector('.j-load_more__btn');
    
    if(!remove){
        if(!btn) {
            var tpl = helpers.fillTemplate('tpl_loadMore'),
                btnWrap = helpers.toHtml(tpl)[0];
            
            btn = btnWrap.firstElementChild;
            
            self.userListConteiner.appendChild(btnWrap);
            
            btn.addEventListener('click', function(){
                btn.innerText = 'Loading...';
                self.getUsers();
            });
            
            self.userListConteiner.appendChild(btnWrap);
            
        } else {
            btn.innerText = 'Load more';
            self.userListConteiner.appendChild(btn.parentElement);
        }
    } else if(btn) {
        self.userListConteiner.removeChild(btn.parentElement);
    }
};

var userModule = new User();
