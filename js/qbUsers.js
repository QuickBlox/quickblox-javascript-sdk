/*
 * QuickBlox JavaScript SDK
 *
 * Users resource module
 *
 */

// Browserify exports and dependencies
module.exports = UsersProxy;
var Proxy = require('./qbProxy');

function UsersProxy(qb) {
  this.config = qb.config;
  this.urls = qb.urls;
  this.session = qb.session;
  this.service = new Proxy(qb);
}

UsersProxy.prototype.listUsers = function(params, callback){
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
    message['filter[]'] = filter;
  }
  if (params && params.perPage) { message.per_page = params.perPage;}
  if (params && params.pageNo) {message.page = params.pageNo;}
  if (this.config.debug) {console.debug('Retrieve users using', message);}
  this.service.ajax({url: url, data: message}, callback);
};
