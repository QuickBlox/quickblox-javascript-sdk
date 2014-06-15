/*
 * QuickBlox JavaScript SDK
 *
 * Users Module
 *
 */

// Browserify exports and dependencies
module.exports = UsersProxy;
var config = require('../qbConfig');
var Utils = require('../qbUtils');

var DATE_FIELDS = ['created_at', 'updated_at', 'last_request_at'];
var NUMBER_FIELDS = ['id', 'external_user_id'];

function UsersProxy(service) {
  this.service = service;
}

UsersProxy.prototype.listUsers = function(params, callback) {
  var message = {}, filters = [], item;
  
  if (typeof params === 'function' && typeof callback === 'undefined') {
    callback = params;
    params = {};
  }
  
  if (params.filter) {
    if (params.filter instanceof Array) {
      params.filter.forEach(function(el) {
        item = generateFilter(el);
        filters.push(item);
      });
    } else {
      item = generateFilter(params.filter);
      filters.push(item);
    }
    message.filter = filters;
  }
  if (params.order) {
    message.order = generateOrder(params.order);
  }
  if (params.page) {
    message.page = params.page;
  }
  if (params.per_page) {
    message.per_page = params.per_page;
  }
  
  if (config.debug) { console.log('UsersProxy.list', message); }
  this.service.ajax({url: Utils.getUrl(config.urls.users), data: message}, callback);
};

UsersProxy.prototype.get = function(params, callback) {
  var url;
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
                    function(err,res){
                      var user;
                      if (res && res.user) {
                        user = res.user;
                      }
                      if (config.debug) { console.log('UserProxy.get', user); }
                        callback(err,user);
                    });
};

UsersProxy.prototype.create = function(params, callback) {
  if (config.debug) { console.log('UsersProxy.create', params); }
  this.service.ajax({url: Utils.getUrl(config.urls.users), type: 'POST', data: {user: params}}, 
                    function(err, res) {
                      if (err) { callback(err, null); }
                      else { callback(null, res.user); }
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
                    function(err,res){
                      if (err) {callback(err, null);}
                      else { 
                        console.log (res.user);
                        callback (null, res.user);
                      }
                    });
};

UsersProxy.prototype.delete = function(id, callback) {
  if (config.debug) { console.log('UsersProxy.delete', id); }
  this.service.ajax({url: Utils.getUrl(config.urls.users, id), type: 'DELETE', dataType: 'text' },
                    function(err,res){
                      if (err) { callback(err, null);}
                      else { callback(null, true); }
                     });
};


/* Private
---------------------------------------------------------------------- */
function generateFilter(obj) {
  var type = obj.field in DATE_FIELDS ? 'date' : typeof obj.value;
  
  if (obj.value instanceof Array) {
    if (type == 'object') {
      type = typeof obj.value[0];
    }
    obj.value = obj.value.toString();
  }
  
  return [type, obj.field, obj.param, obj.value].join(' ');
}

function generateOrder(obj) {
  var type = obj.field in DATE_FIELDS ? 'date' : obj.field in NUMBER_FIELDS ? 'number' : 'string';
  return [obj.sort, type, obj.field].join(' ');
}
