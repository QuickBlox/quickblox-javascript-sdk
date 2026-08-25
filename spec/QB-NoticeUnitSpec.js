'use strict';

/**
 * Unit tests for CROS-1055 Notice Feature.
 *
 * TDD red phase: these tests are written BEFORE the runtime implementation.
 * They will fail until Stage 5 of plan-CROS-1055.md is complete.
 *
 * Test groups (see plan-CROS-1055.md revision 4 § Stage 4):
 *   4.1 Public API (mocked connection)        — 6 tests
 *   4.2 Stanza routing                         — 8 tests
 *   4.3 Payload parsing                        — 5 tests
 *   4.4 Negative cases                         — 4 tests
 *   4.5 Disconnect                             — 1 test
 *
 * Total: ~24 tests. After Stage 5 implementation, all should be green.
 *
 * Convention used by these tests:
 *   - chatProxy.enableNotices(cb)               — public method on QB.chat
 *   - chatProxy.disableNotices(cb)              — public method
 *   - chatProxy.isNoticesEnabled()              — public boolean getter
 *   - chatProxy.onMessage{Deleted,Updated,...}Listener — listener properties
 *   - chatProxy._parseNoticeStanza(stanza)      — module-private parser, returns {type, payload} or null
 *   - chatProxy._routeNoticeEvent({type, payload}) — module-private router
 *
 * The parser/router are exposed as instance methods (or via require('../src/modules/chat/qbChat').__internal)
 * for testing only. The exact exposure mechanism is decided at Stage 5.0 (audit) but the tests use
 * the simplest path: chatProxy._parseNoticeStanza / chatProxy._routeNoticeEvent.
 */

var fixtures = require('./fixtures/noticeStanzas');
var noticeConsts = require('../src/modules/chat/qbNoticeConsts');

// In Node test env QB-CoreSpec.js bootstraps a real chat instance via QuickBlox().
// For pure unit tests we mock the SDK service + connection layer so we don't need real network.
function createMockedChatProxy() {
    // Late-bound require to allow tests to skip cleanly if qbChat fails to load.
    var ChatProxy;
    try {
        ChatProxy = require('../src/modules/chat/qbChat');
    } catch (e) {
        return null;
    }

    var serviceMock = {
        ajax: jasmine.createSpy('ajax'),
        setSession: jasmine.createSpy('setSession'),
        getSession: jasmine.createSpy('getSession').and.returnValue({
            user_id: 12345,
            token: 'test-token'
        })
    };

    var chatProxy;
    try {
        chatProxy = new ChatProxy(serviceMock);
    } catch (e) {
        return null;
    }

    // Make helpers.getUserCurrentJid return a stable value so IQ stanza building works.
    chatProxy.helpers.getUserCurrentJid = function () {
        return '12345-72448@chat.quickblox.com/test-resource';
    };

    // Tests run in Node env (Utils.getEnv().node === true). Replace Client.send
    // with a spy so enableNotices/disableNotices don't hit a real socket.
    if (chatProxy.Client) {
        chatProxy.Client.send = jasmine.createSpy('clientSend');
    }

    // For tests that assert about browser-path connection.sendIQ, also expose
    // a fake connection (some test branches inspect it). Real runtime in Node
    // does not use this — Utils.getEnv().browser is false.
    if (!chatProxy.connection) {
        chatProxy.connection = {
            sendIQ: jasmine.createSpy('sendIQ'),
            connected: true,
            send: jasmine.createSpy('send')
        };
    }

    return chatProxy;
}

/**
 * Helper: simulate the server response by calling the registered nodeStanzasCallbacks
 * entry. Returns the iqId that was registered (so tests can assert on it).
 *
 * @param {ChatProxy} chatProxy
 * @param {Object|String} stanzaOrType - either 'success'/'error' shorthand, or a custom stanza object.
 * @return {String|null} iqId or null if no callback was registered.
 */
function fireNodeIqResponse(chatProxy, stanzaOrType) {
    var callbacks = chatProxy.nodeStanzasCallbacks || {};
    var ids = Object.keys(callbacks).filter(function (k) {
        return /notice_(enable|disable)/.test(k);
    });
    if (ids.length === 0) {
        return null;
    }
    // Use the most recently registered notice IQ.
    var iqId = ids[ids.length - 1];
    var cb = callbacks[iqId];
    var stanza = stanzaOrType;
    if (stanzaOrType === 'success') {
        // Build a fake DOM element-like object that getAttr('type') returns 'result'.
        stanza = makeFakeIqResultStanza(iqId, 'result');
    } else if (stanzaOrType === 'error') {
        stanza = makeFakeIqResultStanza(iqId, 'error');
    }
    cb(stanza);
    delete callbacks[iqId];
    return iqId;
}

/**
 * Build a fake <iq type="result|error"/> element using xmldom (same parser as fixtures).
 */
function makeFakeIqResultStanza(id, type) {
    var DOMParserCtor = (typeof DOMParser !== 'undefined') ? DOMParser : require('xmldom').DOMParser;
    var xml = '<iq xmlns="jabber:client" type="' + type + '" id="' + id + '"/>';
    return new DOMParserCtor().parseFromString(xml, 'text/xml').documentElement;
}

// ============================================================================
// 4.1 Public API (mocked connection)
// ============================================================================

describe('Notice public API (mocked connection)', function() {
    var chatProxy;

    beforeEach(function() {
        chatProxy = createMockedChatProxy();
    });

    it('T1.1: enableNotices(cb) sends IQ <enable xmlns="urn:xmpp:notice:0"/>', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var cb = jasmine.createSpy('cb');

        chatProxy.enableNotices(cb);

        // Node env: stanza is sent through Client.send, callback registered in nodeStanzasCallbacks map.
        expect(chatProxy.Client.send).toHaveBeenCalled();

        var iqStanza = chatProxy.Client.send.calls.mostRecent().args[0];
        var iqString = iqStanza && iqStanza.toString ? iqStanza.toString() : String(iqStanza);
        expect(iqString).toContain('type="set"');
        expect(iqString).toContain('<enable');
        expect(iqString).toContain('urn:xmpp:notice:0');

        // Verify a callback was registered for this IQ id.
        var noticeIds = Object.keys(chatProxy.nodeStanzasCallbacks).filter(function (k) {
            return /notice_enable/.test(k);
        });
        expect(noticeIds.length).toBeGreaterThan(0);
    });

    it('T1.2: after enableNotices success response, isNoticesEnabled() === true', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var cb = jasmine.createSpy('cb');

        chatProxy.enableNotices(cb);
        fireNodeIqResponse(chatProxy, 'success');

        expect(chatProxy.isNoticesEnabled()).toBe(true);
        expect(cb).toHaveBeenCalled();
    });

    it('T1.3: enableNotices error response keeps flag false and propagates error', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var cb = jasmine.createSpy('cb');

        chatProxy.enableNotices(cb);
        fireNodeIqResponse(chatProxy, 'error');

        expect(chatProxy.isNoticesEnabled()).toBe(false);
        expect(cb).toHaveBeenCalled();
        var cbArgs = cb.calls.mostRecent().args;
        expect(cbArgs[0]).toBeTruthy();
    });

    it('T1.4: disableNotices(cb) sends <disable> IQ; success → flag false', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        // Pre-condition: notice is enabled.
        var enableCb = jasmine.createSpy('enableCb');
        chatProxy.enableNotices(enableCb);
        fireNodeIqResponse(chatProxy, 'success');
        expect(chatProxy.isNoticesEnabled()).toBe(true);

        var disableCb = jasmine.createSpy('disableCb');
        chatProxy.disableNotices(disableCb);

        var lastIQ = chatProxy.Client.send.calls.mostRecent().args[0];
        var iqString = lastIQ && lastIQ.toString ? lastIQ.toString() : String(lastIQ);
        expect(iqString).toContain('<disable');
        expect(iqString).toContain('urn:xmpp:notice:0');

        fireNodeIqResponse(chatProxy, 'success');
        expect(chatProxy.isNoticesEnabled()).toBe(false);
        expect(disableCb).toHaveBeenCalled();
    });

    it('T1.5: disableNotices without prior enable is allowed; flag stays false', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        expect(chatProxy.isNoticesEnabled()).toBe(false);

        var cb = jasmine.createSpy('cb');
        chatProxy.disableNotices(cb);
        fireNodeIqResponse(chatProxy, 'success');

        expect(chatProxy.isNoticesEnabled()).toBe(false);
    });

    it('T1.6: isNoticesEnabled() default value is false', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        expect(chatProxy.isNoticesEnabled()).toBe(false);
    });
});

// ============================================================================
// 4.2 Stanza routing
// ============================================================================

describe('Notice stanza routing', function() {
    var chatProxy;

    beforeEach(function() {
        chatProxy = createMockedChatProxy();
    });

    it('T2.1: NoticeDeletedMessage → onMessageDeletedListener(dialogId, messageId, dateSent)', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onMessageDeletedListener');
        chatProxy.onMessageDeletedListener = listener;

        var stanza = fixtures.noticeDeletedMessage({
            dialogId: 'd-001',
            messageId: 'm-001',
            dateSent: 1700000001
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalledWith('d-001', 'm-001', 1700000001);
    });

    it('T2.2: NoticeUpdatedMessage (text only) → onMessageUpdatedListener(dialogId, message)', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onMessageUpdatedListener');
        chatProxy.onMessageUpdatedListener = listener;

        var stanza = fixtures.noticeUpdatedMessageText({
            dialogId: 'd-002',
            messageId: 'm-002',
            dateSent: 1700000002,
            message: 'updated body'
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var args = listener.calls.mostRecent().args;
        expect(args[0]).toEqual('d-002');
        expect(args[1]._id || args[1].messageId).toEqual('m-002');
        expect(args[1].message).toEqual('updated body');
    });

    it('T2.3: NoticeUpdatedMessage with aggregate <reactions> → onMessageUpdatedListener with message.reactions[]', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onMessageUpdatedListener');
        chatProxy.onMessageUpdatedListener = listener;

        var stanza = fixtures.noticeUpdatedMessageWithAggregateReactions({
            dialogId: 'd-003',
            messageId: 'm-003',
            reactions: [
                { name: 'like', count: 2, user_ids: [11, 22] },
                { name: 'love', count: 1, user_ids: [33] }
            ]
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var msg = listener.calls.mostRecent().args[1];
        expect(Array.isArray(msg.reactions)).toBe(true);
        expect(msg.reactions.length).toEqual(2);
        expect(msg.reactions[0].name).toEqual('like');
        expect(msg.reactions[0].count).toEqual(2);
        expect(msg.reactions[0].user_ids).toEqual([11, 22]);
    });

    it('T2.4: NoticeUpdatedMessage with singular <reaction action="add"> → onMessageReactionChangedListener', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var reactionListener = jasmine.createSpy('onMessageReactionChangedListener');
        var updatedListener = jasmine.createSpy('onMessageUpdatedListener');
        chatProxy.onMessageReactionChangedListener = reactionListener;
        chatProxy.onMessageUpdatedListener = updatedListener;

        var stanza = fixtures.reactionAdd({
            dialogId: 'd-004',
            messageId: 'm-004',
            userId: 99,
            name: 'like',
            dateSent: 1700000004
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(reactionListener).toHaveBeenCalled();
        // Singular reaction must NOT route to onMessageUpdatedListener.
        expect(updatedListener).not.toHaveBeenCalled();

        var event = reactionListener.calls.mostRecent().args[0];
        expect(event.dialogId).toEqual('d-004');
        expect(event.messageId).toEqual('m-004');
        expect(event.userId).toEqual(99);
        expect(event.reactionName).toEqual('like');
        expect(event.action).toEqual('add');
        expect(event.dateSent).toEqual(1700000004);
    });

    it('T2.5: singular <reaction action="remove"> → onMessageReactionChangedListener with action remove', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var reactionListener = jasmine.createSpy('onMessageReactionChangedListener');
        chatProxy.onMessageReactionChangedListener = reactionListener;

        var stanza = fixtures.reactionRemove({
            dialogId: 'd-005',
            messageId: 'm-005',
            userId: 100,
            name: 'love'
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(reactionListener).toHaveBeenCalled();
        var event = reactionListener.calls.mostRecent().args[0];
        expect(event.action).toEqual('remove');
        expect(event.reactionName).toEqual('love');
        expect(event.userId).toEqual(100);
    });

    it('T2.6: NoticeDeletedDialog → onDialogDeletedListener(dialogId, dateSent)', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onDialogDeletedListener');
        chatProxy.onDialogDeletedListener = listener;

        var stanza = fixtures.noticeDeletedDialog({
            dialogId: 'd-006',
            dateSent: 1700000006
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalledWith('d-006', 1700000006);
    });

    it('T2.7: NoticeUpdatedDialog (group) → onDialogUpdatedListener with admin_ids/occupants_ids/xmpp_room_jid', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onDialogUpdatedListener');
        chatProxy.onDialogUpdatedListener = listener;

        var stanza = fixtures.noticeUpdatedDialogGroup({
            dialogId: 'd-007',
            name: 'group-name',
            occupants_ids: '10,11,13007',
            admin_ids: '10,11',
            xmpp_room_jid: '72448_d-007@muc.chat.quickblox.com'
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var dialog = listener.calls.mostRecent().args[0];
        expect(dialog._id || dialog.dialogId).toEqual('d-007');
        expect(dialog.name).toEqual('group-name');
        expect(dialog.occupants_ids).toEqual([10, 11, 13007]);
        expect(dialog.admin_ids).toEqual([10, 11]);
        expect(dialog.xmpp_room_jid).toEqual('72448_d-007@muc.chat.quickblox.com');
    });

    it('T2.8: NoticeUpdatedDialog (private) → onDialogUpdatedListener without xmpp_room_jid', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onDialogUpdatedListener');
        chatProxy.onDialogUpdatedListener = listener;

        var stanza = fixtures.noticeUpdatedDialogPrivate({
            dialogId: 'd-008',
            name: 'private-dialog',
            occupants_ids: '10,11'
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var dialog = listener.calls.mostRecent().args[0];
        expect(dialog._id || dialog.dialogId).toEqual('d-008');
        expect(dialog.occupants_ids).toEqual([10, 11]);
        // Private dialog has no MUC room.
        expect(dialog.xmpp_room_jid).toBeUndefined();
    });
});

// ============================================================================
// 4.3 Payload parsing
// ============================================================================

describe('Notice payload parsing', function() {
    var chatProxy;

    beforeEach(function() {
        chatProxy = createMockedChatProxy();
    });

    it('T3.1: numeric fields (date_sent, ids) are parsed to Number', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onMessageDeletedListener');
        chatProxy.onMessageDeletedListener = listener;

        var stanza = fixtures.noticeDeletedMessage({
            dialogId: 'd',
            messageId: 'm',
            dateSent: 1700000999
        });
        chatProxy._onSystemMessageListener(stanza);

        var args = listener.calls.mostRecent().args;
        expect(typeof args[2]).toBe('number');
        expect(args[2]).toEqual(1700000999);
    });

    it('T3.2: missing fields → undefined, not null', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onDialogUpdatedListener');
        chatProxy.onDialogUpdatedListener = listener;

        // Build a minimal stanza WITHOUT photo, custom_data, etc.
        var stanza = fixtures.buildHeadlineStanza(
            '<dialog_id>d-301</dialog_id>'
            + '<type>2</type>'
            + '<moduleIdentifier xmlns="' + fixtures.NS_NOTICE + '">' + fixtures.MODULE_ID.UPDATED_DIALOG + '</moduleIdentifier>'
        );
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var dialog = listener.calls.mostRecent().args[0];
        expect(dialog.photo).toBeUndefined();
        expect(dialog.photo).not.toBeNull();
    });

    it('T3.3: custom_data as nested XML is parsed as object', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onDialogUpdatedListener');
        chatProxy.onDialogUpdatedListener = listener;

        var stanza = fixtures.buildHeadlineStanza(
            '<dialog_id>d-302</dialog_id>'
            + '<type>2</type>'
            + '<custom_data>'
            + '<class_name>MyDialogClass</class_name>'
            + '<priority>5</priority>'
            + '</custom_data>'
            + '<moduleIdentifier xmlns="' + fixtures.NS_NOTICE + '">' + fixtures.MODULE_ID.UPDATED_DIALOG + '</moduleIdentifier>'
        );
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var dialog = listener.calls.mostRecent().args[0];
        expect(dialog.custom_data).toBeDefined();
        expect(dialog.custom_data.class_name).toEqual('MyDialogClass');
    });

    it('T3.4: custom_data as JSON string is parsed via JSON.parse', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onDialogUpdatedListener');
        chatProxy.onDialogUpdatedListener = listener;

        var stanza = fixtures.buildHeadlineStanza(
            '<dialog_id>d-303</dialog_id>'
            + '<type>2</type>'
            + '<custom_data>{"class_name":"MyDialogClass","priority":7}</custom_data>'
            + '<moduleIdentifier xmlns="' + fixtures.NS_NOTICE + '">' + fixtures.MODULE_ID.UPDATED_DIALOG + '</moduleIdentifier>'
        );
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var dialog = listener.calls.mostRecent().args[0];
        expect(dialog.custom_data).toBeDefined();
        expect(dialog.custom_data.class_name).toEqual('MyDialogClass');
        expect(dialog.custom_data.priority).toEqual(7);
    });

    it('T3.5: occupants_ids as CSV "10,11,13007" → [10, 11, 13007]', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var listener = jasmine.createSpy('onDialogUpdatedListener');
        chatProxy.onDialogUpdatedListener = listener;

        var stanza = fixtures.noticeUpdatedDialogGroup({
            dialogId: 'd-304',
            occupants_ids: '10,11,13007'
        });
        chatProxy._onSystemMessageListener(stanza);

        var dialog = listener.calls.mostRecent().args[0];
        expect(dialog.occupants_ids).toEqual([10, 11, 13007]);
        expect(dialog.occupants_ids.every(function(x) { return typeof x === 'number'; })).toBe(true);
    });
});

// ============================================================================
// 4.4 Negative cases
// ============================================================================

describe('Notice negative cases', function() {
    var chatProxy;

    beforeEach(function() {
        chatProxy = createMockedChatProxy();
    });

    it('T4.1: stanza without urn:xmpp:notice:0 namespace → no notice listener invoked', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var deletedListener = jasmine.createSpy('onMessageDeletedListener');
        var updatedListener = jasmine.createSpy('onMessageUpdatedListener');
        var dialogDeletedListener = jasmine.createSpy('onDialogDeletedListener');
        var dialogUpdatedListener = jasmine.createSpy('onDialogUpdatedListener');
        var reactionListener = jasmine.createSpy('onMessageReactionChangedListener');

        chatProxy.onMessageDeletedListener = deletedListener;
        chatProxy.onMessageUpdatedListener = updatedListener;
        chatProxy.onDialogDeletedListener = dialogDeletedListener;
        chatProxy.onDialogUpdatedListener = dialogUpdatedListener;
        chatProxy.onMessageReactionChangedListener = reactionListener;

        var stanza = fixtures.nonNoticeHeadlineStanza({
            moduleIdentifier: 'NoticeUpdatedMessage'
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(deletedListener).not.toHaveBeenCalled();
        expect(updatedListener).not.toHaveBeenCalled();
        expect(dialogDeletedListener).not.toHaveBeenCalled();
        expect(dialogUpdatedListener).not.toHaveBeenCalled();
        expect(reactionListener).not.toHaveBeenCalled();
    });

    it('T4.2: unknown moduleIdentifier value → no listener invoked, no exception', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        var deletedListener = jasmine.createSpy('onMessageDeletedListener');
        chatProxy.onMessageDeletedListener = deletedListener;

        var stanza = fixtures.noticeWithUnknownModuleId({
            moduleIdentifier: 'NoticeFoo'
        });

        expect(function() {
            chatProxy._onSystemMessageListener(stanza);
        }).not.toThrow();

        expect(deletedListener).not.toHaveBeenCalled();
    });

    it('T4.3: malformed reactions block → no exception (graceful degradation)', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        chatProxy.onMessageUpdatedListener = jasmine.createSpy('onMessageUpdatedListener');

        var stanza = fixtures.buildHeadlineStanza(
            '<dialog_id>d-401</dialog_id>'
            + '<message_id>m-401</message_id>'
            + '<reactions><not-a-reaction-element>broken</not-a-reaction-element></reactions>'
            + '<moduleIdentifier xmlns="' + fixtures.NS_NOTICE + '">' + fixtures.MODULE_ID.UPDATED_MESSAGE + '</moduleIdentifier>'
        );

        expect(function() {
            chatProxy._onSystemMessageListener(stanza);
        }).not.toThrow();
    });

    it('T4.4: listener-property is undefined/null → no exception', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        // Do NOT set any listener properties.
        chatProxy.onMessageDeletedListener = undefined;

        var stanza = fixtures.noticeDeletedMessage({});
        expect(function() {
            chatProxy._onSystemMessageListener(stanza);
        }).not.toThrow();
    });
});

// ============================================================================
// 4.5 Disconnect
// ============================================================================

describe('Notice disconnect behavior', function() {
    var chatProxy;

    beforeEach(function() {
        chatProxy = createMockedChatProxy();
    });

    it('T5.1: chat disconnect resets isNoticesEnabled flag to false', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }

        // Enable notices first.
        chatProxy.enableNotices(jasmine.createSpy('cb'));
        fireNodeIqResponse(chatProxy, 'success');
        expect(chatProxy.isNoticesEnabled()).toBe(true);

        // Mock Client.end so disconnect() doesn't try to terminate a real socket.
        chatProxy.Client.end = jasmine.createSpy('clientEnd');

        chatProxy.disconnect();

        expect(chatProxy.isNoticesEnabled()).toBe(false);
    });
});

// ============================================================================
// Sanity: foundation constants are wired correctly (this should pass before
// Stage 5 runtime code is written, since it only checks Foundation imports).
// ============================================================================

describe('Notice foundation constants (Stage 0 sanity)', function() {
    it('NOTICE_NAMESPACE matches urn:xmpp:notice:0', function() {
        expect(noticeConsts.NOTICE_NAMESPACE).toEqual('urn:xmpp:notice:0');
    });

    it('NOTICE_MODULE_IDENTIFIER has all 4 keys', function() {
        expect(noticeConsts.NOTICE_MODULE_IDENTIFIER.UPDATED_MESSAGE).toEqual('NoticeUpdatedMessage');
        expect(noticeConsts.NOTICE_MODULE_IDENTIFIER.DELETED_MESSAGE).toEqual('NoticeDeletedMessage');
        expect(noticeConsts.NOTICE_MODULE_IDENTIFIER.UPDATED_DIALOG).toEqual('NoticeUpdatedDialog');
        expect(noticeConsts.NOTICE_MODULE_IDENTIFIER.DELETED_DIALOG).toEqual('NoticeDeletedDialog');
    });
});

// ============================================================================
// Node/ltx stanza tests — verify the parser works against real node-xmpp-client
// Element shape (production Node env). Ensures P1+P2 cross-env fixes hold:
// _readElementText (textContent vs getText), _getChildElements (childNodes vs children).
// Skipped automatically if node-xmpp-client is not available.
// ============================================================================

describe('Notice routing — Node/ltx stanzas', function() {
    var chatProxy;

    beforeEach(function() {
        chatProxy = createMockedChatProxy();
    });

    it('TN.1 (Node ltx): NoticeDeletedMessage stanza routes to onMessageDeletedListener', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        if (!fixtures.nodeAvailable) {
            pending('node-xmpp-client not available');
            return;
        }

        var listener = jasmine.createSpy('onMessageDeletedListener');
        chatProxy.onMessageDeletedListener = listener;

        var stanza = fixtures.noticeDeletedMessageNode({
            dialogId: 'd-N1',
            messageId: 'm-N1',
            dateSent: 1700000101
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalledWith('d-N1', 'm-N1', 1700000101);
    });

    it('TN.2 (Node ltx): singular reaction stanza routes to onMessageReactionChangedListener with QBReactionEvent shape', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        if (!fixtures.nodeAvailable) {
            pending('node-xmpp-client not available');
            return;
        }

        var listener = jasmine.createSpy('onMessageReactionChangedListener');
        chatProxy.onMessageReactionChangedListener = listener;

        var stanza = fixtures.reactionAddNode({
            dialogId: 'd-N2',
            messageId: 'm-N2',
            userId: 4242,
            name: 'love',
            dateSent: 1700000202
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var event = listener.calls.mostRecent().args[0];
        expect(event.dialogId).toEqual('d-N2');
        expect(event.messageId).toEqual('m-N2');
        expect(event.userId).toEqual(4242);
        expect(event.reactionName).toEqual('love');
        expect(event.action).toEqual('add');
        expect(event.dateSent).toEqual(1700000202);
    });

    it('TN.3 (Node ltx): aggregate reactions are parsed from ltx Element.children', function() {
        if (!chatProxy) { fail('chatProxy not constructed'); return; }
        if (!fixtures.nodeAvailable) {
            pending('node-xmpp-client not available');
            return;
        }

        var listener = jasmine.createSpy('onMessageUpdatedListener');
        chatProxy.onMessageUpdatedListener = listener;

        var stanza = fixtures.noticeUpdatedMessageWithAggregateReactionsNode({
            dialogId: 'd-N3',
            messageId: 'm-N3',
            reactions: [
                { name: 'fire', count: 3, user_ids: [11, 22, 33] },
                { name: 'star', count: 1, user_ids: [44] }
            ]
        });
        chatProxy._onSystemMessageListener(stanza);

        expect(listener).toHaveBeenCalled();
        var msg = listener.calls.mostRecent().args[1];
        expect(Array.isArray(msg.reactions)).toBe(true);
        expect(msg.reactions.length).toEqual(2);
        expect(msg.reactions[0].name).toEqual('fire');
        expect(msg.reactions[0].count).toEqual(3);
        expect(msg.reactions[0].user_ids).toEqual([11, 22, 33]);
        expect(msg.reactions[1].name).toEqual('star');
        expect(msg.reactions[1].user_ids).toEqual([44]);
    });
});
