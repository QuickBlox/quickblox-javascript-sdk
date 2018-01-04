'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Push Notifications Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var isBrowser = typeof window !== "undefined";

function PushNotificationsProxy(service) {
    this.service = service;
    this.subscriptions = new SubscriptionsProxy(service);
    this.events = new EventsProxy(service);

    this.base64Encode = function(str) {
        if (isBrowser) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        } else {
            return new Buffer(str).toString('base64');
        }
    };
}

/**
 * Push Notifications Subscriptions
 * @namespace QB.pushnotifications.subscriptions
 **/
function SubscriptionsProxy(service){
    this.service = service;
}

SubscriptionsProxy.prototype = {

    /**
     * Create device based subscription (subscribes) ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Create_subscription read more})
     * @memberof QB.pushnotifications.subscriptions
     * @param {object} params - Object of parameters
     * @param {string} params.notification_channel - Declare which notification channels could be used to notify user about events. Allowed values: apns, apns_voip, gcm, mpns, bbps and email
     * @param {object} params.push_token - Object of parameters
     * @param {string} params.push_token.environment - Determine application mode. It allows conveniently separate development and production modes. Allowed values: evelopment or production
     * @param {string} [params.push_token.bundle_identifier] - A unique identifier for client's application. In iOS, this is the Bundle Identifier. In Android - package id
     * @param {string} params.push_token.client_identification_sequence - Identifies client device in 3-rd party service like APNS, GCM/FCM, BBPS or MPNS. Initially retrieved from 3-rd service and should be send to QuickBlox to let it send push notifications to the client
     * @param {object} params.device - Object of parameters
     * @param {string} params.device.platform - Platform of device, which is the source of application running. Allowed values: ios, android, windows_phone, blackberry
     * @param {string} params.device.udid - UDID (Unique Device identifier) of device, which is the source of application running. This must be anything sequence which uniquely identify particular device. This is needed to support schema: 1 User - Multiple devices
     * @param {createPushSubscriptionCallback} callback - The createPushSubscriptionCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.pushnotifications.subscriptions.create(params, callback)
         * @callback createPushSubscriptionCallback
         * @param {object} error - The error object
         * @param {object} response - Array of all existent user's subscriptions
         */
        this.service.ajax({url: Utils.getUrl(config.urls.subscriptions), type: 'POST', data: params}, callback);
    },

    /**
     * Retrieve subscriptions for the user which is specified in the session token ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Retrieve_subscriptions read more})
     * @memberof QB.pushnotifications.subscriptions
     * @param {listPushSubscriptionCallback} callback - The listPushSubscriptionCallback function
     */
    list: function(callback) {
        /**
         * Callback for QB.pushnotifications.subscriptions.list(callback)
         * @callback listPushSubscriptionCallback
         * @param {object} error - The error object
         * @param {object} response - Array of all existent user's subscriptions
         */
        this.service.ajax({url: Utils.getUrl(config.urls.subscriptions)}, callback);
    },

    /**
     * Remove a subscription by its identifier (unsubscribes) ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Remove_subscription read more})
     * @memberof QB.pushnotifications.subscriptions
     * @param {number} id - An id of subscription to remove
     * @param {deletePushSubscriptionCallback} callback - The deletePushSubscriptionCallback function
     */
    delete: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.subscriptions.delete(id, callback)
         * @callback deletePushSubscriptionCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        var attrAjax = {
            'type': 'DELETE',
            'dataType': 'text',
            'url': Utils.getUrl(config.urls.subscriptions, id)
        };

        this.service.ajax(attrAjax, function(err, res){
            if (err) {
                callback(err, null);
            } else {
                callback(null, true);
            }
        });
    }
};

/**
 * Push Notifications Events
 * @namespace QB.pushnotifications.events
 **/
function EventsProxy(service){
    this.service = service;
}

EventsProxy.prototype = {
    /**
     * Create notification event. This request will immediately produce notification delivery (push notification or email) ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Create_event read more})
     * @memberof QB.pushnotifications.events
     *
     * @param {object} params - Object of parameters
     * @param {string} params.notification_type - Type of notification. Allowed values: push or email
     * @param {string} params.environment - An environment of the notification. Allowed values: development or production
     * @param {string} params.message - A payload of event. For push notifications: if event[push_type] not present - should be Base64 encoded text. if event[push_type] specified - should be formatted as described in {@link https://quickblox.com/developers/Messages#Push_Notification_Formats QuickBlox Push Notifications Formats} For email: Base64 encoded text
     *
     * @param {string} [params.push_type] - Push Notification type. Used only if event[notification_type] = push, ignored in other cases. If not present - Notification will be delivered to all possible devices for specified users. Each platform has their own standard format. See {@link https://quickblox.com/developers/Messages#Push_Notification_Formats QuickBlox Push Notifications Formats} for more information. If specified - Notification will be delivered to the specified platform only. Allowed values: apns, apns_voip, gcm, mpns or bbps
     * @param {string} [params.event_type] - Allowed values: one_shot, fixed_date or period_date. one_shot - a one-time event, which causes by an external object (the value is only valid if the 'date' is not specified). fixed_date - a one-time event, which occurs at a specified 'date' (the value is valid only if the 'date' is given). period_date - reusable event that occurs within a given 'period' from the initial 'date' (the value is only valid if the 'period' specified). By default: fixed_date, if 'date' is specified. period_date, if 'period' is specified. one_shot, if 'date' is not specified
     * @param {string} [params.name] - The name of the event. Service information. Only for your own usage
     * @param {number} [params.period] - The period of the event in seconds. Required if the event[event_type] = period_date. Possible values: 86400 (1 day). 604800 (1 week). 2592000 (1 month). 31557600 (1 year)
     * @param {number} [params.date] - The date of the event to send on. Required if event[event_type] = fixed_date or period_date. If event[event_type] = fixed_date, the date can not be in the pas
     *
     * @param {object} [params.user] - User's object of parameters
     * @param {number[]} [params.user.ids] - Notification's recipients - should contain a string of users' ids divided by commas
     * @param {object} [params.user.tags] - User's object of tags
     * @param {string[]} [params.user.tags.any] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) must have at least one tag that specified in the list
     * @param {string[]} [params.user.tags.all] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) must exactly have only all tags that specified in list
     * @param {string[]} [params.user.tags.exclude] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) mustn't have tags that specified in list
     *
     * @param {object} [params.external_user] - External user's object of parameters
     * @param {number[]} [params.external_user.ids] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) mustn't have tags that specified in list
     *
     * @param {createPushEventCallback} callback - The createPushEventCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.pushnotifications.events.create(params, callback)
         * @callback createPushEventCallback
         * @param {object} error - The error object
         * @param {object} response - An event object
         */
        this.service.ajax({
            'url': Utils.getUrl(config.urls.events),
            'type': 'POST',
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true,
            'data': {
                'event': params
            }
        }, callback);
    },

    /** Get list of events which were created by current user ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Retrieve_events read more})
     * @memberof QB.pushnotifications.events
     * @param {object} params - Object of parameters
     * @param {number} [params.page=1] - Used to paginate the results when more than one page of events retrieved
     * @param {number} [params.per_page=10] - The maximum number of events to return per page, if not specified then the default is 10
     * @param {listPushEventsCallback} callback - The listOfFilesCallback function
     */
    list: function(params, callback) {
        /**
         * Callback for QB.pushnotifications.events.list(params, callback)
         * @callback listPushEventsCallback
         * @param {object} error - The error object
         * @param {object} response - An array of events' objects
         */
        if (typeof params === 'function' && typeof callback ==='undefined') {
            callback = params;
            params = null;
        }

        this.service.ajax({url: Utils.getUrl(config.urls.events), data: params}, callback);
    },

    /** Retrieve an event by ID ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Retrieve_event read more})
     * @memberof QB.pushnotifications.events
     * @param {number} id - An id of event to retrieve
     * @param {getPushEventByIdCallback} callback - The getPushEventByIdCallback function
     */
    get: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.events.get(id, callback)
         * @callback getPushEventByIdCallback
         * @param {object} error - The error object
         * @param {object} response - An array of events' objects
         */
        this.service.ajax({url: Utils.getUrl(config.urls.events, id)}, callback);
    },

    /** Delete an event by ID ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Delete_event read more})
     * @memberof QB.pushnotifications.events
     * @param {number} id - An id of event to delete
     * @param {deletePushEventByIdCallback} callback - The deletePushEventByIdCallback function
     */
    delete: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.events.delete(id, callback)
         * @callback deletePushEventByIdCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        this.service.ajax({url: Utils.getUrl(config.urls.events, id), dataType: 'text', type: 'DELETE'}, callback);
    },

    /** Retrieve an event's status by ID
     * @memberof QB.pushnotifications.events
     * @param {number} id - An id of event to retrieve its status
     * @param {getPushEventStatusByIdCallback} callback - The getPushEventStatusByIdCallback function
     */
    status: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.events.status(id, callback)
         * @callback getPushEventStatusByIdCallback
         * @param {object} error - The error object
         * @param {object} response - An array of events' objects
         */
        this.service.ajax({url: Utils.getUrl(config.urls.events, id + '/status')}, callback);
    }
};

module.exports = PushNotificationsProxy;
