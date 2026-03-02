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

    /**
     * AI Gateway - multimodal AI endpoint supporting text and images in OpenAI-compatible format
     * ({@link https://docs.quickblox.com/reference/ai-extensions-ai-gateway read more}).
     * @memberof QB.ai
     * @param {String} smartChatAssistantId - Smart Chat Assistant id.
     * @param {Object[]} messages - Array of message objects. Each message has:
     *   - role: 'user' | 'assistant' | 'developer'
     *   - content: Array of content items (text or image_url)
     * @param {Object} [options] - Optional configuration.
     * @param {String} [options.apiKey] - API key for authorization (alternative to session token).
     * @param {gatewayCallback} callback - The callback function.
     * @example
     *  var messages = [
     *      {
     *          role: 'user',
     *          content: [
     *              { type: 'text', text: 'What is in this image?' },
     *              { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }
     *          ]
     *      }
     *  ];
     *  QB.ai.gateway(smartChatAssistantId, messages, function(err, res) {
     *      console.log(res.answer);
     *  });
     *  // With API key:
     *  QB.ai.gateway(smartChatAssistantId, messages, { apiKey: 'your_api_key' }, callback);
     */
    gateway: function(smartChatAssistantId, messages, optionsOrCallback, callback) {
        /**
         * Callback for QB.ai.gateway().
         * @param {Object} error - The error object.
         * @param {Object} response - The server response object.
         * @param {String} [response.answer] - AI generated response.
         * @callback gatewayCallback
         */

        // Handle optional options parameter
        var options, cb;
        if (typeof optionsOrCallback === 'function') {
            cb = optionsOrCallback;
            options = {};
        } else {
            options = optionsOrCallback || {};
            cb = callback;
        }

        // Validate callback
        if (!cb || typeof cb !== 'function') {
            throw new Error('Callback function is required and must be a function');
        }

        // Validate smartChatAssistantId
        if (!smartChatAssistantId || typeof smartChatAssistantId !== 'string') {
            throw new Error('smartChatAssistantId is required and must be a string');
        }

        // Validate messages
        this._validateGatewayMessages(messages);

        // Build request data
        var data = {
            smart_chat_assistant_id: smartChatAssistantId,
            messages: messages
        };

        // Build ajax options
        var attrAjax = {
            'type': 'POST',
            'url': Utils.formatUrl(AI_API_URL + '/ai_gateway'),
            'data': data,
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true
        };

        // Add API key header if provided
        if (options.apiKey) {
            attrAjax.headers = {
                'Authorization': 'ApiKey ' + options.apiKey
            };
        }

        this.service.ajax(attrAjax, cb);
    },

    /**
     * Validate gateway messages array
     * @private
     * @param {Object[]} messages - Array of message objects to validate.
     * @throws {Error} If messages array is invalid.
     */
    _validateGatewayMessages: function(messages) {
        var validRoles = ['user', 'assistant', 'developer'];
        var validContentTypes = ['text', 'image_url'];

        if (!messages || !Array.isArray(messages)) {
            throw new Error('messages is required and must be an array');
        }

        if (messages.length === 0) {
            throw new Error('messages array cannot be empty');
        }

        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];

            // Check message is object
            if (typeof msg !== 'object' || msg === null || Array.isArray(msg)) {
                throw new Error('Each message must be an object');
            }

            // Check role
            if (!msg.role || validRoles.indexOf(msg.role) === -1) {
                throw new Error('Each message must have a valid role (user, assistant, or developer)');
            }

            // Check content - can be string or array
            if (msg.content === undefined || msg.content === null) {
                throw new Error('Each message must have content (string or array)');
            }

            // String content - simple text message
            if (typeof msg.content === 'string') {
                if (msg.content.length === 0) {
                    throw new Error('String content cannot be empty');
                }
                // String content is valid, continue to next message
                continue;
            }

            // Array content - multimodal message
            if (!Array.isArray(msg.content)) {
                throw new Error('Message content must be a string or array');
            }

            if (msg.content.length === 0) {
                throw new Error('Content array cannot be empty');
            }

            // Validate each content item
            for (var j = 0; j < msg.content.length; j++) {
                var item = msg.content[j];

                if (typeof item !== 'object' || item === null) {
                    throw new Error('Each content item must be an object');
                }

                if (!item.type || validContentTypes.indexOf(item.type) === -1) {
                    throw new Error('Each content item must have a valid type (text or image_url)');
                }

                if (item.type === 'text') {
                    if (typeof item.text !== 'string') {
                        throw new Error('Text content item must have a text string');
                    }
                } else if (item.type === 'image_url') {
                    if (!item.image_url || typeof item.image_url.url !== 'string') {
                        throw new Error('Image content item must have image_url.url string');
                    }
                }
            }
        }

        return true;
    },

    /**
     * AI Summarize - generates a summary of dialog messages (up to 1000 most recent)
     * ({@link https://docs.quickblox.com/reference/ai-extensions-ai-summarize read more}).
     * @memberof QB.ai
     * @param {String} smartChatAssistantId - Smart Chat Assistant id.
     * @param {String} dialogId - Dialog id to summarize.
     * @param {summarizeCallback} callback - The callback function.
     * @example
     *  QB.ai.summarize(smartChatAssistantId, dialogId, function(err, res) {
     *      console.log(res.summary);
     *  });
     */
    summarize: function(smartChatAssistantId, dialogId, callback) {
        /**
         * Callback for QB.ai.summarize().
         * @param {Object} error - The error object.
         * @param {Object} response - The server response object.
         * @param {String} [response.summary] - Generated summary of the dialog.
         * @callback summarizeCallback
         */

        // Validate callback
        if (!callback || typeof callback !== 'function') {
            throw new Error('Callback function is required and must be a function');
        }

        // Validate smartChatAssistantId
        if (!smartChatAssistantId || typeof smartChatAssistantId !== 'string') {
            throw new Error('smartChatAssistantId is required and must be a string');
        }

        // Validate dialogId
        if (!dialogId || typeof dialogId !== 'string') {
            throw new Error('dialogId is required and must be a string');
        }

        // Build request data
        var data = {
            smart_chat_assistant_id: smartChatAssistantId,
            dialog_id: dialogId
        };

        // Build ajax options
        var attrAjax = {
            'type': 'POST',
            'url': Utils.formatUrl(AI_API_URL + '/ai_summarize'),
            'data': data,
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true
        };

        this.service.ajax(attrAjax, callback);
    },

};

module.exports = AIProxy;
