/*
 * QuickBlox JavaScript SDK
 *
 * Users resource module
 *
 */

// Browserify exports and dependencies
module.exports = UsersProxy;
var Proxy = require('./qbProxy');

function UsersProxy(qb) {
  this.config = qb.config;
  this.urls = qb.urls;
  this.session = qb.session;
  this.service = new Proxy(qb);
}

UsersProxy.prototype.listUsers = function(params, callback){
  var _this = this, url, message = {}, filter;
  if (typeof params === 'function') {
    callback = params;
    params = undefined;
  }
  url = this.urls.base + this.urls.users + this.urls.type;
  if (params && params.filter) {
    switch (params.filter.type){
      case 'id':
        filter = 'number id in';
        break;
      case 'email':
        filter = 'string email in';
        break;
      case 'login':
        filter = 'string login in';
        break;
      case 'facebook_id':
        filter = 'number facebook_id in';
        break;
      case 'twitter_id':
        filter = 'number twitter_id in';
        break;
      case 'phone':
        filter = 'string phone in';
        break;
    }
    filter = filter + ' ' + params.filter.value;
    message['filter[]'] = filter;
  }
  if (params && params.perPage) { message.per_page = params.perPage;}
  if (params && params.pageNo) {message.page = params.pageNo;}
  if (this.config.debug) {console.debug('Retrieve users using', message);}
  this.service.ajax({url: url, data: message}, callback);
};

UsersProxy.prototype.create = function(params, callback){
  var url = this.urls.base + this.urls.users + this.urls.type;
  if (this.config.debug) { console.debug('UsersProxy.create', params);}
  this.service.ajax({url: url, type: 'POST', data: {user: params}}, function(err, data){
          if (err) { callback(err, null);}
          else { callback(null, data.user); }
  });
};

UsersProxy.prototype.delete = function(id, callback){
  var url = this.urls.base + this.urls.users + '/' + id + this.urls.type;
  if (this.config.debug) { console.debug('UsersProxy.delete', url); }
  this.service.ajax({url: url, type: 'DELETE', data: {}}, callback);
};

UsersProxy.prototype.update = function(user, callback){
  var url = this.urls.base + this.urls.users + '/' + user.id + this.urls.type;
  if (this.config.debug) { console.debug('UsersProxy.update', url, user); }
  this.service.ajax({url: url, type: 'PUT', data: {user: user}}, callback);
};

UsersProxy.prototype.get = function(params, callback){
  var _this = this, url = this.urls.base + this.urls.users;
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  if (typeof params === 'number'){
    url += '/' + params;
  } else if (typeof params === 'object') {
    if (params.id) {
      url += '/' + params + this.urls.type;
    } else if (params.facebookId) {
      url += '/by_facebook_id' + this.urls.type + '?facebook_id=' + params.facebook_id;
    } else if (params.login) {
      url += '/by_login' + this.urls.type + '?login=' + params.login;
    } else if (params.fullName) {
      url += '/by_full_name' + this.urls.type + '?full_name=' + params.full_mame;
    } else if (params.twitterId) {
      url += '/by_twitter_id' + this.urls.type + '?twitter_id=' + params.twitter_id;
    } else if (params.email) {
      url += '/by_email' + this.urls.type + '?email=' + params.email;
    } else if (params.tags) {
      url += '/by_tags' + this.urls.type + '?tag=' + params.tags;
    }
  }
  if (this.config.debug) {console.debug('Get users using', url);}
  this.service.ajax({url:url}, function(err,data){
                    var user;
                    if (data.user) {
                      user = data.user;
                    }
                    if (_this.config.debug) { console.debug('UserProxy.get', user); }
                      callback(err,user);
                    });
} 
