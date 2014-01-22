/*
 * QuickBlox JavaScript SDK
 *
 * Users Resource Module
 *
 */

// Browserify exports and dependencies
module.exports = UsersProxy;
var config = require('./qbConfig');
var Proxy = require('./qbProxy');

var baseUrl = config.urls.base+ config.urls.users;

function UsersProxy(service) {
  this.service = service;
}

UsersProxy.prototype.listUsers = function(params, callback){
  var _this = this, url, message = {}, filter;
  url = config.urls.base + config.urls.users + config.urls.type;
  if (typeof params === 'function') {
    callback = params;
    params = undefined;
  }
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
  if (config.debug) {console.debug('UsersProxy.list', message);}
  this.service.ajax({url: url, data: message}, callback);
};

UsersProxy.prototype.create = function(params, callback){
  var url = baseUrl + config.urls.type;
  if (config.debug) { console.debug('UsersProxy.create', params);}
  this.service.ajax({url: url, type: 'POST', data: {user: params}}, 
                    function(err, data){
                      if (err) { callback(err, null);}
                      else { callback(null, data.user); }
                    });
};

UsersProxy.prototype.delete = function(id, callback){
  var url = baseUrl + '/' + id + config.urls.type;
  if (config.debug) { console.debug('UsersProxy.delete', url); }
  this.service.ajax({url: url, type: 'DELETE', dataType: 'text' },
                    function(err,data){
                      if (err) { callback(err, null);}
                      else { callback(null, true); }
                     });
};

UsersProxy.prototype.update = function(user, callback){
  var allowedProps = ['login', 'blob_id', 'email', 'external_user_id', 'facebook_id', 'twitter_id', 'full_name',
      'phone', 'website', 'tag_list', 'password', 'old_password'];
  var url = baseUrl + '/' + user.id + config.urls.type, msg = {}, prop;
  for (prop in user) {
    if (user.hasOwnProperty(prop)) {
      if (allowedProps.indexOf(prop)>0) {
        msg[prop] = user[prop];
      } 
    }
  }
  if (config.debug) { console.debug('UsersProxy.update', url, user); }
  this.service.ajax({url: url, type: 'PUT', data: {user: msg}}, 
                    function(err,data){
                      if (err) {callback(err, null);}
                      else { 
                        console.debug (data.user);
                        callback (null, data.user);
                      }
                    });
};

UsersProxy.prototype.get = function(params, callback){
  var _this = this, url = baseUrl;
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  if (typeof params === 'number'){
    url += '/' + params + config.urls.type;
  } else if (typeof params === 'object') {
    if (params.id) {
      url += '/' + params + config.urls.type;
    } else if (params.facebookId) {
      url += '/by_facebook_id' + config.urls.type + '?facebook_id=' + params.facebookId;
    } else if (params.login) {
      url += '/by_login' + config.urls.type + '?login=' + params.login;
    } else if (params.fullName) {
      url += '/by_full_name' + config.urls.type + '?full_name=' + params.fullName;
    } else if (params.twitterId) {
      url += '/by_twitter_id' + config.urls.type + '?twitter_id=' + params.twitterId;
    } else if (params.email) {
      url += '/by_email' + config.urls.type + '?email=' + params.email;
    } else if (params.tags) {
      url += '/by_tags' + config.urls.type + '?tag=' + params.tags;
    }
  }
  if (config.debug) {console.debug('UsersProxy.get', url);}
  this.service.ajax({url:url},
                    function(err,data){
                      var user;
                      if (data && data.user) {
                        user = data.user;
                      }
                      if (config.debug) { console.debug('UserProxy.get', user); }
                        callback(err,user);
                    });
}
