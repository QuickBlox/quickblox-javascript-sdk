'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Custom Objects module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

// For server-side applications through using npm package 'quickblox' you should include the following lines
var isBrowser = typeof window !== 'undefined';

/**
 * Custom Objects
 * @namespace QB.data
 **/
function DataProxy(service){
    this.service = service;
}

DataProxy.prototype = {

    /**
     * Create new custom object ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Create_object read more})
     * @memberof QB.data
     * @param {string} className - A class name to which a new object belongs
     * @param {object} data - Object of parameters (custom fields' names and their values)
     * @param {createDataCallback} callback - The createDataCallback function
     * @example
     * QB.data.create('GameOfThrones', {
     *     'name': 'John',
     *     'age':'20',
     *     'family': [
     *         'Stark',
     *         'Targaryen'
     *     ]
     * }, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    create: function(className, data, callback) {
        /**
         * Callback for QB.data.create(className, data, callback)
         * @callback createDataCallback
         * @param {object} error - The error object
         * @param {object} response - An object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.data, className), data: data, type: 'POST'}, function(err,res) {
            if (err) {
                callback(err, null);
            } else {
                callback (err, res);
            }
        });
    },

    /**
     * Search for records of particular class ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects read more})
     * @memberof QB.data
     * @param {string} className - A class name to which a new record belongs
     * @param {(object|string[])} filters - Search records with field which contains exactly specified value or by array of records' ids to retrieve
     * @param {number} [filters.skip=0] - Skip N records in search results. Useful for pagination. Default (if not specified) - 0
     * @param {number} [filters.limit=100] - Limit search results to N records. Useful for pagination. Default and max values - 100. If limit is equal to -1 only last record will be returned
     * @param {string} [filters.*] - {@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects See more filters' parameters}
     * @param {listOfDataCallback} callback - The listOfDataCallback function
     * @example
     * var filter = {
     *     'skip': 0,
     *     'limit': 100,
     *     'sort_desc': 'updated_at',
     *     'family': {
     *         'in': 'Stark,Targaryen'
     *     }
     * };
     *
     * var ids = ['53aaa06f535c12cea9007496', '53aaa06f535c12cea9007495'];
     *
     * // use filter or ids to get records:
     * QB.data.list('GameOfThrones', filter, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    list: function(className, filters, callback) {
        /**
         * Callback for QB.data.list(className, filters, callback)
         * @callback listOfDataCallback
         * @param {object} error - The error object
         * @param {object} response - Object with Array of files
         */

        // make filters an optional parameter
        if (typeof callback === 'undefined' && typeof filters === 'function') {
            callback = filters;
            filters = null;
        }
        this.service.ajax({url: Utils.getUrl(config.urls.data, className), data: filters}, function(err,result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Update record by ID of particular class ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects read more})
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} data - Object of parameters
     * @param {string} data._id - An ID of record to update
     * @param {updateDataCallback} callback - The updateDataCallback function
     * @example
     * QB.data.update('GameOfThrones', {
     *     '_id': '53aaa06f535c12cea9007496',
     *     'pull': {
     *         'family':'Stark'
     *     }
     * }, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    update: function(className, data, callback) {
        /**
         * Callback for QB.data.update(className, data, callback)
         * @callback updateDataCallback
         * @param {object} error - The error object
         * @param {object} response - An object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + data._id), data: data, type: 'PUT'}, function(err,result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Delete record by ID ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Delete_objects_by_IDs or records by ids}) of particular class ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Delete_object read more})
     * @memberof QB.data
     * @param {string} className - A class name of record (records)
     * @param {(string|array)} id - An ID of record (or an array of records' ids) to delete
     * @param {deleteDataByIdsCallback} callback - The deleteDataByIdsCallback function
     */
    delete: function(className, id, callback) {
        /**
         * Callback for QB.data.delete(className, id, callback)
         * @callback deleteDataByIdsCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + id), type: 'DELETE', dataType: 'text'},
            function(err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback (err, true);
                }
            });
    },

    /**
     * Upload file to file field ({@link https://quickblox.com/developers/Custom_Objects#Upload.2FUpdate_file read more})
     * @memberof QB.data
     * @param {string} className - A class name to which a new object belongs
     * @param {object} params - Object of parameters
     * @param {string} [params.field_name] - The file's field name
     * @param {string} [params.name] - The file's name
     * @param {object} [params.file] - File object
     * @param {uploadFileToDataCallback} callback - The uploadFileToDataCallback function
     */
    uploadFile: function(className, params, callback) {
        /**
         * Callback for QB.data.uploadFile(className, params, callback)
         * @callback uploadFileToDataCallback
         * @param {object} error - The error object
         * @param {object} response - The file object
         */
        var formData;

        if (isBrowser) {
            formData = new FormData();
            formData.append('field_name', params.field_name);
            formData.append('file', params.file);
        } else {
            formData = {
                field_name: params.field_name,
                file: {
                    data: params.file,
                    name: params.name
                }
            };
        }

        this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'),
            data: formData,
            contentType: false,
            processData: false,
            type:'POST',
            isFileUpload: true
        }, function(err, result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Download file from file field by ID ({@link https://quickblox.com/developers/Custom_Objects#Download_file read more})
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} params - Object of parameters
     * @param {string} params.field_name - The file's field name
     * @param {string} params.id - The record's ID
     * @param {downloadFileFromDataCallback} callback - The downloadFileFromDataCallback function
     */
    downloadFile: function(className, params, callback) {
        /**
         * Callback for QB.data.downloadFile(className, params, callback)
         * @callback downloadFileFromDataCallback
         * @param {object} error - The error object
         * @param {object} response - The file object
         */
        var result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');
        result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;
        callback(null, result);
    },

    /**
     * Return file's URL from file field by ID
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} params - Object of parameters
     * @param {string} params.field_name - The file's field name
     * @param {string} params.id - The record's ID
     */
    fileUrl: function(className, params) {
        var result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');
        result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;
        return result;
    },

    /**
     * Delete file from file field by ID ({@link https://quickblox.com/developers/Custom_Objects#Delete_file read more})
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} params - Object of parameters
     * @param {string} params.field_name - The file's field name
     * @param {string} params.id - The record's ID
     * @param {deleteFileFromDataCallback} callback - The deleteFileFromDataCallback function
     */
    deleteFile: function(className, params, callback) {
        /**
         * Callback for QB.data.deleteFile(className, params, callback)
         * @callback deleteFileFromDataCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'), data: {field_name: params.field_name},
            dataType: 'text', type: 'DELETE'}, function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback (err, true);
            }
        });
    }

};

module.exports = DataProxy;
