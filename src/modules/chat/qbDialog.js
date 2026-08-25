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
     * Retrieve list of dialogs({@link https://docs.quickblox.com/docs/js-chat-dialogs#retrieve-list-of-dialogs read more}).
     * @memberof QB.chat.dialog
     * @param {Object} params - Some filters to get only chat dialogs you need.
     * @param {listDialogCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.list().
         * @param {Object} error - The error object.
         * @param {Object} resDialogs - the dialog list.
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
     * Create new dialog({@link https://docs.quickblox.com/reference/create-dialog read more}).
     * @memberof QB.chat.dialog
     * @param {Object} params - Object of parameters.
     * @param {Number[]|String} [params.admin_ids] - IDs of dialog admins for public/group dialogs.
     * Ignored by the backend for private dialogs.
     * @param {createDialogCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.create().
         * @param {Object} error - The error object.
         * @param {Object} createdDialog - the dialog object.
         * @callback createDialogCallback
         * */

        if (params && params.occupants_ids && Utils.isArray(params.occupants_ids)) {
            params.occupants_ids = params.occupants_ids.join(', ');
        }

        if (params && params.admin_ids && Utils.isArray(params.admin_ids)) {
            params.admin_ids = params.admin_ids.join(', ');
        }

        if (params && params.is_join_required !== undefined && params.is_join_required !== null) {
            if (params.is_join_required !== 0 && params.is_join_required !== 1) {
                Utils.QBLog('[QBChat]', 'Warning: is_join_required must be 0 or 1, got: ' +
                    params.is_join_required + '. Parameter ignored.');
                delete params.is_join_required;
            }
        }

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL),
            type: 'POST',
            data: params
        }, callback);
    },

    /**
     * Update group dialog({@link https://docs.quickblox.com/reference/update-dialog read more}).
     * @memberof QB.chat.dialog
     * @param {String} id - The dialog ID.
     * @param {Object} params - Object of parameters.
     * @param {Number[]|String} [params.admin_ids] - Full replacement list of dialog admins.
     * @param {Object} [params.push_all] - Incremental fields to append, including admin_ids.
     * @param {Object} [params.pull_all] - Incremental fields to remove, including admin_ids.
     * @param {updateDialogCallback} callback - The callback function.
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.dialog.update()
         * @param {Object} error - The error object.
         * @param {Object} res - the dialog object.
         * @callback updateDialogCallback
         * */

        if (params && params.is_join_required !== undefined) {
            Utils.QBLog('[QBChat]', 'Warning: is_join_required is not supported in dialog.update(). Parameter ignored.');
            delete params.is_join_required;
        }

        this.service.ajax({
            'url': Utils.getUrl(DIALOGS_API_URL, id),
            'type': 'PUT',
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true,
            'data': params
        }, callback);
    },

    /**
     * Delete a dialog or dialogs({@link https://docs.quickblox.com/docs/js-chat-dialogs#delete-dialog read more}).
     * @memberof QB.chat.dialog
     * @param {Array} id - The dialog IDs array.
     * @param {Object | function} params_or_callback - Object of parameters or callback function.
     * @param {deleteDialogCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.dialog.delete().
         * @param {Object} error - The error object.
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
