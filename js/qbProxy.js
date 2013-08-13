/*
 * QuickBlox JavaScript SDK
 *
 * Proxy module
 *
 */

// Browserify exports and dependencies
module.exports = ServiceProxy;
var config = require('./qbConfig');
var jQuery = require('../lib/jquery-1.10.2');

function ServiceProxy(qb){
  this.qbInst = qb;
  if (config.debug) { console.debug("ServiceProxy", qb); }
}

ServiceProxy.prototype.ajax = function(params, callback) {
  var _this = this;
  if (this.qbInst.session && this.qbInst.session.token){
    if (params.data) {params.data.token = this.qbInst.session.token;}
    else { params.data = {token:this.qbInst.session.token}; }
  }
  if (config.debug) { console.debug('ServiceProxy',  params.type || 'GET', params.url, params.data); }
  jQuery.ajax({
    url: params.url,
    async: params.async || true,
    type: params.type || 'GET',
    cache: params.cache || false,
    crossDomain: params.crossDomain || true,
    data: params.data,
    // Currently can't do this as it causes CORS issue (OPTIONS preflight check returns 404)
    //beforeSend: function(jqXHR, settings){
      //jqXHR.setRequestHeader('QuickBlox-REST-API-Version', '0.1.1');
    //},
    success: function (data, status, jqHXR) {
      if (config.debug) {console.debug("ServiceProxy.ajax", status,data);}
      callback(null,data);
    },
    error: function(jqHXR, status, error) {
      //if (config.debug) {console.debug(status, error, (jqHXR ? (jqHXR.responseText || jqHXR.responseXML):''));}
      var errorMsg = {status: status, message:error};
      if (jqHXR && jqHXR.responseText){ errorMsg.detail = jqHXR.responseText; }
      callback(errorMsg, null);
    }
  });
}

