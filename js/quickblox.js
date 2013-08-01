(function(){
  QB = new QuickBlox();
  //require ('./qbUtils').shims();
  console.debug (require ('./qbUtils'));
  window.QB = QB;
}(window));

function QuickBlox() {
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
  this._nonce = Math.floor(Math.random() * 10000);
  if (this.config.debug) {console.debug('Quickblox instantiated', this);}
}

QuickBlox.prototype.nonce = function nonce(){
  return this._nonce++;
};

QuickBlox.prototype.init = function init(appId, authKey, authSecret, debug) {
  if (debug || this.config.debug) {console.debug('QuickBlox.init', appId, authKey, authSecret, debug);}
  if (typeof appId === 'object') {
    debug = appId.debug;
    authSecret = appId.authSecret;
    authKey = appId.authKey;
    appId = appId.appId;
  }
  this.config.appId = appId;
  this.config.authKey = authKey;
  this.config.authSecret = authSecret;
  this.session = null;
  if (debug) {
    this.config.debug = debug;
    console.debug('Debug is OFF');
  }
};

QuickBlox.prototype.createSession = function createSession(params, callback) {
  var message, signedMessage, _this = this, now;

  // Allow first param to be a hash of arguments used to override those set in init
  // could also include (future) user credentials
  if (typeof params === 'function'){
    callback = params;
    params = {};
  }

  now = require('./qbUtils').unixTime();
  // Allow params to override config
  message = {
    application_id : params.appId || this.config.appId,
    auth_key : params.authKey || this.config.authKey,
    nonce: this.nonce().toString(),
    timestamp: now };

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
        callback(null, data.session);
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
  signature =  CryptoJS.HmacSHA1(data, secret).toString();
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

