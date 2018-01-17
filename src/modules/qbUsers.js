'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Users Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var DATE_FIELDS = ['created_at', 'updated_at', 'last_request_at'];
var NUMBER_FIELDS = ['id', 'external_user_id'];

var resetPasswordUrl = config.urls.users + '/password/reset';

/**
 * @namespace QB.users
 **/
function UsersProxy(service) {
    this.service = service;
}

UsersProxy.prototype = {

    /**
     * Call this API to get a list of current users of you app. By default it returns upto 10 users, but you can change this by adding pagination parameters. You can filter the list of users by supplying a filter string. You can sort results by ask/desc ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_Users read more})
     * @memberof QB.users
     * @param {object} params - Object of parameters
     * @param {number} [params.page=1] - Used to paginate the results when more than one page of users retrieved
     * @param {number} [params.per_page=10] - The maximum number of users to return per page, if not specified then the default is 10
     * @param {string} [params.filter] - You can filter the list of users by supplying a {@link https://quickblox.com/developers/Users#Filters filter string}. Possible operators: gt, lt, ge, le, eq, ne, between, in. Allowed fields' types: string,number,date. Allowed fields: id, full_name, email, login, phone, website, created_at, updated_at, last_request_at, external_user_id, twitter_id, twitter_digits_id, facebook_id (example: 'field_type+field_name+operator+value')
     * @param {string} [params.order] - Parameter to sort results. Possible values: asc and desc. Allowed fields' types: string,number,date. Allowed fields: id, full_name, email, login, phone, website, created_at, updated_at, last_request_at, external_user_id, twitter_id, twitter_digits_id, facebook_id ('asc+date+created_at' (format is 'sort_type+field_type+field_name'))
     * @param {listUsersCallback} callback - The listUsersCallback function
     */
    listUsers: function(params, callback) {
        /**
         * Callback for QB.users.listUsers(params, callback)
         * @callback listUsersCallback
         * @param {object} error - The error object
         * @param {object} response - Object with Array of users
         */
        var message = {}, filters = [], item;

        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = {};
        }

        if (params && params.filter) {
            if (Utils.isArray(params.filter)) {
                params.filter.forEach(function(el) {
                    item = generateFilter(el);
                    filters.push(item);
                });
            } else {
                item = generateFilter(params.filter);
                filters.push(item);
            }
            message.filter = filters;
        }

        if (params.order) {
            message.order = generateOrder(params.order);
        }

        if (params.page) {
            message.page = params.page;
        }

        if (params.per_page) {
            message.per_page = params.per_page;
        }

        this.service.ajax({
            url: Utils.getUrl(config.urls.users), data: message}, callback);
    },

    /**
     * Retrieve a specific user or users
     * @memberof QB.users
     * @param {(number|object)} params - {@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_id User ID} (number) or object of parameters (object with one of next required properties)
     * @param {string} params.login - The login of the user to be retrieved ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_login read more})
     * @param {string} params.full_name - The full name of users to be retrieved ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_full_name read more})
     * @param {string} params.facebook_id - The user's facebook uid ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_Facebook_id read more})
     * @param {string} params.twitter_id - The user's twitter uid ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_Twitter_id read more})
     * @param {string} params.phone - The user's phone number
     * @param {string} params.email - The user's email address ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_email read more})
     * @param {(string|string[])} params.tags - A comma separated list of tags associated with users ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_users_by_tags read more})
     * @param {(number|string)} params.external - An uid that represents the user in an external user registry ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_external_user_id read more})
     * @param {string} [params.page=1] - Used to paginate the results when more than one page of users retrieved (can be used with get by 'full_name' or 'tags')
     * @param {string} [params.per_page=10] - The maximum number of users to return per page, if not specified then the default is 10 (can be used with get by 'full_name' or 'tags')
     * @param {getUsersCallback} callback - The getUsersCallback function
     * @example
     * var params = {'email': 'example-email@gmail.com'};
     *
     * // for search by 'full_name' or 'tags':
     * // var params = {
     * //     'full_name': 'test_user',
     * //     'page': 2,
     * //     'per_page': 25
     * // };
     *
     * // for search by user's ID:
     * // var id = 53454;
     *
     * // use params or id to get records:
     * QB.users.get(params, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    get: function(params, callback) {
        /**
         * Callback for QB.users.get(params, callback)
         * @callback getUsersCallback
         * @param {object} error - The error object
         * @param {object} response - The user object or object with Array of users
         */
        var url;

        if (typeof params === 'number') {
            url = params;
            params = {};
        } else {
            if (params.login) {
                url = 'by_login';
            } else if (params.full_name) {
                url = 'by_full_name';
            } else if (params.facebook_id) {
                url = 'by_facebook_id';
            } else if (params.twitter_id) {
                url = 'by_twitter_id';
            } else if (params.phone) {
                url = 'phone';
            } else if (params.email) {
                url = 'by_email';
            } else if (params.tags) {
                url = 'by_tags';
            } else if (params.external) {
                url = 'external/' + params.external;
                params = {};
            }
        }

        this.service.ajax({url: Utils.getUrl(config.urls.users, url), data: params},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res.user || res);
                }
            });
    },

    /**
     * Registers a new app user. Call this API to register a user for the app. You must provide either a user login or email address along with their password, passing both email address and login is permitted but not required ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Sign_Up read more})
     * @memberof QB.users
     * @param {object} params - object of user's parameters
     * @param {string} params.login - The user's login name
     * @param {string} params.password - The user's password for this app
     * @param {string} params.email - The user's email address
     * @param {string} [params.full_name] - The user's full name
     * @param {string} [params.phone] - The user's phone number
     * @param {string} [params.website] - The user's web address, or other url
     * @param {string} [params.facebook_id] - The user's facebook uid
     * @param {string} [params.twitter_id] - The user's twitter uid
     * @param {number} [params.blob_id] - The id of an associated blob for this user, for example their photo
     * @param {(number|string)} [params.external_user_id] - An uid that represents the user in an external user registry
     * @param {(string|string[])} [params.tag_list] - A comma separated list of tags associated with the user. Set up user tags and address them separately in your app
     * @param {string} [params.custom_data] - The user's additional info
     * @param {createUserCallback} callback - The createUserCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.users.create(params, callback)
         * @callback createUserCallback
         * @param {object} error - The error object
         * @param {object} response - The user object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.users), type: 'POST', data: {user: params}},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res.user);
                }
            });
    },

    /**
     * Update current user. In normal usage, nobody except the user is allowed to modify their own data. Any fields you don’t specify will remain unchanged, so you can update just a subset of the user’s data. login/email and password may be changed, but the new login/email must not already be in use ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Update_current_user read more})
     * @memberof QB.users
     * @param {number} id - The id of user to update
     * @param {object} params - object of user's parameters
     * @param {string} [params.login] - The user's login name
     * @param {string} [params.old_password] - The user's old password for this app
     * @param {string} [params.password] - The user's new password for this app
     * @param {string} [params.email] - The user's email address
     * @param {string} [params.full_name] - The user's full name
     * @param {string} [params.phone] - The user's phone number
     * @param {string} [params.website] - The user's web address, or other url
     * @param {string} [params.facebook_id] - The user's facebook uid
     * @param {string} [params.twitter_id] - The user's twitter uid
     * @param {number} [params.blob_id] - The id of an associated blob for this user, for example their photo
     * @param {(number|string)} [params.external_user_id] - An uid that represents the user in an external user registry
     * @param {(string|string[])} [params.tag_list] - A comma separated list of tags associated with the user. Set up user tags and address them separately in your app
     * @param {string} [params.custom_data] - The user's additional info
     * @param {updateUserCallback} callback - The updateUserCallback function
     */
    update: function(id, params, callback) {
        /**
         * Callback for QB.users.update(id, params, callback)
         * @callback updateUserCallback
         * @param {object} error - The error object
         * @param {object} response - The user object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.users, id), type: 'PUT', data: {user: params}},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res.user);
                }
            });
    },

    /**
     * Remove a user from the app, {@link https://docsdev.quickblox.com/rest_api/Users_API.html#Delete_user_by_id by user's id} or {@link https://docsdev.quickblox.com/rest_api/Users_API.html#Delete_user_by_external_user_id uid that represents the user in an external user registry}
     * @memberof QB.users
     * @param {(number|object)} params - An id of user to remove or object with external user id
     * @param {(number|string)} params.external - An id of user to remove or object with external user id
     * @param {deleteUserCallback} callback - An uid that represents the user in an external user registry
     * @example
     * // parameter as user id:
     * var params = 567831;
     *
     * // parameter as external user id:
     * // var params = {'external': 'ebdf831abd12da4bcf12f22d'};
     *
     * QB.users.delete(params, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    delete: function(params, callback) {
        /**
         * Callback for QB.users.delete(params, callback)
         * @callback deleteUserCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        var url;

        if (typeof params === 'number') {
            url = params;
        } else {
            if (params.external) {
                url = 'external/' + params.external;
            }
        }

        this.service.ajax({url: Utils.getUrl(config.urls.users, url), type: 'DELETE', dataType: 'text'}, callback);
    },

    /**
     * You can initiate password resets for users who have emails associated with their account. Password reset instruction will be sent to this email address ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Password_reset read more})
     * @memberof QB.users
     * @param {string} email - The user's email to send reset password instruction
     * @param {resetPasswordByEmailCallback} callback - The resetPasswordByEmailCallback function
     */
    resetPassword: function(email, callback) {
        /**
         * Callback for QB.users.resetPassword(email, callback)
         * @callback resetPasswordByEmailCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        this.service.ajax({url: Utils.getUrl(resetPasswordUrl), data: {email: email}, dataType: 'text'}, callback);
    }

};

module.exports = UsersProxy;

/* Private
---------------------------------------------------------------------- */
function generateFilter(obj) {
    var type = obj.field in DATE_FIELDS ? 'date' : typeof obj.value;

    if (Utils.isArray(obj.value)) {
        if (type === 'object') {
            type = typeof obj.value[0];
        }
        obj.value = obj.value.toString();
    }

    return [type, obj.field, obj.param, obj.value].join(' ');
}

function generateOrder(obj) {
    var type = obj.field in DATE_FIELDS ? 'date' : obj.field in NUMBER_FIELDS ? 'number' : 'string';
    return [obj.sort, type, obj.field].join(' ');
}
