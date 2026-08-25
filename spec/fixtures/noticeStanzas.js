'use strict';

/**
 * Stanza fixtures for QB-NoticeUnitSpec.js — synthetic XMPP stanzas modeled after
 * the Android SDK's Notice unit tests (internal reference, 2026-05-07).
 *
 * Each factory returns a parsed XML Element ready to be passed to the Notice
 * stanza handler (the same shape that Strophe.js delivers to the SDK's
 * headline-message handler in qbChat.js).
 *
 * Parser strategy: in Node tests we use `xmldom` (already a dependency of the SDK
 * via nativescript transitive deps); in browser unit tests `DOMParser` is native.
 * Both paths produce a DOM Document whose `documentElement` is the stanza root.
 *
 * Notice namespace: 'urn:xmpp:notice:0' (matches Foundation
 * `src/modules/chat/qbNoticeConsts.js` NOTICE_NAMESPACE constant).
 */

var DOMParserCtor;
if (typeof DOMParser !== 'undefined') {
    DOMParserCtor = DOMParser;
} else {
    DOMParserCtor = require('xmldom').DOMParser;
}

var NS_NOTICE = 'urn:xmpp:notice:0';
var NS_JABBER_CLIENT = 'jabber:client';

/**
 * Recursively shim browser-DOM-like methods on every Element node so that
 * SDK helpers (chatUtils.getElement, chatUtils.parseExtraParams) work in the
 * Node test environment. xmldom Element does NOT provide:
 *   - querySelector (used by chatUtils.getElement when env detects browser-like API)
 *   - tagName as a getter (xmldom uses nodeName)
 *
 * Note: `chatUtils.parseExtraParams` ALSO branches on `Utils.getEnv().browser`.
 * In Node tests we want the BROWSER branch (because our fixtures expose
 * browser-like properties via this shim). To force that, we install
 * `Utils.getEnv` browser=true ONCE in test bootstrap (done in createMockedChatProxy).
 */
function shimQuerySelector(node) {
    if (!node || node.nodeType !== 1) {
        return;
    }
    if (typeof node.querySelector !== 'function') {
        node.querySelector = function (selector) {
            // Only support simple tag-name selectors (no attribute / class / id selectors).
            var elements = this.getElementsByTagName(selector);
            return (elements && elements.length > 0) ? elements[0] : null;
        };
    }
    // xmldom: tagName getter exists but normalized — parseExtraParams reads
    // `.tagName` directly. xmldom does set tagName on Element so this is fine.
    var children = node.childNodes || [];
    for (var i = 0; i < children.length; i++) {
        shimQuerySelector(children[i]);
    }
}

function parse(xmlString) {
    var doc = new DOMParserCtor().parseFromString(xmlString, 'text/xml');
    var root = doc.documentElement;
    shimQuerySelector(root);
    return root;
}

/**
 * Build a headline message stanza with arbitrary extraParams payload.
 * @param {String} extraParamsXml - inner XML for <extraParams>...</extraParams>
 * @return {Element}
 */
function buildHeadlineStanza(extraParamsXml) {
    var xml = '<message xmlns="' + NS_JABBER_CLIENT + '" type="headline" id="test-id" from="echo@chat.quickblox.com" to="test@chat.quickblox.com">'
        + '<body/>'
        + '<extraParams xmlns="jabber:client">' + extraParamsXml + '</extraParams>'
        + '</message>';
    return parse(xml);
}

// ============================================================================
// Module-identifier strings (mirror Foundation NOTICE_MODULE_IDENTIFIER map).
// ============================================================================

var MODULE_ID = {
    UPDATED_MESSAGE: 'NoticeUpdatedMessage',
    DELETED_MESSAGE: 'NoticeDeletedMessage',
    UPDATED_DIALOG:  'NoticeUpdatedDialog',
    DELETED_DIALOG:  'NoticeDeletedDialog'
};

function moduleIdentifierTag(value) {
    return '<moduleIdentifier xmlns="' + NS_NOTICE + '">' + value + '</moduleIdentifier>';
}

// ============================================================================
// Message events
// ============================================================================

/**
 * NoticeDeletedMessage stanza — a message has been deleted.
 * Payload: dialog_id, message_id, date_sent.
 */
function noticeDeletedMessage(opts) {
    var dialogId = opts.dialogId || '65e838ec70ef2f001f05e492';
    var messageId = opts.messageId || '100dbee4fedb3273c6f9c8bb';
    var dateSent = opts.dateSent || 1234567890;

    return buildHeadlineStanza(
        '<date_sent>' + dateSent + '</date_sent>'
        + '<dialog_id>' + dialogId + '</dialog_id>'
        + '<message_id>' + messageId + '</message_id>'
        + moduleIdentifierTag(MODULE_ID.DELETED_MESSAGE)
    );
}

/**
 * NoticeUpdatedMessage stanza — message text changed (no reactions).
 * Payload: dialog_id, message_id, date_sent, message.
 */
function noticeUpdatedMessageText(opts) {
    var dialogId = opts.dialogId || '2fce4afed029c8d093546ca8';
    var messageId = opts.messageId || '100dbee4fedb3273c6f9c8bb';
    var dateSent = opts.dateSent || 1661845300;
    var message = opts.message || 'edited text';

    return buildHeadlineStanza(
        '<date_sent>' + dateSent + '</date_sent>'
        + '<dialog_id>' + dialogId + '</dialog_id>'
        + '<message_id>' + messageId + '</message_id>'
        + '<message>' + message + '</message>'
        + moduleIdentifierTag(MODULE_ID.UPDATED_MESSAGE)
    );
}

/**
 * NoticeUpdatedMessage stanza — message text changed AND aggregate reactions snapshot included.
 * Used when the server delivers a full text-update stanza along with the current reaction snapshot.
 * Payload: dialog_id, message_id, date_sent, message, <reactions>...</reactions>.
 *
 * @param {Array<{name, count, user_ids: number[]}>} reactions
 */
function noticeUpdatedMessageWithAggregateReactions(opts) {
    var dialogId = opts.dialogId || '2fce4afed029c8d093546ca8';
    var messageId = opts.messageId || '100dbee4fedb3273c6f9c8bb';
    var dateSent = opts.dateSent || 1661845300;
    var message = opts.message || 'edited text';
    var reactions = opts.reactions || [
        { name: 'like', count: 2, user_ids: [12345, 67890] }
    ];

    var reactionsXml = reactions.map(function(r) {
        var userIdsXml = (r.user_ids || []).map(function(uid) {
            return '<user_id>' + uid + '</user_id>';
        }).join('');

        return '<reaction>'
            + '<name>' + r.name + '</name>'
            + '<count>' + r.count + '</count>'
            + '<user_ids>' + userIdsXml + '</user_ids>'
            + '</reaction>';
    }).join('');

    return buildHeadlineStanza(
        '<date_sent>' + dateSent + '</date_sent>'
        + '<dialog_id>' + dialogId + '</dialog_id>'
        + '<message_id>' + messageId + '</message_id>'
        + '<message>' + message + '</message>'
        + '<reactions>' + reactionsXml + '</reactions>'
        + moduleIdentifierTag(MODULE_ID.UPDATED_MESSAGE)
    );
}

/**
 * NoticeUpdatedMessage stanza — singular reaction event (incremental add/remove).
 * Payload: dialog_id, message_id, date_sent, <reaction>{name, user_id, action}</reaction>.
 *
 * @param {String} action - 'add' or 'remove'
 */
function reactionStanza(opts) {
    var dialogId = opts.dialogId || '2fce4afed029c8d093546ca8';
    var messageId = opts.messageId || '100dbee4fedb3273c6f9c8bb';
    var dateSent = opts.dateSent || 1661845220;
    var name = opts.name || 'like';
    var userId = opts.userId || 12345;
    var action = opts.action || 'add';

    return buildHeadlineStanza(
        '<date_sent>' + dateSent + '</date_sent>'
        + '<dialog_id>' + dialogId + '</dialog_id>'
        + '<message_id>' + messageId + '</message_id>'
        + '<reaction>'
        + '<name>' + name + '</name>'
        + '<user_id>' + userId + '</user_id>'
        + '<action>' + action + '</action>'
        + '</reaction>'
        + moduleIdentifierTag(MODULE_ID.UPDATED_MESSAGE)
    );
}

function reactionAdd(opts) {
    opts = opts || {};
    opts.action = 'add';
    return reactionStanza(opts);
}

function reactionRemove(opts) {
    opts = opts || {};
    opts.action = 'remove';
    return reactionStanza(opts);
}

// ============================================================================
// Dialog events
// ============================================================================

/**
 * NoticeDeletedDialog stanza — dialog has been deleted.
 * Payload: dialog_id, date_sent.
 */
function noticeDeletedDialog(opts) {
    var dialogId = opts.dialogId || '698b01c0e42abc11ae2eb0f4';
    var dateSent = opts.dateSent || 1661845400;

    return buildHeadlineStanza(
        '<date_sent>' + dateSent + '</date_sent>'
        + '<dialog_id>' + dialogId + '</dialog_id>'
        + moduleIdentifierTag(MODULE_ID.DELETED_DIALOG)
    );
}

/**
 * NoticeUpdatedDialog stanza for a GROUP dialog (type=2).
 * Server sends a full dialog snapshot (not a diff).
 *
 * Payload fields (from Android QBNoticeConsts.java):
 *   name, photo, type, occupants_ids, is_join_required, admin_ids,
 *   xmpp_room_jid, custom_data, last_message*, dialog_id.
 */
function noticeUpdatedDialogGroup(opts) {
    var dialogId = opts.dialogId || '698b01c0e42abc11ae2eb0f4';
    var name = opts.name || 'testNotice';
    var photo = opts.photo || '/uploads/dialogs/test.png';
    var type = opts.type || 2;
    var occupantsIds = opts.occupants_ids || '10,11,13007';
    var isJoinRequired = (typeof opts.is_join_required === 'number') ? opts.is_join_required : 0;
    var adminIds = opts.admin_ids || '10,11';
    var xmppRoomJid = opts.xmpp_room_jid || '72448_698b01c0e42abc11ae2eb0f4@muc.chat.quickblox.com';

    return buildHeadlineStanza(
        '<occupants_ids>' + occupantsIds + '</occupants_ids>'
        + '<photo>' + photo + '</photo>'
        + '<name>' + name + '</name>'
        + '<type>' + type + '</type>'
        + '<is_join_required>' + isJoinRequired + '</is_join_required>'
        + '<admin_ids>' + adminIds + '</admin_ids>'
        + '<xmpp_room_jid>' + xmppRoomJid + '</xmpp_room_jid>'
        + '<dialog_id>' + dialogId + '</dialog_id>'
        + moduleIdentifierTag(MODULE_ID.UPDATED_DIALOG)
    );
}

/**
 * NoticeUpdatedDialog stanza for a PRIVATE dialog (type=3).
 * No xmpp_room_jid, admin_ids is empty/absent (per backend contract for type=3).
 */
function noticeUpdatedDialogPrivate(opts) {
    var dialogId = opts.dialogId || '698b01c0e42abc11ae2eb0f5';
    var name = opts.name || 'private dialog';
    var photo = opts.photo || '';
    var occupantsIds = opts.occupants_ids || '10,11';

    return buildHeadlineStanza(
        '<occupants_ids>' + occupantsIds + '</occupants_ids>'
        + '<photo>' + photo + '</photo>'
        + '<name>' + name + '</name>'
        + '<type>3</type>'
        + '<dialog_id>' + dialogId + '</dialog_id>'
        + moduleIdentifierTag(MODULE_ID.UPDATED_DIALOG)
    );
}

// ============================================================================
// Negative case fixtures
// ============================================================================

/**
 * Headline stanza WITHOUT urn:xmpp:notice:0 namespace on moduleIdentifier.
 * Used to verify that the Notice handler correctly ignores non-notice stanzas
 * even when their moduleIdentifier text matches a Notice value.
 */
function nonNoticeHeadlineStanza(opts) {
    var moduleId = (opts && opts.moduleIdentifier) || 'NoticeUpdatedMessage';

    return buildHeadlineStanza(
        '<dialog_id>fake-dialog</dialog_id>'
        + '<moduleIdentifier>' + moduleId + '</moduleIdentifier>'
    );
}

/**
 * Headline stanza with notice namespace but unknown moduleIdentifier value.
 */
function noticeWithUnknownModuleId(opts) {
    var moduleId = (opts && opts.moduleIdentifier) || 'NoticeFoo';

    return buildHeadlineStanza(
        '<dialog_id>fake-dialog</dialog_id>'
        + moduleIdentifierTag(moduleId)
    );
}

// ============================================================================
// Node-stanza fixtures (ltx via node-xmpp-client) — used by Node-path tests
// to verify the parser works against the same Element shape that the SDK
// receives in production (Node env). DOM-based fixtures above mirror the
// browser/Strophe path; this section mirrors the Node path.
// ============================================================================

var XMPPNode;
try {
    XMPPNode = require('node-xmpp-client');
} catch (e) {
    // Older repo or browser-only build — Node fixtures will throw if invoked.
    XMPPNode = null;
}

/**
 * Build a headline message stanza using node-xmpp-client (ltx) Element API.
 * Mirrors `buildHeadlineStanza` but produces an ltx Element (with `.children`,
 * `.name`, `.getText()`, `.getChild()`).
 *
 * @param {Function} buildExtraParams - function(extraParamsEl) that adds children
 *   to the <extraParams> element via ltx `.c('child', attrs).t('text').up()` API.
 * @return {Object} ltx Element representing the <message> stanza.
 */
function buildHeadlineStanzaNode(buildExtraParams) {
    if (!XMPPNode) {
        throw new Error('node-xmpp-client not available in this environment');
    }
    var stanza = new XMPPNode.Stanza('message', {
        xmlns: NS_JABBER_CLIENT,
        type: 'headline',
        id: 'test-id',
        from: 'echo@chat.quickblox.com',
        to: 'test@chat.quickblox.com'
    });
    stanza.c('body');
    var extraParams = stanza.c('extraParams', { xmlns: NS_JABBER_CLIENT });
    if (typeof buildExtraParams === 'function') {
        buildExtraParams(extraParams);
    }
    return stanza.root();
}

/**
 * NoticeDeletedMessage built as an ltx Element (Node path).
 * Equivalent to noticeDeletedMessage(opts) but in node-xmpp-client format.
 */
function noticeDeletedMessageNode(opts) {
    opts = opts || {};
    var dialogId = opts.dialogId || '65e838ec70ef2f001f05e492';
    var messageId = opts.messageId || '100dbee4fedb3273c6f9c8bb';
    var dateSent = opts.dateSent || 1234567890;

    return buildHeadlineStanzaNode(function (ep) {
        ep.c('date_sent').t(String(dateSent)).up();
        ep.c('dialog_id').t(dialogId).up();
        ep.c('message_id').t(messageId).up();
        ep.c('moduleIdentifier', { xmlns: NS_NOTICE }).t(MODULE_ID.DELETED_MESSAGE).up();
    });
}

/**
 * NoticeUpdatedMessage with a singular <reaction> child as an ltx Element.
 */
function reactionAddNode(opts) {
    opts = opts || {};
    var dialogId = opts.dialogId || '2fce4afed029c8d093546ca8';
    var messageId = opts.messageId || '100dbee4fedb3273c6f9c8bb';
    var dateSent = opts.dateSent || 1661845220;
    var name = opts.name || 'like';
    var userId = opts.userId || 12345;

    return buildHeadlineStanzaNode(function (ep) {
        ep.c('date_sent').t(String(dateSent)).up();
        ep.c('dialog_id').t(dialogId).up();
        ep.c('message_id').t(messageId).up();
        var reaction = ep.c('reaction');
        reaction.c('name').t(name).up();
        reaction.c('user_id').t(String(userId)).up();
        reaction.c('action').t('add').up();
        reaction.up();
        ep.c('moduleIdentifier', { xmlns: NS_NOTICE }).t(MODULE_ID.UPDATED_MESSAGE).up();
    });
}

/**
 * NoticeUpdatedMessage with aggregate <reactions> as an ltx Element.
 * Verifies that _parseAggregateReactions and child walking work in Node.
 */
function noticeUpdatedMessageWithAggregateReactionsNode(opts) {
    opts = opts || {};
    var dialogId = opts.dialogId || '2fce4afed029c8d093546ca8';
    var messageId = opts.messageId || '100dbee4fedb3273c6f9c8bb';
    var dateSent = opts.dateSent || 1661845300;
    var msgText = opts.message || 'edited text';
    var reactions = opts.reactions || [
        { name: 'like', count: 2, user_ids: [12345, 67890] }
    ];

    return buildHeadlineStanzaNode(function (ep) {
        ep.c('date_sent').t(String(dateSent)).up();
        ep.c('dialog_id').t(dialogId).up();
        ep.c('message_id').t(messageId).up();
        ep.c('message').t(msgText).up();
        var reactionsEl = ep.c('reactions');
        reactions.forEach(function (r) {
            var rEl = reactionsEl.c('reaction');
            rEl.c('name').t(r.name).up();
            rEl.c('count').t(String(r.count)).up();
            var uidsEl = rEl.c('user_ids');
            (r.user_ids || []).forEach(function (uid) {
                uidsEl.c('user_id').t(String(uid)).up();
            });
            uidsEl.up();
            rEl.up();
        });
        reactionsEl.up();
        ep.c('moduleIdentifier', { xmlns: NS_NOTICE }).t(MODULE_ID.UPDATED_MESSAGE).up();
    });
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    NS_NOTICE: NS_NOTICE,
    MODULE_ID: MODULE_ID,
    parse: parse,
    buildHeadlineStanza: buildHeadlineStanza,

    noticeDeletedMessage: noticeDeletedMessage,
    noticeUpdatedMessageText: noticeUpdatedMessageText,
    noticeUpdatedMessageWithAggregateReactions: noticeUpdatedMessageWithAggregateReactions,
    reactionStanza: reactionStanza,
    reactionAdd: reactionAdd,
    reactionRemove: reactionRemove,

    noticeDeletedDialog: noticeDeletedDialog,
    noticeUpdatedDialogGroup: noticeUpdatedDialogGroup,
    noticeUpdatedDialogPrivate: noticeUpdatedDialogPrivate,

    nonNoticeHeadlineStanza: nonNoticeHeadlineStanza,
    noticeWithUnknownModuleId: noticeWithUnknownModuleId,

    // Node-path (ltx) fixtures.
    nodeAvailable: !!XMPPNode,
    noticeDeletedMessageNode: noticeDeletedMessageNode,
    reactionAddNode: reactionAddNode,
    noticeUpdatedMessageWithAggregateReactionsNode: noticeUpdatedMessageWithAggregateReactionsNode
};
