/*
 * QuickBlox JavaScript SDK
 *
 * Users Resource Module
 *
 */

// Browserify exports and dependencies
module.exports = UsersProxy;
var config = require('../qbConfig');
var Utils = require('../qbUtils');

function UsersProxy(service) {
  this.service = service;
}

UsersProxy.prototype.listUsers = function(params, callback) {
  var _this = this, message = {}, filter;
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
  if (config.debug) {console.log('UsersProxy.list', message);}
  this.service.ajax({url: Utils.getUrl(config.urls.users), data: message}, callback);
};

UsersProxy.prototype.get = function(params, callback) {
  var _this = this, url;
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  if (typeof params === 'number'){
    url = Utils.getUrl(config.urls.users, params);
  } else if (typeof params === 'object') {
    if (params.id) {
      url = Utils.getUrl(config.urls.users, params.id);
    } else if (params.facebookId) {
      url = Utils.getUrl(config.urls.users, '/by_facebook_id') + '?facebook_id=' + params.facebookId;
    } else if (params.login) {
      url = Utils.getUrl(config.urls.users, '/by_login') + '?login=' + params.login;
    } else if (params.fullName) {
      url = Utils.getUrl(config.urls.users, '/by_full_name') + '?full_name=' + params.fullName;
    } else if (params.twitterId) {
      url = Utils.getUrl(config.urls.users, '/by_twitter_id') + '?twitter_id=' + params.twitterId;
    } else if (params.email) {
      url = Utils.getUrl(config.urls.users, '/by_email') + '?email=' + params.email;
    } else if (params.tags) {
      url = Utils.getUrl(config.urls.users, '/by_tags') + '?tag=' + params.tags;
    }
  }
  if (config.debug) {console.log('UsersProxy.get', url);}
  this.service.ajax({url: url},
                    function(err,data){
                      var user;
                      if (data && data.user) {
                        user = data.user;
                      }
                      if (config.debug) { console.log('UserProxy.get', user); }
                        callback(err,user);
                    });
};

UsersProxy.prototype.create = function(params, callback) {
  if (config.debug) { console.log('UsersProxy.create', params);}
  this.service.ajax({url: Utils.getUrl(config.urls.users), type: 'POST', data: {user: params}}, 
                    function(err, data){
                      if (err) { callback(err, null);}
                      else { callback(null, data.user); }
                    });
};

UsersProxy.prototype.update = function(user, callback) {
  var allowedProps = ['login', 'blob_id', 'email', 'external_user_id', 'facebook_id', 'twitter_id', 'full_name',
      'phone', 'website', 'tag_list', 'password', 'old_password'];
  var msg = {}, prop;
  for (prop in user) {
    if (user.hasOwnProperty(prop)) {
      if (allowedProps.indexOf(prop)>0) {
        msg[prop] = user[prop];
      } 
    }
  }
  if (config.debug) { console.log('UsersProxy.update', user); }
  this.service.ajax({url: Utils.getUrl(config.urls.users, user.id), type: 'PUT', data: {user: msg}}, 
                    function(err,data){
                      if (err) {callback(err, null);}
                      else { 
                        console.log (data.user);
                        callback (null, data.user);
                      }
                    });
};

UsersProxy.prototype.delete = function(id, callback) {
  if (config.debug) { console.log('UsersProxy.delete', id); }
  this.service.ajax({url: Utils.getUrl(config.urls.users, id), type: 'DELETE', dataType: 'text' },
                    function(err,data){
                      if (err) { callback(err, null);}
                      else { callback(null, true); }
                     });
};
