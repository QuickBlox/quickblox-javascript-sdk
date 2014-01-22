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
  this.tokens = new TokensProxy(service);
  this.subscriptions = new SubscriptionsProxy(service);
  this.events = new EventsProxy(service);
}

// Push Tokens

function TokensProxy(service){
  this.service = service;
}

TokensProxy.prototype.create = function(params, callback){
  var message = {
    push_token: {
      environment: params.environment,
      client_identification_sequence: params.client_identification_sequence
    },
    device: { platform: params.platform, udid: params.udid}
  };
  if (config.debug) { console.debug('TokensProxy.create', message);}
  this.service.ajax({url: tokenUrl + config.urls.type, type: 'POST', data: message},
                    function(err, data){
                      if (err) { callback(err, null);}
                      else { callback(null, data.push_token); }
                    });
};

TokensProxy.prototype.delete = function(id, callback) {
  var url = tokenUrl + '/' + id + config.urls.type;
  if (config.debug) { console.debug('MessageProxy.deletePushToken', id); }
  this.service.ajax({url: url, type: 'DELETE', dataType:'text'}, 
                    function (err, res) {
                      if (err) {callback(err, null);}
                      else {callback(null, true);}
                      });
};

// Subscriptions

function SubscriptionsProxy(service){
  this.service = service;
}

SubscriptionsProxy.prototype.create = function (params, callback){
  if (config.debug) { console.debug('MessageProxy.createSubscription', params); }
  this.service.ajax({url: subsUrl + config.urls.type, type: 'POST', data : params}, callback);
};

SubscriptionsProxy.prototype.list = function (callback) {
  if (config.debug) { console.debug('MessageProxy.listSubscription', params); }
  this.service.ajax({url: subsUrl + config.urls.type}, callback);
};

SubscriptionsProxy.prototype.delete = function(id, callback) {
  var url = subsUrl + '/'+ id + config.urls.type;
  if (config.debug) { console.debug('MessageProxy.deleteSubscription', id); }
  this.service.ajax({url: url, type: 'DELETE', dataType:'text'}, 
                    function(err, res){
                      if (err) { callback(err, null);}
                      else { callback(null, true);}
                    });
};

// Events
function EventsProxy(service){
  this.service = service;
}

EventsProxy.prototype.create = function(params, callback) {
  if (config.debug) { console.debug('MessageProxy.createEvent', params); }
  var message = {event: params};
  this.service.ajax({url: eventUrl + config.urls.type, type: 'POST', data: message}, callback);
};

EventsProxy.prototype.list = function(callback) {
 if (config.debug) { console.debug('MessageProxy.listEvents'); }
  this.service.ajax({url: eventUrl + config.urls.type}, callback);
};

EventsProxy.prototype.get = function(id, callback) {
  var url = eventUrl + '/' + params.id + config.urls.type;
  if (config.debug) { console.debug('MessageProxy.getEvents', id); }
  this.service.ajax({url: url}, callback);
};

EventsProxy.prototype.update = function(params, callback) {
  var url = eventUrl + '/' + params.id + config.urls.type;
  if (config.debug) { console.debug('MessageProxy.createEvent', params); }
  var message = {event: params};
  this.service.ajax({url: url, type: 'PUT', data: message}, callback);
};

EventsProxy.prototype.delete = function(id, callback) {
  var url = eventUrl + '/' + params.id + config.urls.type;
 if (config.debug) { console.debug('MessageProxy.deleteEvent', id); }
  this.service.ajax({url: url, type: 'DELETE'}, callback);
};

EventsProxy.prototype.pullEvents = function(callback) {
  if (config.debug) { console.debug('MessageProxy.getPullEvents', params); }
  this.service.ajax({url: pullUrl + config.urls.type}, callback);
};


