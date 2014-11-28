/*
 * QuickBlox JavaScript SDK
 *
 * Content module
 *
 * For an overview of this module and what it can be used for
 * see http://quickblox.com/modules/content
 *
 * The API itself is described at http://quickblox.com/developers/Content
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var taggedForUserUrl = config.urls.blobs + '/tagged';

function ContentProxy(service) {
  this.service = service;
}

ContentProxy.prototype = {
  
  create: function(params, callback){
   if (config.debug) { console.log('ContentProxy.create', params);}
    this.service.ajax({url: Utils.getUrl(config.urls.blobs), data: {blob:params}, type: 'POST'}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result.blob); }
    });
  },

  list: function(params, callback){
    if (typeof params === 'function' && typeof callback ==='undefined') {
      callback = params;
      params = null;
    }
    this.service.ajax({url: Utils.getUrl(config.urls.blobs)}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result); }
    });
  },

  delete: function(id, callback){
    this.service.ajax({url: Utils.getUrl(config.urls.blobs, id), type: 'DELETE', dataType: 'text'}, function(err, result) {
      if (err) { callback(err,null); }
      else { callback(null, true); }
    });
  },

  createAndUpload: function(params, callback){
    var createParams= {}, file, name, type, size, fileId, _this = this;
    if (config.debug) { console.log('ContentProxy.createAndUpload', params);}
    file = params.file;
    name = params.name || file.name;
    type = params.type || file.type;
    size = file.size;
    createParams.name = name;
    createParams.content_type = type;
    if (params.public) { createParams.public = params.public; }
    if (params.tag_list) { createParams.tag_list = params.tag_list; }
    this.create(createParams, function(err,createResult){
      if (err){ callback(err, null); }
      else {
        var uri = parseUri(createResult.blob_object_access.params), uploadParams = { url: (config.ssl ? 'https://' : 'http://') + uri.host }, data = new FormData();
        fileId = createResult.id;
        
        Object.keys(uri.queryKey).forEach(function(val) {
          data.append(val, decodeURIComponent(uri.queryKey[val]));
        });
        data.append('file', file, createResult.name);
        
        uploadParams.data = data;
        _this.upload(uploadParams, function(err, result) {
          if (err) { callback(err, null); }
          else {
            createResult.path = config.ssl ? result.Location.replace('http://', 'https://') : result.Location;
            _this.markUploaded({id: fileId, size: size}, function(err, result){
              if (err) { callback(err, null);}
              else {
                callback(null, createResult);
              }
            });
          }
        });
      }
    });
  },

  upload: function(params, callback){
    this.service.ajax({url: params.url, data: params.data, dataType: 'xml',
                       contentType: false, processData: false, type: 'POST'}, function(err,xmlDoc){
      if (err) { callback (err, null); }
      else {
        // AWS S3 doesn't respond with a JSON structure
        // so parse the xml and return a JSON structure ourselves
        var result = {}, rootElement = xmlDoc.documentElement, children = rootElement.childNodes, i, m;
        for (i = 0, m = children.length; i < m ; i++){
          result[children[i].nodeName] = children[i].childNodes[0].nodeValue;
        } 
        if (config.debug) { console.log('result', result); }
        callback (null, result);
      }
    });
  },

  taggedForCurrentUser: function(callback) {
    this.service.ajax({url: Utils.getUrl(taggedForUserUrl)}, function(err, result) {
      if (err) { callback(err, null); }
      else { callback(null, result); }
    });
  },

  markUploaded: function (params, callback) {
    this.service.ajax({url: Utils.getUrl(config.urls.blobs, params.id + '/complete'), type: 'PUT', data: {size: params.size}, dataType: 'text' }, function(err, res){
      if (err) { callback (err, null); }
      else { callback (null, res); }
    });
  },

  getInfo: function (id, callback) {
    this.service.ajax({url: Utils.getUrl(config.urls.blobs, id)}, function (err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res); }
    });
  },

  getFile: function (uid, callback) {
   this.service.ajax({url: Utils.getUrl(config.urls.blobs, uid)}, function (err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res); }
    });
  },

  getFileUrl: function (id, callback) {
   this.service.ajax({url: Utils.getUrl(config.urls.blobs, id + '/getblobobjectbyid'), type: 'POST'}, function (err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res.blob_object_access.params); }
    });
  },

  update: function (params, callback) {
    var data = {};
    data.blob = {};
    if (typeof params.name !== 'undefined') { data.blob.name = params.name; }
    this.service.ajax({url: Utils.getUrl(config.urls.blobs, params.id), data: data}, function(err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res); } 
    });
  }

};

module.exports = ContentProxy;

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
// http://blog.stevenlevithan.com/archives/parseuri
function parseUri (str) {
  var o   = parseUri.options,
    m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i   = 14;

  while (i--) {uri[o.key[i]] = m[i] || "";}

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) {uri[o.q.name][$1] = $2;}
  });

  return uri;
}

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};
