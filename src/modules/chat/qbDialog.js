'use strict';

var config = require('../../qbConfig'),
    Utils = require('../../qbUtils');

var DIALOGS_API_URL = config.urls.chat + '/Dialog';

function DialogProxy(service) {
    this.service = service;
}

/**
 * @namespace QB.chat.dialog
 **/
DialogProxy.prototype = {
    /**
     * Retrieve list of dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Retrieve_list_of_dialogs More info.}
     * @memberof QB.chat.dialog
     * @param {Object} params - Some filters to get only chat dialogs you need.
     * @param {listDialogCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.list().
         * @param {Object} error - The error object
         * @param {Object} resDialogs - the dialog list
         * @callback listDialogCallback
         * */

        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = {};
        }

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL),
            data: params
        }, callback);
    },

    /**
     * Create new dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Create_new_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {Object} params - Object of parameters.
     * @param {createDialogCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.create().
         * @param {Object} error - The error object
         * @param {Object} createdDialog - the dialog object
         * @callback createDialogCallback
         * */

        if (params && params.occupants_ids && Utils.isArray(params.occupants_ids)) {
            params.occupants_ids = params.occupants_ids.join(', ');
        }

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL),
            type: 'POST',
            data: params
        }, callback);
    },

    /**
     * Update group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Update_group_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {String} id - The dialog ID.
     * @param {Object} params - Object of parameters.
     * @param {updateDialogCallback} callback - The callback function.
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.dialog.update()
         * @param {Object} error - The error object
         * @param {Object} res - the dialog object
         * @callback updateDialogCallback
         * */

        this.service.ajax({
            'url': Utils.getUrl(DIALOGS_API_URL, id),
            'type': 'PUT',
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true,
            'data': params
        }, callback);
    },

    /**
     * Delete a dialog or dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {Array} id - The dialog IDs array.
     * @param {Object | function} params_or_callback - Object of parameters or callback function.
     * @param {deleteDialogCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.dialog.delete()
         * @param {Object} error - The error object
         * @callback deleteDialogCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(DIALOGS_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

        if (arguments.length === 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length === 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    }
};

module.exports = DialogProxy;
