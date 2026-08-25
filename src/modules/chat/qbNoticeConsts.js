'use strict';

/**
 * Shared constants for the Notice Feature (XMPP `urn:xmpp:notice:0`).
 *
 * Foundation module for SDK 2.24.0 — imported by Notice / Reaction / Admin Role
 * runtime modules in their respective feature branches. No runtime behavior here.
 *
 * Mirror of Android `com.quickblox.chat.notice.QBNoticeConsts`.
 */

/**
 * XMPP namespace for Notice IQ stanzas (`<enable>`, `<disable>`) and for the
 * `<moduleIdentifier>` element on inbound notice messages.
 */
var NOTICE_NAMESPACE = 'urn:xmpp:notice:0';

/**
 * Discriminator strings carried in the `<moduleIdentifier>` element of
 * inbound notice stanzas. Used for routing in the headline-message handler.
 */
var NOTICE_MODULE_IDENTIFIER = {
    UPDATED_MESSAGE: 'NoticeUpdatedMessage',
    DELETED_MESSAGE: 'NoticeDeletedMessage',
    UPDATED_DIALOG:  'NoticeUpdatedDialog',
    DELETED_DIALOG:  'NoticeDeletedDialog'
};

module.exports = {
    NOTICE_NAMESPACE: NOTICE_NAMESPACE,
    NOTICE_MODULE_IDENTIFIER: NOTICE_MODULE_IDENTIFIER
};
