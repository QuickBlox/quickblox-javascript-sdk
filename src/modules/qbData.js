'use strict';

var config = require('../qbConfig');
var Utils = require('../qbUtils');

/**
 * Custom Objects Module
 * @namespace QB.data
 **/
function DataProxy(service){
    this.service = service;
}

DataProxy.prototype = {
    /**
     * Create new custom object ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Create_object read more})
     * 
     * @memberof QB.data
     * 
     * @param {string} className - A class name to which a new object belongs
     * @param {object} data - Object of parameters (custom fields' names and their values)
     * @param {createDataCallback} callback - The createDataCallback function
     * 
     * @example
     * var data = {
     *     'name': 'John',
     *     'age':'20',
     *     'family': [
     *         'Stark',
     *         'Targaryen'
     *     ]
     * };
     * 
     * function createdDataCallback(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * }
     * 
     * QB.data.create('GameOfThrones', data, createdDataCallback);
     */
    create: function(className, data, callback) {
        /**
         * Callback for QB.data.create(className, data, callback)
         * @callback createDataCallback
         * @param {object} error - The error object
         * @param {object} response - An object
         */
        var ajaxParams = {
            'type': 'POST',
            'data': data,
            'isNeedStringify': true,
            'contentType': 'application/json; charset=utf-8',
            'url': Utils.getUrl(config.urls.data, className)
        };

        this.service.ajax(ajaxParams, function(err,res) {
            if (err) {
                callback(err, null);
            } else {
                callback (err, res);
            }
        });
    },

    /**
     * Search for records of particular class ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects read more})
     * 
     * @memberof QB.data
     * 
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
     * Update record by ID of particular class. ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects Read more})
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
        this.service.ajax({
            'url': Utils.getUrl(config.urls.data, className + '/' + data._id),
            'type': 'PUT',
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true,
            'data': data
        }, function(err,result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Delete record / records by ID, IDs or criteria (filters) of particular class. <br />
     * Check out {@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Delete_object official documentaion} to get detailed information.
     * 
     * @memberof QB.data
     * 
     * @param {string} className - A class name of record
     * @param {(string|array|object)} requestedData - An ID of record or an array of record's ids or object of criteria rules to delete
     * @param {deletedDataCallback} callback - The deletedDataCallback function
     * 
     * @example
     * var className = 'Movie';
     * 
     * function deletedMovie(error, responce) {
     *   if(error) {
     *     throw new Error(error.toString());
     *   } else {
     *     console.log(`Deleted movies with ids: ${responce.deleted.toString()}`);
     *   }
     * }
     * 
     * // By ID, must be string
     * var id = '502f7c4036c9ae2163000002';
     * QB.data.delete(className, id, deletedMovie);
     * 
     * // By IDs, must be array
     * var ids = ['502f7c4036c9ae2163000002', '502f7c4036c9ae2163000003'];
     * QB.data.delete(className, ids, deletedMovie);
     * 
     * var criteria = { 'price': { 'gt': 100 };
     * function deletedMoviesByCriteria(error, responce) {
     *   if(error) {
     *      throw new Error(error.toString());
     *   } else {
     *      // Note! Deleted by creteria doesn't return ids of deleted objects
     *      console.log(`Deleted ${responce.deletedCount} movies`);
     *   }
     * }
     * QB.data.delete(className, criteria, deletedMoviesByCriteria);
     * 
     * 
     */
    delete: function(className, requestedData, callback) {
        /**
         * Callback for QB.data.delete(className, requestedData, callback)
         * @callback deletedDataCallback
         * @param {object} error - The error object
         * @param {object|null} response
         * @param {array} response.deleted - Array of ids of deleted records. If you delete BY CRITERIA this property will be null.
         * @param {number} response.deletedCount - count of deleted records.
         */
        var typesData = {
            id: 1,
            ids: 2,
            criteria: 3
        };

        var requestedTypeOf;

        var responceNormalized = {
            deleted: [],
            deletedCount: 0
        };

        var ajaxParams = {
            type: 'DELETE',
            dataType: 'text'
        };

        /** Define what type of data passed by client */
        if(typeof requestedData === 'string') {
            requestedTypeOf = typesData.id;
        } else if(Utils.isArray(requestedData)) {
            requestedTypeOf = typesData.ids;
        } else if(Utils.isObject(requestedData)) {
            requestedTypeOf = typesData.criteria;
        }

        if(requestedTypeOf === typesData.id) {
            ajaxParams.url = Utils.getUrl(config.urls.data, className + '/' + requestedData);
        } else if(requestedTypeOf === typesData.ids) {
            ajaxParams.url = Utils.getUrl(config.urls.data, className + '/' + requestedData.toString());
        } else if(requestedTypeOf === typesData.criteria) {
            ajaxParams.url = Utils.getUrl(config.urls.data, className + '/by_criteria');
            ajaxParams.data = requestedData;
        }

        function handleDeleteCO(error, result) {
            if (error) {
                callback(error, null);
            } else {
                var response;

                if(requestedTypeOf === typesData.id) {
                    responceNormalized.deleted.push(requestedData);
                    responceNormalized.deletedCount = responceNormalized.deleted.length;
                } else if(requestedTypeOf === typesData.ids) {
                    response = JSON.parse(result);
                    responceNormalized.deleted = response.SuccessfullyDeleted.ids.slice(0);
                    responceNormalized.deletedCount = responceNormalized.deleted.length;
                } else if(requestedTypeOf === typesData.criteria) {
                    response = JSON.parse(result);
                    responceNormalized.deleted = null;
                    responceNormalized.deletedCount = response.total_deleted;
                }

                callback (error, responceNormalized);
            }
        }

        this.service.ajax(ajaxParams, handleDeleteCO);
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
        var data = {
                field_name: params.field_name,
                file: {
                    data: params.file,
                    name: params.name
                }
            };

        this.service.ajax({
            'url': Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'),
            'type': 'POST',
            'fileToCustomObject': true,
            'contentType': false,
            'data': data,
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
