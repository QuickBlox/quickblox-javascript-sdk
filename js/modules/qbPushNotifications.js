/*
 * QuickBlox JavaScript SDK
 *
 * Push Notifications Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

function PushNotificationsProxy(service) {
  this.service = service;
  this.subscriptions = new SubscriptionsProxy(service);
  this.events = new EventsProxy(service);

  this.base64Encode = function(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  }

}

// Subscriptions

function SubscriptionsProxy(service){
  this.service = service;
}

SubscriptionsProxy.prototype = {

  create: function(params, callback) {
    Utils.QBLog('[SubscriptionsProxy]', 'create', params);

    this.service.ajax({url: Utils.getUrl(config.urls.subscriptions), type: 'POST', data: params}, callback);
  },

  list: function(callback) {
    Utils.QBLog('[SubscriptionsProxy]', 'list');

    this.service.ajax({url: Utils.getUrl(config.urls.subscriptions)}, callback);
  },

  delete: function(id, callback) {
    Utils.QBLog('[SubscriptionsProxy]', 'delete', id);

    this.service.ajax({url: Utils.getUrl(config.urls.subscriptions, id), type: 'DELETE', dataType:'text'},
                      function(err, res){
                        if (err) { callback(err, null);}
                        else { callback(null, true);}
                      });
  }

};

// Events
function EventsProxy(service){
  this.service = service;
}

EventsProxy.prototype = {

  create: function(params, callback) {
    Utils.QBLog('[EventsProxy]', 'create', params);

    var message = {event: params};
    this.service.ajax({url: Utils.getUrl(config.urls.events), type: 'POST', data: message}, callback);
  },

  list: function(params, callback) {
    if (typeof params === 'function' && typeof callback ==='undefined') {
      callback = params;
      params = null;
    }
    
    Utils.QBLog('[EventsProxy]', 'list', params);

    this.service.ajax({url: Utils.getUrl(config.urls.events), data: params}, callback);
  },

  get: function(id, callback) {
    Utils.QBLog('[EventsProxy]', 'get', id);

    this.service.ajax({url: Utils.getUrl(config.urls.events, id)}, callback);
  },

  status: function(id, callback) {
    Utils.QBLog('[EventsProxy]', 'status', id);

    this.service.ajax({url: Utils.getUrl(config.urls.events, id + '/status')}, callback);
  },

  delete: function(id, callback) {
    Utils.QBLog('[EventsProxy]', 'delete', id);

    this.service.ajax({url: Utils.getUrl(config.urls.events, id), type: 'DELETE'}, callback);
  }

};

module.exports = PushNotificationsProxy;
