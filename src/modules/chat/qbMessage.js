'use strict';

var config = require('../../qbConfig'),
    Utils = require('../../qbUtils');

var MESSAGES_API_URL = config.urls.chat + '/Message';

function MessageProxy(service) {
    this.service = service;
}

/**
 * @namespace QB.chat.message
 **/
MessageProxy.prototype = {
    /**
     * Get a chat history({@link https://docs.quickblox.com/docs/js-chat-messaging#retrieve-chat-history read more}).
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {Number} [params.include_reactions] - Include message reactions in the response.
     *   Allowed values: 0 (default, no reactions data) or 1 (include reactions[] per message).
     *   Reactions array shape: [{ name, count, user_ids: number[] }].
     * @param {listMessageCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.message.list().
         * @param {Object} error - The error object.
         * @param {Object} messages - The messages object.
         * @callback listMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            data: params
        }, callback);
    },

    /**
     * Create message.
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {createMessageCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.message.create().
         * @param {Object} error - The error object.
         * @param {Object} messages - The message object.
         * @callback createMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            data: params,
        }, callback);
    },

    /**
     * Update message({@link https://docs.quickblox.com/docs/js-chat-messaging#update-message read more}).
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters.
     * @param {Number} [params.read] - Mark message as read (read=1).
     * @param {Number} [params.delivered] - Mark message as delivered (delivered=1).
     * @param {String} [params.message] - The message's text.
     * @param {updateMessageCallback} callback - The callback function.
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.message.update().
         * @param {Object} error - The error object.
         * @param {Object} response - Empty body.
         * @callback updateMessageCallback
         * */

        var attrAjax = {
            'type': 'PUT',
            'dataType': 'text',
            'url': Utils.getUrl(MESSAGES_API_URL, id),
            'data': params
        };

        this.service.ajax(attrAjax, callback);
    },

    /**
     * Delete message({@link https://docs.quickblox.com/docs/js-chat-messaging#delete-message read more}).
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters.
     * @param {deleteMessageCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.message.delete().
         * @param {Object} error - The error object.
         * @param {String} res - Empty string.
         * @callback deleteMessageCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

        if (arguments.length === 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length === 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    },

    /**
     * Get a chat message by ID
     * ({@link https://docs.quickblox.com/reference/get-message-by-id read more}).
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} [params] - Optional query parameters.
     * @param {Number} [params.include_reactions] - Include message reactions in the response (0 or 1).
     * @param {getByIdMessageCallback} callback - The callback function.
     * @since 2.24.0
     * */
    getById: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.message.getById().
         * @param {Object} error - The error object.
         * @param {Object} message - The message object.
         * @callback getByIdMessageCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL, id)
        };

        if (arguments.length === 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length === 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    },

    /**
     * Add reaction to a message.
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {String} name - The reaction name.
     * @param {addReactionCallback} callback - The callback function.
     *
     * Server contract:
     *   POST /chat/Message/{id}/reactions
     *   Success: 201 Created with empty body.
     *   Errors: 400 (invalid id/name or reaction limits), 404 (message not found), 422 (public dialog).
     *
     * Idempotency note: Re-adding the same reaction by the same user returns 201 without creating a duplicate reaction.
     * */
    addReaction: function(id, name, callback) {
        /**
         * Callback for QB.chat.message.addReaction().
         * @param {Object} error - The error object.
         * @param {Object|undefined} reaction - Empty response body on success.
         * @callback addReactionCallback
         * */

        // Server returns 201 with empty body. Use dataType:'text' so qbProxy does
        // not try to JSON.parse the empty response (which throws in node-fetch).
        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL + '/' + id + '/reactions'),
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            dataType: 'text',
            data: {
                name: name
            }
        }, callback);
    },

    /**
     * Remove reaction from a message.
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {String} name - The reaction name.
     * @param {removeReactionCallback} callback - The callback function.
     *
     * Server contract:
     *   DELETE /chat/Message/{id}/reactions
     *   Success: 200 OK with empty body.
     *   Errors: 400 (invalid id/name), 404 (message not found or reaction not found).
     * */
    removeReaction: function(id, name, callback) {
        /**
         * Callback for QB.chat.message.removeReaction().
         * @param {Object} error - The error object.
         * @param {String} response - Empty body.
         * @callback removeReactionCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL + '/' + id + '/reactions'),
            type: 'DELETE',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            dataType: 'text',
            data: {
                name: name
            }
        }, callback);
    },

    /**
     * Get reactions list for a message.
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {listReactionsCallback} callback - The callback function.
     *
     * Server contract:
     *   GET /chat/Message/{id}/reactions
     *   Success: 200 OK, body { total_entries: Number, items: Array<{ name, count, user_ids[] }> }.
     *   Errors: 400 (invalid id), 404 (message not found).
     * */
    listReactions: function(id, callback) {
        /**
         * Callback for QB.chat.message.listReactions().
         * @param {Object} error - The error object.
         * @param {Object} reactions - The reactions aggregate object.
         * @callback listReactionsCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL + '/' + id + '/reactions')
        }, callback);
    },

    /**
     * Get unread messages counter for one or group of dialogs({@link https://docs.quickblox.com/docs/js-chat-dialogs#get-number-of-unread-messages read more}).
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {unreadCountMessageCallback} callback - The callback function.
     * */
    unreadCount: function(params, callback) {
        /**
         * Callback for QB.chat.message.unreadCount().
         * @param {Object} error - The error object.
         * @param {Object} res - The requested dialogs Object.
         * @callback unreadCountMessageCallback
         * */

        if (params && params.chat_dialog_ids && Utils.isArray(params.chat_dialog_ids)) {
            params.chat_dialog_ids = params.chat_dialog_ids.join();
        }

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL + '/unread'),
            data: params
        }, callback);
    }
};

module.exports = MessageProxy;
