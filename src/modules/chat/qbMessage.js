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
     * get a chat history. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#List_chat_messages More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {listMessageCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.message.list()
         * @param {Object} error - The error object
         * @param {Object} messages - The messages object.
         * @callback listMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            data: params
        }, callback);
    },

    /**
     * Create message. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Put_chat_messages_to_history More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {createMessageCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.message.create()
         * @param {Object} error - The error object
         * @param {Object} messages - The message object.
         * @callback createMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            type: 'POST',
            data: params
        }, callback);
    },

    /**
     * Update message. {@link https://docsdev.quickblox.com/rest_api/Chat_API.html#Update_message More info.}
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters
     * @param {Number} [params.read] - Mark message as read (read=1)
     * @param {Number} [params.delivered] - Mark message as delivered (delivered=1)
     * @param {String} [params.message] - The message's text
     * @param {updateMessageCallback} callback - The callback function
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.message.update()
         * @param {Object} error - The error object
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
     * Delete message. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_chat_messages More info.}
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters.
     * @param {deleteMessageCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.message.delete()
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
     * Get unread messages counter for one or group of dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Unread_messages_count More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {unreadCountMessageCallback} callback - The callback function.
     * */
    unreadCount: function(params, callback) {
        /**
         * Callback for QB.chat.message.unreadCount()
         * @param {Object} error - The error object.
         * @param {Object} res - The requested dialogs Object.
         * @callback unreadCountMessageCallback
         * */

        if (params && params.chat_dialog_ids && Utils.isArray(params.chat_dialog_ids)) {
            params.chat_dialog_ids = params.chat_dialog_ids.join(', ');
        }

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL + '/unread'),
            data: params
        }, callback);
    }
};

module.exports = MessageProxy;
