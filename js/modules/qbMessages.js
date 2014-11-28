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
    var message = {
      push_token: {
        environment: params.environment,
        client_identification_sequence: params.client_identification_sequence
      },
      device: { platform: params.platform, udid: params.udid}
    };
    if (config.debug) { console.log('TokensProxy.create', message);}
    this.service.ajax({url: Utils.getUrl(config.urls.pushtokens), type: 'POST', data: message},
                      function(err, data){
                        if (err) { callback(err, null);}
                        else { callback(null, data.push_token); }
                      });
  },

  delete: function(id, callback) {
    if (config.debug) { console.log('MessageProxy.deletePushToken', id); }
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
    if (config.debug) { console.log('MessageProxy.createSubscription', params); }
    this.service.ajax({url: Utils.getUrl(config.urls.subscriptions), type: 'POST', data: params}, callback);
  },

  list: function(callback) {
    if (config.debug) { console.log('MessageProxy.listSubscription'); }
    this.service.ajax({url: Utils.getUrl(config.urls.subscriptions)}, callback);
  },

  delete: function(id, callback) {
    if (config.debug) { console.log('MessageProxy.deleteSubscription', id); }
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
    if (config.debug) { console.log('MessageProxy.createEvent', params); }
    var message = {event: params};
    this.service.ajax({url: Utils.getUrl(config.urls.events), type: 'POST', data: message}, callback);
  },

  list: function(callback) {
   if (config.debug) { console.log('MessageProxy.listEvents'); }
    this.service.ajax({url: Utils.getUrl(config.urls.events)}, callback);
  },

  get: function(id, callback) {
    if (config.debug) { console.log('MessageProxy.getEvents', id); }
    this.service.ajax({url: Utils.getUrl(config.urls.events, id)}, callback);
  },

  update: function(params, callback) {
    if (config.debug) { console.log('MessageProxy.createEvent', params); }
    var message = {event: params};
    this.service.ajax({url: Utils.getUrl(config.urls.events, params.id), type: 'PUT', data: message}, callback);
  },

  delete: function(id, callback) {
    if (config.debug) { console.log('MessageProxy.deleteEvent', id); }
    this.service.ajax({url: Utils.getUrl(config.urls.events, id), type: 'DELETE'}, callback);
  }

};

module.exports = MessagesProxy;
