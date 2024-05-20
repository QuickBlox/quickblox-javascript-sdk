'use strict';

var Utils = require('../qbUtils');

var AI_API_URL = 'ai/ai_extensions';

function AIProxy(service) {
    this.service = service;
}

/**
 * @namespace QB.ai
 **/
AIProxy.prototype = {
    /**
     * Provides answer assistant functionality that helps users effortlessly send various answers considering({@link https://docs.quickblox.com/docs/js-sdk-ai-features#ai-assist-answer read more}).
     * @memberof QB.ai
     * @param {String} smartChatAssistantId - Smart Chat Assistant id.
     * @param {String} message - Message you want to get answer for.
     * @param {Object[]} history - Conversation history. Used to add context.
     * @param {answerAssistCallback} callback - The callback function.
     * @example
     *  var history = [
     *                     {role: "user", message: "Hello"},
     *                     {role: "assistant", message: "Hi"}
     *                ];
     *  var messageToAssist = 'Where is my order?';
     *  QB.ai.answerAssist(smartChatAssistantId, messageToAssist, history, callback);
     *  // or third parameters can be null
     *  QB.ai.answerAssist(smartChatAssistantId, messageToAssist, null, callback);
     * */
    answerAssist: function(smartChatAssistantId, message, history, callback) {
        /**
         * Callback for QB.ai.answerAssist().
         * @param {Object} error - The error object.
         * @param {Object} response - The server response object.
         * @param {String} [response.answer] - assist answer for message
         * @callback answerAssistCallback
         * */
        if (!callback || typeof callback !== 'function') {
            throw new Error('Callback function is required and must be a function');
        }
        function validateHistory(history) {
            var AIRole = {
                user: 'user',
                assistant: 'assistant'
            };
            if (history !== null && history !== undefined) {
                if (!Array.isArray(history)) {
                    throw new Error('History must be an array');
                }
                for (var i = 0; i < history.length; i++) {
                    var item = history[i];
                    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                        throw new Error('Each element of history must be an object');
                    }
                    if (!('role' in item) || !('message' in item)) {
                        throw new Error('Each element of history must have an role and message fields');
                    }
                    if (!(item.role === AIRole.user || item.role === AIRole.assistant)) {
                        throw new Error('Invalid role in history item');
                    }
                    if (typeof item.message !== 'string') {
                        throw new Error('Message of history item must be a string');
                    }
                }
            }
            return true;
        }
        if (!validateHistory(history)) {
            return;
        }

        var data = history ? {
            smart_chat_assistant_id: smartChatAssistantId,
            message: message,
            history: history,
        }:{
            smart_chat_assistant_id: smartChatAssistantId,
            message: message,
        };
        var attrAjax = {
            'type': 'POST',
            'url': Utils.formatUrl(AI_API_URL + '/ai_answer_assist'),
            'data': data,
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true
        };
        this.service.ajax(attrAjax, callback);
    },

    /**
     * Offers translation functionality that helps users easily translate text messages in chat({@link https://docs.quickblox.com/docs/js-sdk-ai-features#ai-translate read more}).
     * @memberof QB.ai
     * @param {String} smartChatAssistantId - Smart Chat Assistant id.
     * @param {String} text - Text to translate.
     * @param {String} languageCode - Translation language code. All list see on page: {@link https://docs.quickblox.com/docs/js-sdk-ai-features#ai-translate }
     * @param {translateCallback} callback - The callback function.
     *
     * */

    translate: function(smartChatAssistantId, text, languageCode, callback) {
        /**
         * Callback for QB.ai.translate().
         * @param {Object} error - The error object.
         * @param {Object} response - The server response object.
         * @param {String} [response.answer] - translated message
         * @callback translateCallback
         * @example
         *  var textToTranslate = 'Hola!';
         *  var languageCode = 'en';
         *  QB.ai.translate(smartChatAssistantId, textToTranslate, languageCode, callback);
         * */
        if (!callback || typeof callback !== 'function') {
            throw new Error('Callback function is required and must be a function');
        }
        var data =  {
            smart_chat_assistant_id: smartChatAssistantId,
            text: text,
            to_language: languageCode || 'en',
        };
        var attrAjax = {
            'type': 'POST',
            'url': Utils.formatUrl(AI_API_URL + '/ai_translate'),
            'data': data,
        };

        this.service.ajax(attrAjax, callback);
    },


};

module.exports = AIProxy;
