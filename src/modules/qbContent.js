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

// For server-side applications through using npm package 'quickblox' you should include the following lines
var isBrowser = typeof window !== 'undefined';

if(!isBrowser){
  var xml2js = require('xml2js');
}


var taggedForUserUrl = config.urls.blobs + '/tagged';

function ContentProxy(service) {
  this.service = service;
}

ContentProxy.prototype = {

  create: function(params, callback){
   Utils.QBLog('[ContentProxy]', 'create', params);

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

    Utils.QBLog('[ContentProxy]', 'list', params);

    this.service.ajax({url: Utils.getUrl(config.urls.blobs), data: params, type: 'GET'}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result); }
    });
  },

  delete: function(id, callback){
    Utils.QBLog('[ContentProxy]', 'delete');

    this.service.ajax({url: Utils.getUrl(config.urls.blobs, id), type: 'DELETE', dataType: 'text'}, function(err, result) {
      if (err) { callback(err,null); }
      else { callback(null, true); }
    });
  },

  createAndUpload: function(params, callback){
    var createParams= {}, file, name, type, size, fileId, _this = this;

    var clonedParams = JSON.parse(JSON.stringify(params));
    clonedParams.file.data = "...";
    Utils.QBLog('[ContentProxy]', 'createAndUpload', clonedParams);

    file = params.file;
    name = params.name || file.name;
    type = params.type || file.type;
    size = params.size || file.size;

    createParams.name = name;
    createParams.content_type = type;
    if (params.public) { createParams.public = params.public; }
    if (params.tag_list) { createParams.tag_list = params.tag_list; }

    // Create a file object
    //
    this.create(createParams, function(err,createResult){
      if (err) {
        callback(err, null);
      } else {
        var uri = parseUri(createResult.blob_object_access.params);
        var uploadParams = { url: 'https://' + uri.host };
        var data;
        if(isBrowser){
          data = new FormData();
        }else{
          data = {};
        }
        fileId = createResult.id;

        Object.keys(uri.queryKey).forEach(function(val) {
          if(isBrowser){
            data.append(val, decodeURIComponent(uri.queryKey[val]));
          }else{
            data[val] = decodeURIComponent(uri.queryKey[val]);
          }
        });

        if(isBrowser){
          data.append('file', file, createResult.name);
        }else{
          data['file'] = file;
        }

        uploadParams.data = data;

        // Upload the file to Amazon S3
        //
        _this.upload(uploadParams, function(err, result) {
          if (err) {
            callback(err, null);
          } else {
            if (isBrowser) {
              createResult.path = result.Location.replace('http://', 'https://');
            } else {
              createResult.path = result.PostResponse.Location;
            }

            // Mark file as uploaded
            //
            _this.markUploaded({id: fileId, size: size}, function(err, result){
              if (err) {
                callback(err, null);
              } else {
                callback(null, createResult);
              }
            });
          }
        });
      }
    });
  },

  upload: function(params, callback){
    Utils.QBLog('[ContentProxy]', 'upload');

    this.service.ajax({url: params.url, data: params.data, dataType: 'xml',
                       contentType: false, processData: false, type: 'POST'}, function(err,xmlDoc){
      if (err) {
        callback (err, null);
      } else {
        if (isBrowser) {
          // AWS S3 doesn't respond with a JSON structure
          // so parse the xml and return a JSON structure ourselves
          var result = {}, rootElement = xmlDoc.documentElement, children = rootElement.childNodes, i, m;
          for (i = 0, m = children.length; i < m ; i++) {
            result[children[i].nodeName] = children[i].childNodes[0].nodeValue;
          }
          callback (null, result);

        } else {
          var parseString = xml2js.parseString;
          parseString(xmlDoc, function(err,result) {
            if (result) {
              callback (null, result);
            }
          });
        }
      }
    });
  },

  taggedForCurrentUser: function(callback) {
    Utils.QBLog('[ContentProxy]', 'taggedForCurrentUser');

    this.service.ajax({url: Utils.getUrl(taggedForUserUrl)}, function(err, result) {
      if (err) { callback(err, null); }
      else { callback(null, result); }
    });
  },

  markUploaded: function (params, callback) {
    Utils.QBLog('[ContentProxy]', 'markUploaded', params);

    this.service.ajax({url: Utils.getUrl(config.urls.blobs, params.id + '/complete'), type: 'PUT', data: {size: params.size}, dataType: 'text' }, function(err, res){
      if (err) { callback (err, null); }
      else { callback (null, res); }
    });
  },

  getInfo: function (id, callback) {
    Utils.QBLog('[ContentProxy]', 'getInfo', id);

    this.service.ajax({url: Utils.getUrl(config.urls.blobs, id)}, function (err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res); }
    });
  },

  getFile: function (uid, callback) {
    Utils.QBLog('[ContentProxy]', 'getFile', uid);

    this.service.ajax({url: Utils.getUrl(config.urls.blobs, uid)}, function (err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res); }
    });
  },

  getFileUrl: function (id, callback) {
    Utils.QBLog('[ContentProxy]', 'getFileUrl', id);

    this.service.ajax({url: Utils.getUrl(config.urls.blobs, id + '/getblobobjectbyid'), type: 'POST'}, function (err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res.blob_object_access.params); }
    });
  },

  update: function (params, callback) {
    Utils.QBLog('[ContentProxy]', 'update', params);

    var data = {};
    data.blob = {};
    if (typeof params.name !== 'undefined') { data.blob.name = params.name; }
    this.service.ajax({url: Utils.getUrl(config.urls.blobs, params.id), data: data}, function(err, res) {
      if (err) { callback (err, null); }
      else { callback (null, res); }
    });
  },

  privateUrl: function (fileUID){
    return "https://" + config.endpoints.api + "/blobs/" + fileUID + "?token=" + this.service.getSession().token;
  },

  publicUrl: function (fileUID){
    return "https://" + config.endpoints.api + "/blobs/" + fileUID;
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
