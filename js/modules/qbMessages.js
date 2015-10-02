/*
 * QuickBlox JavaScript SDK
 *
 * Messages Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

function MessagesProxy(service) {
  this.service = service;
  this.tokens = new TokensProxy(service);
  this.subscriptions = new SubscriptionsProxy(service);
  this.events = new EventsProxy(service);
}

// Push Tokens

function TokensProxy(service){
  this.service = service;
}

TokensProxy.prototype = {

  create: function(params, callback){
    Utils.QBLog('[TokensProxy]', 'create', params);

    var message = {
      push_token: {
        environment: params.environment,
        client_identification_sequence: params.client_identification_sequence
      },
      device: { platform: params.platform, udid: params.udid}
    };

    this.service.ajax({url: Utils.getUrl(config.urls.pushtokens), type: 'POST', data: message},
                      function(err, data){
                        if (err) { callback(err, null);}
                        else { callback(null, data.push_token); }
                      });
  },

  delete: function(id, callback) {
    Utils.QBLog('[TokensProxy]', 'delete', id);

    this.service.ajax({url: Utils.getUrl(config.urls.pushtokens, id), type: 'DELETE', dataType:'text'},
                      function (err, res) {
                        if (err) {callback(err, null);}
                        else {callback(null, true);}
                        });
  }

};

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

  list: function(callback) {
    Utils.QBLog('[EventsProxy]', 'list', params);

    this.service.ajax({url: Utils.getUrl(config.urls.events)}, callback);
  },

  get: function(id, callback) {
    Utils.QBLog('[EventsProxy]', 'get', id);

    this.service.ajax({url: Utils.getUrl(config.urls.events, id)}, callback);
  },

  status: function(id, callback) {
    Utils.QBLog('[EventsProxy]', 'status', id);

    this.service.ajax({url: Utils.getUrl(config.urls.events, id + '/status')}, callback);
  },

  update: function(params, callback) {
    Utils.QBLog('[EventsProxy]', 'update', params);

    var message = {event: params};
    this.service.ajax({url: Utils.getUrl(config.urls.events, params.id), type: 'PUT', data: message}, callback);
  },

  delete: function(id, callback) {
    Utils.QBLog('[EventsProxy]', 'delete', id);
    
    this.service.ajax({url: Utils.getUrl(config.urls.events, id), type: 'DELETE'}, callback);
  }

};

module.exports = MessagesProxy;
