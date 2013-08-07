/*
 * QuickBlox JavaScript SDK
 *
 * Messages Module
 *
 */

// broserify export and dependencies

// Browserify exports and dependencies
module.exports = MessagesProxy;
var config = require('./qbConfig');
var Proxy = require('./qbProxy');
var jQuery = require('../lib/jquery-1.10.2');

// Url variables
var tokenUrl = config.urls.base + config.urls.pushtokens;
var subsUrl = config.urls.base + config.urls.subscriptions;
var eventUrl = config.urls.base + config.urls.events;
var pullUrl = config.urls.base + config.urls.pullevents;

function MessagesProxy(service) {
  this.service = service;
}

// Push Tokens
MessagesProxy.prototype.createPushToken = function(params, callback){
  var message = {
    push_token: {
      environment: params.environment,
      client_identification_sequence: params.client_identification_sequence
    },
    device: { platform: params.platform, udid: params.udid}
  };
  if (config.debug) { console.debug('MessagesProxy.createPushToken', message);}
  this.service.ajax({url: tokenUrl + config.urls.type, type: 'POST', data: message},
                    function(err, data){
                      if (err) { callback(err, null);}
                      else { callback(null, data.push_token); }
                    });
};

MessagesProxy.prototype.deletePushToken = function(id, callback) {
 if (config.debug) { console.debug('MessageProxy.deletePushToken', id); }
  this.service.ajax({url: tokenUrl + id + config.urls.type, type: 'DELETE'}, callback);
};

// Subscriptions
MessagesProxy.prototype.createSubscription = function (params, callback){
  if (config.debug) { console.debug('MessageProxy.createSubscription', params); }
  this.service.ajax({url: subsUrl + config.urls.type, type: 'POST', data : params}, callback);
};

MessagesProxy.prototype.listSubscriptions = function (callback) {
  if (config.debug) { console.debug('MessageProxy.listSubscription', params); }
  this.service.ajax({url: subsUrl + config.urls.type}, callback);
};

MessagesProxy.prototype.deleteSubscription = function(id, callback) {
 if (config.debug) { console.debug('MessageProxy.deleteSubscription', id); }
  this.service.ajax({url: subsUrl + id + config.urls.type, type: 'DELETE'}, callback);
};

// Events
MessagesProxy.prototype.createEvent = function(params, callback) {
  if (config.debug) { console.debug('MessageProxy.createEvent', params); }
  var message = {event: params};
  this.service.ajax({url: eventUrl + config.urls.type, type: 'POST', data: message}, callback);
};

MessagesProxy.prototype.listEvents = function(callback) {
 if (config.debug) { console.debug('MessageProxy.listEvents'); }
  this.service.ajax({url: eventUrl + config.urls.type}, callback);
};

MessagesProxy.prototype.getEvent = function(id, callback) {
 if (config.debug) { console.debug('MessageProxy.getEvents', id); }
  this.service.ajax({url: eventUrl + id + config.urls.type}, callback);
};

MessagesProxy.prototype.updateEvent = function(params, callback) {
  if (config.debug) { console.debug('MessageProxy.createEvent', params); }
  var message = {event: params};
  this.service.ajax({url: eventUrl + params.id + config.urls.type, type: 'PUT', data: message}, callback);
};

MessagesProxy.prototype.deleteEvent = function(id, callback) {
 if (config.debug) { console.debug('MessageProxy.deleteEvent', id); }
  this.service.ajax({url: eventUrl + id + config.urls.type, type: 'DELETE'}, callback);
};

MessagesProxy.prototype.listPullEvents = function(callback) {
  if (config.debug) { console.debug('MessageProxy.getPullEvents', params); }
  this.service.ajax({url: pullUrl + config.urls.type}, callback);
};


