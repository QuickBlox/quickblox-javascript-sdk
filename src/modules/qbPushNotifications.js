'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Push Notifications Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var isBrowser = typeof window !== "undefined";

function PushNotificationsProxy(service) {
  this.service = service;
  this.subscriptions = new SubscriptionsProxy(service);
  this.events = new EventsProxy(service);

  this.base64Encode = function(str) {
    if(isBrowser) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
      }));
    } else {
      return new Buffer(str).toString('base64');
    }
  };
}

// Subscriptions

function SubscriptionsProxy(service){
  this.service = service;
}

SubscriptionsProxy.prototype = {

  create: function(params, callback) {
    this.service.ajax({url: Utils.getUrl(config.urls.subscriptions), type: 'POST', data: params}, callback);
  },

  list: function(callback) {
    this.service.ajax({url: Utils.getUrl(config.urls.subscriptions)}, callback);
  },

  delete: function(id, callback) {
      var attrAjax = {
          'type': 'DELETE',
          'dataType': 'text',
          'url': Utils.getUrl(config.urls.subscriptions, id)
      };

      this.service.ajax(attrAjax, function(err, res){
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
    var message = {event: params};
    this.service.ajax({url: Utils.getUrl(config.urls.events), type: 'POST', data: message}, callback);
  },

  list: function(params, callback) {
    if (typeof params === 'function' && typeof callback ==='undefined') {
      callback = params;
      params = null;
    }

    this.service.ajax({url: Utils.getUrl(config.urls.events), data: params}, callback);
  },

  get: function(id, callback) {
    this.service.ajax({url: Utils.getUrl(config.urls.events, id)}, callback);
  },

  status: function(id, callback) {
    this.service.ajax({url: Utils.getUrl(config.urls.events, id + '/status')}, callback);
  },

  delete: function(id, callback) {
    this.service.ajax({url: Utils.getUrl(config.urls.events, id), dataType: 'text', type: 'DELETE'}, callback);
  }
};

module.exports = PushNotificationsProxy;
