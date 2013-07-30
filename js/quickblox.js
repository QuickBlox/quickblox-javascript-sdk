var QB = (function(){
  QB = new QuickBlox();
  QB.Utils = new Utils();
  return QB;
}());

function QuickBlox() {
  console.debug('Quickblox instantiated');
  this.config = {
    appId: '',
    authKey: '',
    authSecret: '',
    debug: false
  };
  this.urls =  {
      base: 'https://api.quickblox.com/',
      session: 'session.json',
      users: 'users.json'
  };
}

QuickBlox.prototype.init = function init(appIdOrObj, authKey, authSecret, debug) {
  console.debug('QuickBlox.init', appIdOrObj, authKey, authSecret, debug);
  if (typeof appIdOrObj === 'object') {
    debug = appIdOrObj.debug;
    authSecret = appIdOrObj.authSecret;
    authKey = appIdOrObj.authKey;
    appIdOrObj = appIdOrObj.appId;
  }
  this.config.appId = appIdOrObj;
  this.config.authKey = authKey;
  this.config.authSecret = authSecret;
  this.session = null;
  if (typeof debug === 'undefined' || debug === null) {
    this.config.debug = false;
    console.debug('Debug is OFF');
  } else {
    this.config.debug = debug;
    console.debug('Debug is ON');
  }
};

QuickBlox.prototype.createSession = function createSession(params, callback) {
  var message, signedMessage, _this = this;

  // Allow first param to be a hash of arguments used to override those set in init
  // could also include (future) user credentials
  if (typeof params === 'function'){
    callback = params;
    params = {};
  }

  // Allow params to override config
  message = {
    application_id : params.appId || this.config.appId,
    auth_key : params.authKey || this.config.authKey,
    nonce: QB.Utils.nonce().toString(),
    timestamp: QB.Utils.unixtime()
  };

  // Optionally permit a user session to be created
  if (params.user && params.user.password) {
    message.user = params.user;
  }
  if (params.social && params.social.provider) {
    message.provider = social.provider;
    message.scope = params.social.scope;
    message.keys = { token: params.social.token, secret: params.social.secret };
  }
  // Sign message with SHA-1 using secret key and add to payload
  this.signMessage(message,  params.authSecret || this.config.authSecret);

  if (this.config.debug) {console.debug('Creating session using', message, jQuery.param(message));}

  // Call API
  jQuery.ajax( 
    {
      url: this.urls.base+this.urls.session, 
      async: true,
		  type: 'POST',
      crossDomain: true,
      cache: false,
		  dateType: 'application/json',
		  data: message,
      /* Currently can't do this as it causes CORS issue
       * beforeSend: function(jqXHR, settings){
        //jqXHR.setRequestHeader('QuickBlox-REST-API-Version', '0.1.1');
        return true;
      },*/
      success: function(data, status, jqHXR) {
        if (_this.config.debug) {console.debug(status,data);}
        _this.session = data.session;
        callback(null, data);
      },
      error: function(jqHXR, status, error){
        if (_this.config.debug) {console.debug(status, error);}
        _this.session = null;
        callback({status: status, message: error}, null);
      }
    });
};

QuickBlox.prototype.signMessage= function(message, secret){
  var data = jQuery.param(message);
  signature = QB.Utils.sign(data, secret);
  jQuery.extend(message, {signature: signature});
};

// Currently fails due a CORS issue
QuickBlox.prototype.destroySession = function(callback){
  var _this = this, url, message;
  message = {
    token: this.session.token
  };
  if (this.config.debug) {console.debug('Destroy session using', message, jQuery.param(message));}
  jQuery.ajax(
    {
      url: this.urls.base+this.urls.session,
      async: true,
      type: 'DELETE',
      cache: false,
      crossDomain: true,
      data: message,
      success: function(data, status, error){
        if (_this.config.debug) {console.debug(status, data);}
        _this.session = null;
        callback(null, data);
      },
      error: function(jqHXR, status, error){
        if (_this.config.debug) {console.debug(status, error);}
        callback({status: status, message: error}, null);
      }
    });
};

QuickBlox.prototype.listUsers = function(params, callback){
  var _this = this, url, message, filter;
  if (typeof params === 'function') {
    callback = params;
    params = undefined;
  }
  url = this.urls.base+this.urls.users;
  message = {
    token: this.session.token
  };
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
    jQuery.extend(message, {'filter[]': filter});
  }
  if (params && params.perPage) { message.per_page = params.perPage;}
  if (params && params.pageNo) {message.page = params.pageNo;}
  if (this.config.debug) {console.debug('Retrieve users using', message, jQuery.param(message));}
  jQuery.ajax({
    url: url,
    async: true,
    type: 'GET',
    cache: false,
    crossDomain: true,
    data: message,
    success: function (data, status, jqHXR) {
      if (_this.config.debug) {console.debug(status,data);}
      callback(null,data);
    },
    error: function(jqHXR, status, error) {
      if (_this.config.debug) {console.debug(status, error);}
      callback({status:status, message:error}, null);
    }
  });
};


// Utilities 
function Utils() {
  this._nonce = Math.floor(Math.random() * 10000);
  // Shim for Date.now function (IE < 9)
  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
      };
  }
  // Shim for console log on IE
  // (http://stackoverflow.com/questions/1423267/are-there-any-logging-frameworks-for-javascript#answer-10816237)
  if (typeof console === 'undefined' || !console.log) {
    window.console = {
      debug: function() {},
      trace: function() {},
      log: function() {},
      info: function() {},
      warn: function() {},
      error: function() {}
    };
  }
}

Utils.prototype.nonce = function nonce(){
  return this._nonce++;
};

Utils.prototype.unixtime = function unixtime(){
  return Math.floor(Date.now() / 1000).toString();
};

Utils.prototype.sign = function sign(message, secret) {
  return CryptoJS.HmacSHA1(message, secret).toString();
};

Utils.prototype.morphParams = function morphParams(params, callback){
};

