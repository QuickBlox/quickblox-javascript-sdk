'use strict';

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

/**
 * Content
 * @namespace QB.content
 **/
function ContentProxy(service) {
    this.service = service;
}

ContentProxy.prototype = {
    /**
     * Get a list of files for current user ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Retrieve_files read more})
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {number} [params.page=1] - Used to paginate the results when more than one page of files retrieved
     * @param {number} [params.per_page=10] - The maximum number of files to return per page, if not specified then the default is 10
     * @param {listOfFilesCallback} callback - The listOfFilesCallback function
     */
    list: function(params, callback) {
        /**
         * Callback for QB.content.list(params, callback)
         * @callback listOfFilesCallback
         * @param {object} error - The error object
         * @param {object} response - Object with Array of files
         */
        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = null;
        }

        this.service.ajax({url: Utils.getUrl(config.urls.blobs), data: params, type: 'GET'}, function(err,result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Create new file object ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Create_file read more})
     * @private
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {string} params.content_type - The file's mime ({@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types content type})
     * @param {string} params.name - The file's name
     * @param {boolean} [params.public=false] - The file's visibility. public means it will be possible to access this file without QuickBlox session token provided. Default is 'false'
     * @param {createFileCallback} callback - The createFileCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.content.create(params, callback)
         * @callback createFileCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        this.service.ajax({
            type: 'POST',
            data: {blob: params},
            url: Utils.getUrl(config.urls.blobs)
        }, function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(err, result.blob);
            }
        });
    },

    /**
     * Delete file by id ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Delete_file read more})
     * @memberof QB.content
     * @param {Number} id - blob_id
     * @param {deleteFileCallback} callback - The deleteFileCallback function.
     */
    delete: function(id, callback) {
        /**
         * Callback for QB.content.delete(id, callback)
         * @callback deleteFileCallback
         * @param {object} error - The error object
         * @param {object} response - Boolean
         */
        this.service.ajax({url: Utils.getUrl(config.urls.blobs, id), type: 'DELETE', dataType: 'text'}, function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, true);
            }
        });
    },

    /**
     * Create file > upload file > mark file as uploaded > return result.
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {object} params.file - File object
     * @param {string} params.name - The file's name
     * @param {string} params.type - The file's mime ({@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types content type})
     * @param {number} params.size - Size of file, in bytes
     * @param {boolean} [params.public=false] - The file's visibility. public means it will be possible to access this file without QuickBlox session token provided. Default is 'false'
     * @param {createAndUploadFileCallback} callback - The createAndUploadFileCallback function
     */
    createAndUpload: function(params, callback) {
        /**
         * Callback for QB.content.createAndUpload(params, callback).
         * @callback createAndUploadFileCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        var _this = this,
            createParams= {},
            file,
            name,
            type,
            size,
            fileId;

        var clonedParams = JSON.parse(JSON.stringify(params));

        clonedParams.file.data = "...";

        file = params.file;
        name = params.name || file.name;
        type = params.type || file.type;
        size = params.size || file.size;

        createParams.name = name;
        createParams.content_type = type;

        if (params.public) {
            createParams.public = params.public;
        }

        if (params.tag_list) {
            createParams.tag_list = params.tag_list;
        }

        // Create a file object
        this.create(createParams, function(err, createResult){
            if (err) {
                callback(err, null);
            } else {
                var uri = parseUri(createResult.blob_object_access.params),
                    uploadUrl = uri.protocol + "://" + uri.authority + uri.path,
                    uploadParams = {url: uploadUrl},
                    data = {};

                fileId = createResult.id;
                createResult.size = size;

                Object.keys(uri.queryKey).forEach(function(val) {
                    data[val] = decodeURIComponent(uri.queryKey[val]);
                });

                data.file = file;
                uploadParams.data = data;

                // Upload the file to Amazon S3
                _this.upload(uploadParams, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        // Mark file as uploaded
                        _this.markUploaded({
                            id: fileId,
                            size: size
                        }, function(err, result){
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

    /**
     * Upload a file to cloud storage ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Upload_file read more})
     * @private
     * @memberof QB.content
     * @param {Object} params - Object of parameters (see into source code of QB.content.createAndUpload(params, callback) to know how to prepare the params object)
     * @param {string} params.url - location url
     * @param {object} params.data - formed data with file
     * @param {uploadFileCallback} callback - The uploadFileCallback function
     */
    upload: function(params, callback) {
        /**
         * Callback for QB.content.upload(params, callback)
         * @callback uploadFileCallback
         * @param {object} error - The error object
         * @param {object} response - The empty object
         */
        var uploadParams = {
            type: 'POST',
            dataType: 'text',
            contentType: false,
            url: params.url,
            data: params.data
        };

        this.service.ajax(uploadParams, function(err, xmlDoc) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, {});
            }
        });
    },

    /**
     * Declare file uploaded. The file's 'status' field will be set to 'complete' ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Declare_file_uploaded read more})
     * @private
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {number} params.blob_id - The id of file to declare as uploaded
     * @param {number} params.size - Size of file, in bytes
     * @param {markUploadedFileCallback} callback - The markUploadedFileCallback function
     */
    markUploaded: function (params, callback) {
        /**
         * Callback for QB.content.markUploaded(params, callback)
         * @callback markUploadedFileCallback
         * @param {object} error - The error object
         * @param {object} response - The empty body
         */
        this.service.ajax({
            url: Utils.getUrl(config.urls.blobs, params.id + '/complete'),
            type: 'PUT',
            data: {
                size: params.size
            },
            dataType: 'text'
        }, function(err, res){
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Retrieve file object by id (@link https://docsdev.quickblox.com/rest_api/Content_API.html#Retrieve_file read more})
     * @memberof QB.content
     * @param {number} id - The id of file to declare as uploaded
     * @param {getFileInfoByIdCallback} callback - The getFileInfoByIdCallback function return file's object.
     */
    getInfo: function (id, callback) {
        /**
         * Callback for QB.content.getInfo(id, callback)
         * @callback getFileInfoByIdCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        this.service.ajax({url: Utils.getUrl(config.urls.blobs, id)}, function (err, res) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Download file by UID. If the file is public then it's possible to download it without a session token (@link https://docsdev.quickblox.com/rest_api/Content_API.html#Download_file read more})
     * @memberof QB.content
     * @param {String} uid - The uid of file to declare as uploaded
     * @param {downloadFileByUIDCallback} callback - The downloadFileByUIDCallback function
     */
    getFile: function (uid, callback) {
        /**
         * Callback for QB.content.getFile(uid, callback)
         * @callback downloadFileByUIDCallback
         * @param {object} error - The error object
         * @param {object} response - The file object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.blobs, uid)}, function (err, res) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Edit a file by ID ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Download_file read more})
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {number} params.id - The id of file to declare as uploaded
     * @param {string} [params.name] - New file name
     * @param {updateFileCallback} callback - The updateFileCallback function
     */
    update: function (params, callback) {
        /**
         * Callback for QB.content.update(uid, callback)
         * @callback updateFileCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        var data = {};

        data.blob = {};

        if (typeof params.name !== 'undefined') {
            data.blob.name = params.name;
        }

        this.service.ajax({url: Utils.getUrl(config.urls.blobs, params.id), data: data}, function(err, res) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Get private URL for file download by file_uid (blob_uid).
     * @memberof QB.content
     * @param {String} fileUID - The uid of file to declare as uploaded
     */
    privateUrl: function (fileUID) {
        return "https://" + config.endpoints.api + "/blobs/" + fileUID + "?token=" + this.service.getSession().token;
    },

    /**
     * Get public URL for file download by file_uid (blob_uid).
     * @memberof QB.content
     * @param {String} fileUID - The uid of file to declare as uploaded
     */
    publicUrl: function (fileUID) {
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
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};
