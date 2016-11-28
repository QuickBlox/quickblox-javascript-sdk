'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Users Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils'),
    util = require('util');

var DATE_FIELDS = ['created_at', 'updated_at', 'last_request_at'];
var NUMBER_FIELDS = ['id', 'external_user_id'];

var resetPasswordUrl = config.urls.users + '/password/reset';

function UsersProxy(service) {
  this.service = service;
}

UsersProxy.prototype = {

  listUsers: function(params, callback) {
    Utils.QBLog('[UsersProxy]', 'listUsers', arguments.length > 1 ? params : "");

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

    this.service.ajax({url: Utils.getUrl(config.urls.users), data: message}, callback);
  },

  // params is required object!!! If you want to get users without any parameters, set empty object as the parameter.
  get: function(params, callback) {
    Utils.QBLog('[UsersProxy]', 'get', params);

    var url;

    if (typeof params === 'number') {
      url = params;
      params = {};
    } else {
      if (params.login) {
        url = 'by_login';
      } else if (params.full_name) {
        url = 'by_full_name';
      } else if (params.facebook_id) {
        url = 'by_facebook_id';
      } else if (params.twitter_id) {
        url = 'by_twitter_id';
      } else if (params.email) {
        url = 'by_email';
      } else if (params.tags) {
        url = 'by_tags';
      } else if (params.external) {
        url = 'external/' + params.external;
        params = {};
      }
    }

    this.service.ajax({url: Utils.getUrl(config.urls.users, url), data: params},
                      function(err, res) {
                        if (err) { callback(err, null); }
                        else { callback(null, res.user || res); }
                      });
  },

  create: function(params, callback) {
    Utils.QBLog('[UsersProxy]', 'create', params);

    this.service.ajax({url: Utils.getUrl(config.urls.users), type: 'POST', data: {user: params}},
                      function(err, res) {
                        if (err) { callback(err, null); }
                        else { callback(null, res.user); }
                      });
  },

  update: function(id, params, callback) {
    Utils.QBLog('[UsersProxy]', 'update', id, params);

    this.service.ajax({url: Utils.getUrl(config.urls.users, id), type: 'PUT', data: {user: params}},
                      function(err, res) {
                        if (err) { callback(err, null); }
                        else { callback(null, res.user); }
                      });
  },

  delete: function(params, callback) {
    Utils.QBLog('[UsersProxy]', 'delete', params);

    var url;

    if (typeof params === 'number') {
      url = params;
    } else {
      if (params.external) {
        url = 'external/' + params.external;
      }
    }

    this.service.ajax({url: Utils.getUrl(config.urls.users, url), type: 'DELETE', dataType: 'text'}, callback);
  },

  resetPassword: function(email, callback) {
    Utils.QBLog('[UsersProxy]', 'resetPassword', email);

    this.service.ajax({url: Utils.getUrl(resetPasswordUrl), data: {email: email}}, callback);
  }

};

module.exports = UsersProxy;

/* Private
---------------------------------------------------------------------- */
function generateFilter(obj) {
  var type = obj.field in DATE_FIELDS ? 'date' : typeof obj.value;

  if (obj.value instanceof Array || util.isArray(obj.value)) {
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
