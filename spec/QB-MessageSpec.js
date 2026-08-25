'use strict';

var MessageProxy = require('../src/modules/chat/qbMessage');
var Utils = require('../src/qbUtils');

describe('QB.chat.message reactions REST API', function() {
    var messageProxy;
    var service;
    var messageId;
    var reactionsUrl;

    beforeEach(function() {
        service = {
            ajax: jasmine.createSpy('ajax')
        };
        messageProxy = new MessageProxy(service);
        messageId = '66f2a030bba14b4c2e000000';
        reactionsUrl = Utils.getUrl('chat/Message/' + messageId + '/reactions');
    });

    it('should call addReaction with POST JSON payload', function() {
        var callback = jasmine.createSpy('callback');

        messageProxy.addReaction(messageId, 'like', callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: reactionsUrl,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            dataType: 'text',
            data: {
                name: 'like'
            }
        }, callback);
    });

    it('should pass through 422 error from addReaction', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 422,
            detail: 'Reactions are not allowed in public dialogs.'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.addReaction(messageId, 'like', callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should pass through 201 success response to callback', function() {
        var callback = jasmine.createSpy('callback');

        service.ajax.and.callFake(function(params, cb) {
            cb(null, undefined);
        });

        messageProxy.addReaction(messageId, 'like', callback);

        expect(callback).toHaveBeenCalledWith(null, undefined);
    });

    it('should pass through 400 error from addReaction', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 400,
            detail: 'You have reached the maximum number of reactions (20) allowed per message.'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.addReaction(messageId, 'like', callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should pass through 404 error from addReaction', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 404,
            detail: 'Message not found for the specified user and message ID.'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.addReaction(messageId, 'nonexistent', callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should call removeReaction with DELETE and JSON payload', function() {
        var callback = jasmine.createSpy('callback');

        messageProxy.removeReaction(messageId, 'like', callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: reactionsUrl,
            type: 'DELETE',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            dataType: 'text',
            data: {
                name: 'like'
            }
        }, callback);
    });

    it('should pass through 404 error from removeReaction', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 404,
            detail: 'Reaction not found'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.removeReaction(messageId, 'like', callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should pass through 200 success response to callback', function() {
        var callback = jasmine.createSpy('callback');

        service.ajax.and.callFake(function(params, cb) {
            cb(null, '');
        });

        messageProxy.removeReaction(messageId, 'like', callback);

        expect(callback).toHaveBeenCalledWith(null, '');
    });

    it('should pass through 400 error from removeReaction', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 400,
            detail: 'Invalid or missing "name" parameter.'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.removeReaction(messageId, '', callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should call listReactions with GET and no payload', function() {
        var callback = jasmine.createSpy('callback');

        messageProxy.listReactions(messageId, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: reactionsUrl
        }, callback);
    });

    it('should pass listReactions response into callback', function() {
        var callback = jasmine.createSpy('callback');
        var expectedResponse = {
            total_entries: 2,
            items: [
                {name: 'like', count: 3, user_ids: [20618, 31841, 51234]},
                {name: 'love', count: 2, user_ids: [20618, 51234]}
            ]
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(null, expectedResponse);
        });

        messageProxy.listReactions(messageId, callback);

        expect(callback).toHaveBeenCalledWith(null, expectedResponse);
    });

    it('should pass through 400 error from listReactions', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 400,
            detail: 'Invalid message id'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.listReactions(messageId, callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should preserve user_ids field name as snake_case (REST mirror, not camelCase)', function() {
        var callback = jasmine.createSpy('callback');
        var expectedResponse = {
            total_entries: 1,
            items: [
                {name: 'like', count: 2, user_ids: [10, 20]}
            ]
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(null, expectedResponse);
        });

        messageProxy.listReactions(messageId, callback);

        var actualResult = callback.calls.argsFor(0)[1];
        expect(actualResult.items[0].user_ids).toEqual([10, 20]);
        expect(actualResult.items[0].userIds).toBeUndefined();
    });

    it('should pass through 404 error from listReactions', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 404,
            detail: 'Message not found for the specified user and message ID.'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.listReactions('nonexistent_message_id', callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });
});

describe('QB.chat.message list include_reactions', function() {
    var messageProxy;
    var service;

    beforeEach(function() {
        service = {
            ajax: jasmine.createSpy('ajax')
        };
        messageProxy = new MessageProxy(service);
    });

    it('should pass include_reactions=1 in list params', function() {
        var callback = jasmine.createSpy('callback');
        var params = {
            chat_dialog_id: '66f2a030bba14b4c2e000001',
            include_reactions: 1
        };

        messageProxy.list(params, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: Utils.getUrl('chat/Message'),
            data: {
                chat_dialog_id: '66f2a030bba14b4c2e000001',
                include_reactions: 1
            }
        }, callback);
    });

    it('should not add include_reactions when it is not passed', function() {
        var callback = jasmine.createSpy('callback');
        var params = {
            chat_dialog_id: '66f2a030bba14b4c2e000001'
        };

        messageProxy.list(params, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: Utils.getUrl('chat/Message'),
            data: {
                chat_dialog_id: '66f2a030bba14b4c2e000001'
            }
        }, callback);
    });

    it('should pass include_reactions=0 in list params when explicitly set to 0', function() {
        var callback = jasmine.createSpy('callback');
        var params = {
            chat_dialog_id: '66f2a030bba14b4c2e000001',
            include_reactions: 0
        };

        messageProxy.list(params, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: Utils.getUrl('chat/Message'),
            data: {
                chat_dialog_id: '66f2a030bba14b4c2e000001',
                include_reactions: 0
            }
        }, callback);
    });

    it('should pass message.reactions[] from list response into callback', function() {
        var callback = jasmine.createSpy('callback');
        var params = {
            chat_dialog_id: '66f2a030bba14b4c2e000001',
            include_reactions: 1
        };
        var expectedResponse = {
            skip: 0,
            limit: 1000,
            items: [
                {
                    _id: '66f2a030bba14b4c2e000000',
                    message: 'hello',
                    chat_dialog_id: '66f2a030bba14b4c2e000001',
                    date_sent: 1727176752,
                    sender_id: 20618,
                    reactions: [
                        {name: 'like', count: 3, user_ids: [20618, 31841, 51234]}
                    ]
                }
            ]
        };

        service.ajax.and.callFake(function(p, cb) {
            cb(null, expectedResponse);
        });

        messageProxy.list(params, callback);

        var actualResult = callback.calls.argsFor(0)[1];
        expect(actualResult.items[0].reactions).toBeDefined();
        expect(actualResult.items[0].reactions[0].name).toEqual('like');
        expect(actualResult.items[0].reactions[0].user_ids).toEqual([20618, 31841, 51234]);
    });
});

describe('QB.chat.message.getById', function() {
    var messageProxy;
    var service;
    var messageId;
    var messageUrl;

    beforeEach(function() {
        service = {
            ajax: jasmine.createSpy('ajax')
        };
        messageProxy = new MessageProxy(service);
        messageId = '66f2a030bba14b4c2e000000';
        messageUrl = Utils.getUrl('chat/Message', messageId);
    });

    // F1
    it('should call getById with GET to message URL when invoked with 2 args', function() {
        var callback = jasmine.createSpy('callback');

        messageProxy.getById(messageId, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: messageUrl
        }, callback);
    });

    // F2
    it('should call getById with include_reactions=1 in query when invoked with 3 args', function() {
        var callback = jasmine.createSpy('callback');

        messageProxy.getById(messageId, { include_reactions: 1 }, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: messageUrl,
            data: { include_reactions: 1 }
        }, callback);
    });

    // F3
    it('should pass include_reactions=0 in query when explicitly set to 0', function() {
        var callback = jasmine.createSpy('callback');

        messageProxy.getById(messageId, { include_reactions: 0 }, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: messageUrl,
            data: { include_reactions: 0 }
        }, callback);
    });

    // F4
    it('should pass through 200 response with message object to callback', function() {
        var callback = jasmine.createSpy('callback');
        var expectedMessage = {
            _id: messageId,
            message: 'hello',
            chat_dialog_id: '66ed332108a4fb0d2dc2d147',
            date_sent: 1727176752,
            sender_id: 20618,
            recipient_id: 0,
            read_ids: [20618],
            delivered_ids: [20618],
            read: 0
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(null, expectedMessage);
        });

        messageProxy.getById(messageId, callback);

        expect(callback).toHaveBeenCalledWith(null, expectedMessage);
    });

    // F5
    it('should pass through 200 response with reactions[] when include_reactions=1', function() {
        var callback = jasmine.createSpy('callback');
        var expectedMessage = {
            _id: messageId,
            message: 'hello',
            chat_dialog_id: '66ed332108a4fb0d2dc2d147',
            date_sent: 1727176752,
            sender_id: 20618,
            read_ids: [20618],
            delivered_ids: [20618],
            read: 0,
            reactions: [
                { name: 'like', count: 3, user_ids: [20618, 31841, 51234] },
                { name: 'love', count: 2, user_ids: [20618, 51234] }
            ]
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(null, expectedMessage);
        });

        messageProxy.getById(messageId, { include_reactions: 1 }, callback);

        var actual = callback.calls.argsFor(0)[1];
        expect(actual.reactions).toBeDefined();
        expect(actual.reactions.length).toEqual(2);
        expect(actual.reactions[0].name).toEqual('like');
        expect(actual.reactions[0].user_ids).toEqual([20618, 31841, 51234]);
        expect(actual.reactions[0].userIds).toBeUndefined();
    });

    // F6
    it('should pass through 404 error from getById', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 404,
            detail: "The resource wasn't found"
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.getById('nonexistent_id', callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    // F7
    it('should pass through 403 error from getById', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 403,
            detail: "You don't have appropriate permissions to perform this operation"
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        messageProxy.getById(messageId, callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });
});
