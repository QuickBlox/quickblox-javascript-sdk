/*
 * QuickBlox JavaScript SDK
 *
 * Utilities
 *
 */

var config = require('./qbConfig');

var isBrowser = typeof window !== "undefined";
var unsupported = "This function isn't supported outside of the browser (...yet)";

if(!isBrowser){
  var fs = require('fs');
}


// The object for type MongoDB.Bson.ObjectId
// http://docs.mongodb.org/manual/reference/object-id/
var ObjectId = {
  machine: Math.floor(Math.random() * 16777216).toString(16),
  pid: Math.floor(Math.random() * 32767).toString(16),
  increment: 0
};

var Utils = {
  safeCallbackCall: function() {
    if(!isBrowser) throw unsupported;

    var listenerString = arguments[0].toString(),
        listenerName = listenerString.split('(')[0].split(' ')[1],
        argumentsCopy = [], listenerCall;

      for (var i = 0; i < arguments.length; i++) {
        argumentsCopy.push(arguments[i]);
      }

      listenerCall = argumentsCopy.shift();

    try {
      listenerCall.apply(null, argumentsCopy);
    } catch (err) {
      if (listenerName === '') {
        console.error('Error: ' + err);
      }else{
        console.error('Error in listener ' + listenerName + ': ' + err);
      }
    }
  },

  randomNonce: function() {
    return Math.floor(Math.random() * 10000);
  },

  unixTime: function() {
    return Math.floor(Date.now() / 1000);
  },

  getUrl: function(base, id) {
    var resource = id ? '/' + id : '';
    return 'https://' + config.endpoints.api + '/' + base + resource + config.urls.type;
  },

  // Generating BSON ObjectId and converting it to a 24 character string representation
  // Changed from https://github.com/justaprogrammer/ObjectId.js/blob/master/src/main/javascript/Objectid.js
  getBsonObjectId: function() {
    var timestamp = this.unixTime().toString(16),
        increment = (ObjectId.increment++).toString(16);

    if (increment > 0xffffff) ObjectId.increment = 0;

    return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
           '000000'.substr(0, 6 - ObjectId.machine.length) + ObjectId.machine +
           '0000'.substr(0, 4 - ObjectId.pid.length) + ObjectId.pid +
           '000000'.substr(0, 6 - increment.length) + increment;
  },

  injectISOTimes: function(data) {
    if (data.created_at) {
      if (typeof data.created_at === 'number') data.iso_created_at = new Date(data.created_at * 1000).toISOString();
      if (typeof data.updated_at === 'number') data.iso_updated_at = new Date(data.updated_at * 1000).toISOString();
    }
    else if (data.items) {
      for (var i = 0, len = data.items.length; i < len; ++i) {
        if (typeof data.items[i].created_at === 'number') data.items[i].iso_created_at = new Date(data.items[i].created_at * 1000).toISOString();
        if (typeof data.items[i].updated_at === 'number') data.items[i].iso_updated_at = new Date(data.items[i].updated_at * 1000).toISOString();
      }
    }
    return data;
  },

  QBLog: function(){

    if(this.loggers){
      for(var i=0;i<this.loggers.length;++i){
        this.loggers[i](arguments);
      }
      return;
    }

    this.loggers = [];

    var consoleLoggerFunction = function(){
      var logger = function(args){
        console.log.apply(console, Array.prototype.slice.call(args));
      };
      return logger;
    };

    var fileLoggerFunction = function(){
      var logger = function(args){
        if(isBrowser){
          throw unsupported;
        }else{

          var data = [];
          for (var i = 0; i < args.length; i++) {
            data.push(JSON.stringify(args[i]));
          }
          data = data.join(" ");

          var toLog = "\n" + new Date() + ". " + data;
          fs.appendFile(config.debug.file, toLog, function(err) {
            if(err) {
              return console.error("Error while writing log to file. Error: " + err);
            }
          });
        }
      };
      return logger;
    };

    // Build loggers
    //

    // format "debug: { }"
    if (typeof config.debug === 'object'){

      if(typeof config.debug.mode === 'number'){
        if(config.debug.mode == 1){
          var logger = consoleLoggerFunction();
          this.loggers.push(logger);
        }else if(config.debug.mode == 2){
          var logger = fileLoggerFunction();
          this.loggers.push(logger);
        }
      }else if(typeof config.debug.mode === 'object'){
        var self = this;
        config.debug.mode.forEach(function(mode, i, arr) {
          if (mode === 1){
            var logger = consoleLoggerFunction();
            self.loggers.push(logger);
          }else if (mode === 2){
            var logger = fileLoggerFunction();
            self.loggers.push(logger);
          }
        });
      }

    // format "debug: true"
    // backward compatibility
    }else if (typeof config.debug === 'boolean'){
      if(config.debug){
        var logger = consoleLoggerFunction();
        this.loggers.push(logger);
      }
    }

    if(this.loggers){
      for(var i=0;i<this.loggers.length;++i){
        this.loggers[i](arguments);
      }
    }

  }
};

module.exports = Utils;
