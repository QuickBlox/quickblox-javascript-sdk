'use strict';

/**
 * Integration tests for CROS-1055 Notice Feature.
 *
 * Runs against a real QuickBlox backend. NOT included in default `npm test`
 * (see spec/support/jasmine.json) — run manually:
 *
 *   node_modules/.bin/jasmine spec/QB-NoticeSpec.js
 *
 * Two QuickBlox instances are created (QB_A as actor, QB_B as subscriber).
 * For private dialogs the server now delivers the notice to BOTH participants
 * (Android server contract update 2026-05-07, see android-reference-2026-05-07/DIFF.md).
 * The test suite reflects this dual-listener pattern.
 *
 * Pending tests:
 *   - (none)
 *
 * CROS-1054 (Reactions) and CROS-1053 (Admin Role) were merged into the
 * 2.24.0 release branch; reaction and admin dialog events are now active.
 */

var LOGIN_TIMEOUT = 10000;
var MESSAGING_TIMEOUT = 7000;
var REST_REQUESTS_TIMEOUT = 6000;
var NOTICE_EVENT_TIMEOUT = 10000;

var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

var QB = isNodeEnv ? require('../src/qbMain.js') : window.QB;
var QB_A = new QB.QuickBlox(); // actor (initiator of REST changes)
var QB_B = new QB.QuickBlox(); // subscriber (receives notice events)

var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;
var chatEndpoint = CONFIG.endpoints.chat;
var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
var QBUser2 = isNodeEnv ? require('./config').QBUser2 : window.QBUser2;

var isOldVersion = chatEndpoint != "chatkafkacluster.quickblox.com";

// Shared dialog ids and message ids set by the suite as it progresses.
var dialogIdPrivate;
var dialogIdGroup;

/**
 * Create two listener-spies for a notice callback name on both QB instances
 * and a CountDownLatch-like helper. Returns an object with:
 *   - waitForBoth(timeoutMs, done) — invokes done() after both A and B fire,
 *     fails done() with `expect` failure if not received in timeoutMs.
 *   - lastA, lastB — args of the latest invocation on each side (for assertions).
 *
 * Both A and B must have the listener-property assigned via QB_A.chat[listenerName] = ...
 *
 * @param {String} listenerName  e.g. 'onMessageDeletedListener'
 */
function setupDualListener(listenerName) {
    var lastA = null;
    var lastB = null;
    var firedA = false;
    var firedB = false;
    var bothCb = null;

    QB_A.chat[listenerName] = function () {
        lastA = Array.prototype.slice.call(arguments);
        firedA = true;
        if (firedA && firedB && bothCb) {
            var cb = bothCb;
            bothCb = null;
            cb();
        }
    };
    QB_B.chat[listenerName] = function () {
        lastB = Array.prototype.slice.call(arguments);
        firedB = true;
        if (firedA && firedB && bothCb) {
            var cb = bothCb;
            bothCb = null;
            cb();
        }
    };

    return {
        waitForBoth: function (timeoutMs, done) {
            if (firedA && firedB) {
                done();
                return;
            }
            bothCb = done;
            setTimeout(function () {
                if (!firedA || !firedB) {
                    if (bothCb) {
                        var pending = bothCb;
                        bothCb = null;
                        // Fail with detail.
                        pending.fail
                            ? pending.fail('Timed out waiting for ' + listenerName + ' (firedA=' + firedA + ', firedB=' + firedB + ')')
                            : pending(new Error('Timed out waiting for ' + listenerName));
                    }
                }
            }, timeoutMs);
        },
        getLastA: function () { return lastA; },
        getLastB: function () { return lastB; },
        getFiredA: function () { return firedA; },
        getFiredB: function () { return firedB; },
        clear: function () {
            lastA = null;
            lastB = null;
            firedA = false;
            firedB = false;
            bothCb = null;
            QB_A.chat[listenerName] = null;
            QB_B.chat[listenerName] = null;
        }
    };
}


describe('Notice Feature integration', function () {

    beforeAll(function () {
        QB_A.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, CONFIG);
        QB_B.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, CONFIG);
    });

    // ------------------------------------------------------------------
    // 6.0 Sanity: log in both users + connect both to chat.
    // ------------------------------------------------------------------

    describe('Sanity:', function () {
        it('can create sessions and connect both users to chat', function (done) {
            QB_A.createSession({ login: QBUser1.login, password: QBUser1.password }, function (errA, resA) {
                expect(errA).toBeNull();
                expect(resA).toBeDefined();

                QB_B.createSession({ login: QBUser2.login, password: QBUser2.password }, function (errB, resB) {
                    expect(errB).toBeNull();
                    expect(resB).toBeDefined();

                    QB_A.chat.connect({ userId: QBUser1.id, password: QBUser1.password }, function (cErrA) {
                        expect(cErrA).toBeNull();

                        QB_B.chat.connect({ userId: QBUser2.id, password: QBUser2.password }, function (cErrB) {
                            expect(cErrB).toBeNull();
                            done();
                        });
                    });
                });
            });
        }, 2 * (REST_REQUESTS_TIMEOUT + LOGIN_TIMEOUT));
    });

    // ------------------------------------------------------------------
    // 6.2 Enable / Disable / isNoticesEnabled
    // ------------------------------------------------------------------

    describe('Enable / Disable:', function () {
        it('I-EN-1: enableNotices succeeds for both users; isNoticesEnabled() returns true', function (done) {
            QB_A.chat.enableNotices(function (errA) {
                expect(errA).toBeNull();
                expect(QB_A.chat.isNoticesEnabled()).toBe(true);

                QB_B.chat.enableNotices(function (errB) {
                    expect(errB).toBeNull();
                    expect(QB_B.chat.isNoticesEnabled()).toBe(true);
                    done();
                });
            });
        }, 2 * REST_REQUESTS_TIMEOUT);

        it('I-EN-2: disableNotices flips the flag back to false (then re-enable for the rest of the suite)', function (done) {
            QB_A.chat.disableNotices(function (errA) {
                expect(errA).toBeNull();
                expect(QB_A.chat.isNoticesEnabled()).toBe(false);

                // Re-enable so subsequent tests receive notices.
                QB_A.chat.enableNotices(function (errReA) {
                    expect(errReA).toBeNull();
                    expect(QB_A.chat.isNoticesEnabled()).toBe(true);
                    done();
                });
            });
        }, 2 * REST_REQUESTS_TIMEOUT);
    });

    // ------------------------------------------------------------------
    // Setup: create a private dialog and a group dialog used by 6.3 / 6.5.
    // Group dialog requires both users to MUC-join before notice fires (see 6.6).
    // ------------------------------------------------------------------

    describe('Dialog setup:', function () {
        it('creates a private dialog between QBUser1 and QBUser2', function (done) {
            QB_A.chat.dialog.create({
                type: 3,
                occupants_ids: [QBUser2.id]
            }, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                dialogIdPrivate = res._id;
                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('creates a group dialog and both users join MUC', function (done) {
            QB_A.chat.dialog.create({
                type: 2,
                name: 'CROS-1055 Notice integration group',
                occupants_ids: [QBUser2.id]
            }, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                dialogIdGroup = res._id;

                var jid = QB_A.chat.helpers.getRoomJidFromDialogId(dialogIdGroup);

                QB_A.chat.muc.join(jid, function (errJA, _resA) {
                    expect(errJA).toBeNull();

                    QB_B.chat.muc.join(jid, function (errJB, _resB) {
                        expect(errJB).toBeNull();
                        done();
                    });
                });
            });
        }, 2 * REST_REQUESTS_TIMEOUT);
    });

    // ------------------------------------------------------------------
    // 6.3 Message events (private dual-listener + group)
    // ------------------------------------------------------------------

    describe('Message events:', function () {

        it('I-MD-1 (private): message delete is delivered to BOTH actor and subscriber (dual-listener)', function (done) {
            // 1. QB_A creates a message.
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdPrivate,
                message: 'CROS-1055 private msg ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                var dual = setupDualListener('onMessageDeletedListener');

                // 2. QB_A deletes the message.
                QB_A.chat.message.delete([messageId], { force: 1 }, function (errDel) {
                    expect(errDel).toBeNull();
                });

                // 3. Both A and B should receive onMessageDeletedListener.
                dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                    if (failMsg) {
                        fail(failMsg);
                        dual.clear();
                        done();
                        return;
                    }
                    var argsA = dual.getLastA();
                    var argsB = dual.getLastB();
                    expect(argsA[0]).toEqual(dialogIdPrivate);
                    expect(argsA[1]).toEqual(messageId);
                    expect(typeof argsA[2]).toBe('number');
                    expect(argsB[0]).toEqual(dialogIdPrivate);
                    expect(argsB[1]).toEqual(messageId);
                    dual.clear();
                    done();
                });
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-MU-1 (private): message update is delivered to BOTH actor and subscriber', function (done) {
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdPrivate,
                message: 'original text ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;
                var newText = 'updated text ' + Date.now();

                var dual = setupDualListener('onMessageUpdatedListener');

                QB_A.chat.message.update(messageId, { message: newText, chat_dialog_id: dialogIdPrivate }, function (errUpd) {
                    expect(errUpd).toBeNull();
                });

                dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                    if (failMsg) {
                        fail(failMsg);
                        dual.clear();
                        done();
                        return;
                    }
                    var argsA = dual.getLastA();
                    var argsB = dual.getLastB();
                    expect(argsA[0]).toEqual(dialogIdPrivate);
                    expect(argsA[1].message).toEqual(newText);
                    expect(argsB[0]).toEqual(dialogIdPrivate);
                    expect(argsB[1].message).toEqual(newText);
                    dual.clear();
                    done();
                });
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-MD-2 (group): message delete is delivered to both MUC participants', function (done) {
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdGroup,
                message: 'group msg to delete ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                var dual = setupDualListener('onMessageDeletedListener');

                QB_A.chat.message.delete([messageId], { force: 1 }, function (errDel) {
                    expect(errDel).toBeNull();
                });

                dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                    if (failMsg) {
                        fail(failMsg);
                        dual.clear();
                        done();
                        return;
                    }
                    expect(dual.getLastA()[0]).toEqual(dialogIdGroup);
                    expect(dual.getLastB()[0]).toEqual(dialogIdGroup);
                    dual.clear();
                    done();
                });
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-MU-2 (group): message update is delivered to both MUC participants', function (done) {
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdGroup,
                message: 'group original ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;
                var newText = 'group updated ' + Date.now();

                var dual = setupDualListener('onMessageUpdatedListener');

                QB_A.chat.message.update(messageId, { message: newText, chat_dialog_id: dialogIdGroup }, function (errUpd) {
                    expect(errUpd).toBeNull();
                });

                dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                    if (failMsg) {
                        fail(failMsg);
                        dual.clear();
                        done();
                        return;
                    }
                    expect(dual.getLastA()[1].message).toEqual(newText);
                    expect(dual.getLastB()[1].message).toEqual(newText);
                    dual.clear();
                    done();
                });
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);
    });

    // ------------------------------------------------------------------
    // 6.4 Reaction events — activated after CROS-1054 (Reactions REST) merge.
    // Verifies that QB.chat.message.addReaction/removeReaction trigger
    // onMessageReactionChangedListener with the expected QBReactionEvent shape.
    //
    // SERVER ANOMALY #3 (private dialogs only): the server delivers reaction
    // notice to the SUBSCRIBER (QB_B) ONLY, not the ACTOR (QB_A). This contrasts
    // with the dual-listener pattern used for message/dialog notices on private
    // dialogs (Android server contract update 2026-05-07). Tests I-RX-1 / I-RX-2
    // are written to match observed behavior: assert only QB_B receives the
    // event in private dialogs. For group MUC dialogs (I-RX-3 / I-RX-4) the
    // server still fans out to both — those tests use the dual-listener pattern.
    // Documented in server-anomalies-2026-05-07.md.
    // ------------------------------------------------------------------

    describe('Reaction events:', function () {

        it('I-RX-1 (private): reaction add → onMessageReactionChangedListener for subscriber (QB_B)', function (done) {
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdPrivate,
                message: 'reaction target ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                var receivedB = null;
                QB_B.chat.onMessageReactionChangedListener = function (event) {
                    receivedB = event;
                };

                QB_A.chat.message.addReaction(messageId, 'like', function (errAdd) {
                    expect(errAdd).toBeNull();
                });

                setTimeout(function () {
                    QB_B.chat.onMessageReactionChangedListener = null;
                    if (!receivedB) {
                        fail('QB_B did not receive onMessageReactionChangedListener within ' + NOTICE_EVENT_TIMEOUT + 'ms');
                        done();
                        return;
                    }
                    expect(receivedB.dialogId).toEqual(dialogIdPrivate);
                    expect(receivedB.messageId).toEqual(messageId);
                    expect(receivedB.reactionName).toEqual('like');
                    expect(receivedB.userId).toEqual(QBUser1.id);
                    expect(receivedB.action).toEqual('add');
                    expect(typeof receivedB.dateSent).toBe('number');
                    done();
                }, NOTICE_EVENT_TIMEOUT);
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT + 2000);

        it('I-RX-2 (private): reaction remove → onMessageReactionChangedListener for subscriber (QB_B)', function (done) {
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdPrivate,
                message: 'reaction remove target ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                // Wait for QB_B to receive the add-notice before arming the remove-listener,
                // otherwise the listener fires on the residual add event from setup.
                QB_B.chat.onMessageReactionChangedListener = function () {
                    QB_B.chat.onMessageReactionChangedListener = null;

                    var receivedRemove = null;
                    QB_B.chat.onMessageReactionChangedListener = function (event) {
                        receivedRemove = event;
                    };

                    QB_A.chat.message.removeReaction(messageId, 'like', function (errRm) {
                        expect(errRm).toBeNull();
                    });

                    setTimeout(function () {
                        QB_B.chat.onMessageReactionChangedListener = null;
                        if (!receivedRemove) {
                            fail('QB_B did not receive remove notice within ' + NOTICE_EVENT_TIMEOUT + 'ms');
                            done();
                            return;
                        }
                        expect(receivedRemove.dialogId).toEqual(dialogIdPrivate);
                        expect(receivedRemove.messageId).toEqual(messageId);
                        expect(receivedRemove.reactionName).toEqual('like');
                        expect(receivedRemove.userId).toEqual(QBUser1.id);
                        expect(receivedRemove.action).toEqual('remove');
                        done();
                    }, NOTICE_EVENT_TIMEOUT);
                };

                QB_A.chat.message.addReaction(messageId, 'like', function (errAdd) {
                    expect(errAdd).toBeNull();
                });
            });
        }, 2 * REST_REQUESTS_TIMEOUT + 2 * NOTICE_EVENT_TIMEOUT + 2000);

        it('I-RX-3 (group): reaction add is delivered to both MUC participants', function (done) {
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdGroup,
                message: 'group reaction target ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                var dual = setupDualListener('onMessageReactionChangedListener');

                QB_A.chat.message.addReaction(messageId, 'heart', function (errAdd) {
                    expect(errAdd).toBeNull();
                });

                dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                    if (failMsg) {
                        fail(failMsg);
                        dual.clear();
                        done();
                        return;
                    }
                    var eventA = dual.getLastA()[0];
                    var eventB = dual.getLastB()[0];
                    expect(eventA.dialogId).toEqual(dialogIdGroup);
                    expect(eventA.messageId).toEqual(messageId);
                    expect(eventA.reactionName).toEqual('heart');
                    expect(eventA.action).toEqual('add');
                    expect(eventB.dialogId).toEqual(dialogIdGroup);
                    expect(eventB.messageId).toEqual(messageId);
                    expect(eventB.reactionName).toEqual('heart');
                    expect(eventB.action).toEqual('add');
                    dual.clear();
                    done();
                });
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-RX-4 (group): reaction remove is delivered to both MUC participants', function (done) {
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdGroup,
                message: 'group reaction remove target ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                // Wait until BOTH A and B receive the add-notice before arming remove-listeners,
                // otherwise dual.waitForBoth fires immediately on residual add events.
                var addDual = setupDualListener('onMessageReactionChangedListener');

                QB_A.chat.message.addReaction(messageId, 'heart', function (errAdd) {
                    expect(errAdd).toBeNull();
                });

                addDual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (addFailMsg) {
                    addDual.clear();
                    if (addFailMsg) {
                        fail('add setup failed: ' + addFailMsg);
                        done();
                        return;
                    }

                    var removeDual = setupDualListener('onMessageReactionChangedListener');

                    QB_A.chat.message.removeReaction(messageId, 'heart', function (errRm) {
                        expect(errRm).toBeNull();
                    });

                    removeDual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (rmFailMsg) {
                        if (rmFailMsg) {
                            fail(rmFailMsg);
                            removeDual.clear();
                            done();
                            return;
                        }
                        expect(removeDual.getLastA()[0].action).toEqual('remove');
                        expect(removeDual.getLastA()[0].reactionName).toEqual('heart');
                        expect(removeDual.getLastB()[0].action).toEqual('remove');
                        expect(removeDual.getLastB()[0].reactionName).toEqual('heart');
                        removeDual.clear();
                        done();
                    });
                });
            });
        }, 2 * REST_REQUESTS_TIMEOUT + 2 * NOTICE_EVENT_TIMEOUT);

        it('I-RX-5 (verify via getById): after addReaction, getById(id, {include_reactions:1}) returns reactions[]', function (done) {
            // Combines CROS-1054 (addReaction) + CROS-1057 (getById with include_reactions).
            // Verifies XMPP-notice and REST-state are consistent.
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdPrivate,
                message: 'reaction getById target ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                QB_A.chat.message.addReaction(messageId, 'like', function (errAdd) {
                    expect(errAdd).toBeNull();

                    QB_A.chat.message.getById(messageId, { include_reactions: 1 }, function (errGet, fetched) {
                        expect(errGet).toBeNull();
                        expect(fetched).toBeDefined();
                        expect(fetched._id).toEqual(messageId);
                        expect(fetched.reactions).toBeDefined();
                        // Server contract: reactions object is non-empty after addReaction.
                        // Either reactions.total > 0 or reactions has a key for the reaction name.
                        var hasReactionData =
                            (fetched.reactions.total && fetched.reactions.total > 0) ||
                            (fetched.reactions.like && fetched.reactions.like.length > 0) ||
                            (Array.isArray(fetched.reactions) && fetched.reactions.length > 0);
                        expect(hasReactionData).toBe(true);
                        done();
                    });
                });
            });
        }, 3 * REST_REQUESTS_TIMEOUT);

        it('I-RX-6 (history reload): after addReaction, message.list({include_reactions:1}) returns reactions[] for the message', function (done) {
            // Regression for notice-smoke 2026-05-25: page reload lost reactions
            // because message.list?include_reactions=1 response shape is an ARRAY
            // of { name, count, user_ids } objects, not an object keyed by name.
            // I-RX-5 verifies getById; this test verifies message.list because
            // the sample (and most consumers) load history via message.list, not
            // getById, so the array-form must be assertable here.
            QB_A.chat.message.create({
                chat_dialog_id: dialogIdGroup,
                message: 'reaction history reload target ' + Date.now()
            }, function (errCreate, msg) {
                expect(errCreate).toBeNull();
                var messageId = msg._id;

                QB_A.chat.message.addReaction(messageId, 'like', function (errAdd) {
                    expect(errAdd).toBeNull();

                    QB_A.chat.message.list({
                        chat_dialog_id: dialogIdGroup,
                        sort_desc: 'date_sent',
                        limit: 50,
                        include_reactions: 1
                    }, function (errList, res) {
                        expect(errList).toBeNull();
                        expect(res).toBeDefined();
                        expect(Array.isArray(res.items)).toBe(true);

                        var found = (res.items || []).filter(function (m) { return m._id === messageId; })[0];
                        expect(found).toBeDefined();
                        expect('reactions' in found).toBe(true);

                        // Server contract (CROS-1054, confirmed 2026-05-25 via notice-smoke
                        // diagnostic logging on app 75949): reactions is an Array of
                        // { name: String, count: Number, user_ids: Number[] } objects.
                        // Object-keyed legacy shape is also tolerated for backward compat.
                        var likeEntry;
                        if (Array.isArray(found.reactions)) {
                            likeEntry = found.reactions.filter(function (r) { return r && r.name === 'like'; })[0];
                            expect(likeEntry).toBeDefined();
                            expect(likeEntry.count).toBeGreaterThan(0);
                            expect(Array.isArray(likeEntry.user_ids)).toBe(true);
                            expect(likeEntry.user_ids.indexOf(QB_A.service.qbInst.session.user_id) >= 0).toBe(true);
                        } else if (found.reactions && typeof found.reactions === 'object') {
                            // Legacy object-keyed shape (kept tolerated by the sample's normaliseReactions).
                            expect(Array.isArray(found.reactions.like)).toBe(true);
                            expect(found.reactions.like.length).toBeGreaterThan(0);
                        } else {
                            fail('reactions field is neither Array nor Object: ' + JSON.stringify(found.reactions));
                        }
                        done();
                    });
                });
            });
        }, 3 * REST_REQUESTS_TIMEOUT);
    });

    // ------------------------------------------------------------------
    // 6.5 Dialog events
    // ------------------------------------------------------------------

    describe('Dialog events:', function () {

        it('I-DU-1 (private): dialog update name is delivered to BOTH participants', function (done) {
            // Note: private dialogs may not support .name updates on all server versions.
            // We use .photo as a more universal field. If your server doesn't deliver
            // notice for .photo on private, switch to a group dialog or a different field.
            var newPhoto = 'https://example.com/photo-' + Date.now() + '.png';
            var dual = setupDualListener('onDialogUpdatedListener');

            QB_A.chat.dialog.update(dialogIdPrivate, { photo: newPhoto }, function (errUpd) {
                expect(errUpd).toBeNull();
            });

            dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                if (failMsg) {
                    fail(failMsg);
                    dual.clear();
                    done();
                    return;
                }
                var dlgA = dual.getLastA()[0];
                var dlgB = dual.getLastB()[0];
                expect(dlgA._id).toEqual(dialogIdPrivate);
                expect(dlgB._id).toEqual(dialogIdPrivate);
                dual.clear();
                done();
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-DU-2 (group): dialog update name is delivered to both MUC participants', function (done) {
            var newName = 'group updated name ' + Date.now();
            var dual = setupDualListener('onDialogUpdatedListener');

            QB_A.chat.dialog.update(dialogIdGroup, { name: newName }, function (errUpd) {
                expect(errUpd).toBeNull();
            });

            dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                if (failMsg) {
                    fail(failMsg);
                    dual.clear();
                    done();
                    return;
                }
                expect(dual.getLastA()[0]._id).toEqual(dialogIdGroup);
                expect(dual.getLastA()[0].name).toEqual(newName);
                expect(dual.getLastB()[0]._id).toEqual(dialogIdGroup);
                expect(dual.getLastB()[0].name).toEqual(newName);
                dual.clear();
                done();
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-DU-3 (group): dialog update photo is delivered to both MUC participants', function (done) {
            var newPhoto = 'https://example.com/group-photo-' + Date.now() + '.png';
            var dual = setupDualListener('onDialogUpdatedListener');

            QB_A.chat.dialog.update(dialogIdGroup, { photo: newPhoto }, function (errUpd) {
                expect(errUpd).toBeNull();
            });

            dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                if (failMsg) {
                    fail(failMsg);
                    dual.clear();
                    done();
                    return;
                }
                expect(dual.getLastA()[0]._id).toEqual(dialogIdGroup);
                expect(dual.getLastA()[0].photo).toEqual(newPhoto);
                expect(dual.getLastB()[0]._id).toEqual(dialogIdGroup);
                expect(dual.getLastB()[0].photo).toEqual(newPhoto);
                dual.clear();
                done();
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-DU-4 (group): push_all occupants_ids adds participant and delivers UpdatedDialog to both', function (done) {
            // Create a dedicated group dialog with NO extra occupants (only the creator).
            // Then push_all QBUser2.id. This is the first-time add — server accepts it
            // and fires NoticeUpdatedDialog. Both A (creator/actor) and B (newly added)
            // must receive onDialogUpdatedListener with the merged occupants_ids.
            QB_A.chat.dialog.create({
                type: 2,
                name: 'CROS-1055 group push_all ' + Date.now(),
                occupants_ids: [] // start without QBUser2
            }, function (errC, dlg) {
                expect(errC).toBeNull();
                var tempDialogId = dlg._id;
                var jid = QB_A.chat.helpers.getRoomJidFromDialogId(tempDialogId);

                // QB_A joins MUC. QB_B is not yet in occupants_ids, so cannot join yet.
                QB_A.chat.muc.join(jid, function (errJA, _resA) {
                    expect(errJA).toBeNull();

                    var dual = setupDualListener('onDialogUpdatedListener');

                    QB_A.chat.dialog.update(
                        tempDialogId,
                        { push_all: { occupants_ids: [QBUser2.id] } },
                        function (errUpd, _res) {
                            expect(errUpd).toBeNull();
                        }
                    );

                    dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                        if (failMsg) {
                            fail(failMsg);
                            dual.clear();
                            QB_A.chat.dialog.delete([tempDialogId], { force: 1 }, function () { done(); });
                            return;
                        }
                        var dlgA = dual.getLastA()[0];
                        var dlgB = dual.getLastB()[0];
                        expect(dlgA._id).toEqual(tempDialogId);
                        expect(dlgB._id).toEqual(tempDialogId);
                        expect(Array.isArray(dlgA.occupants_ids)).toBe(true);
                        expect(dlgA.occupants_ids.indexOf(QBUser2.id) >= 0).toBe(true);
                        expect(dlgB.occupants_ids.indexOf(QBUser2.id) >= 0).toBe(true);
                        dual.clear();
                        QB_A.chat.dialog.delete([tempDialogId], { force: 1 }, function () { done(); });
                    });
                });
            });
        }, 3 * REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-DU-5 (group): pull_all occupants_ids removes participant and delivers UpdatedDialog to actor', function (done) {
            // Create a dedicated group with QBUser2 included, then pull_all QBUser2.
            // After pull_all, QBUser2 is no longer a member, so the server fan-out
            // target list shrinks — QB_B may or may not receive the final notice
            // depending on whether the server sends it BEFORE or AFTER removing
            // them from occupants. We assert that the actor (QB_A) definitely
            // receives onDialogUpdatedListener with QBUser2 absent from
            // occupants_ids; QB_B receipt is best-effort (not required).
            QB_A.chat.dialog.create({
                type: 2,
                name: 'CROS-1055 group pull_all ' + Date.now(),
                occupants_ids: [QBUser2.id]
            }, function (errC, dlg) {
                expect(errC).toBeNull();
                var tempDialogId = dlg._id;
                var jid = QB_A.chat.helpers.getRoomJidFromDialogId(tempDialogId);

                QB_A.chat.muc.join(jid, function (errJA, _resA) {
                    expect(errJA).toBeNull();

                    var firedA = false;
                    var lastA = null;
                    QB_A.chat.onDialogUpdatedListener = function (dialog) {
                        if (dialog && dialog._id === tempDialogId) {
                            firedA = true;
                            lastA = dialog;
                        }
                    };

                    QB_A.chat.dialog.update(
                        tempDialogId,
                        { pull_all: { occupants_ids: [QBUser2.id] } },
                        function (errUpd, _res) {
                            expect(errUpd).toBeNull();
                        }
                    );

                    setTimeout(function () {
                        expect(firedA).toBe(true);
                        if (lastA && Array.isArray(lastA.occupants_ids)) {
                            expect(lastA.occupants_ids.indexOf(QBUser2.id) < 0).toBe(true);
                        }
                        QB_A.chat.onDialogUpdatedListener = null;
                        QB_A.chat.dialog.delete([tempDialogId], { force: 1 }, function () { done(); });
                    }, NOTICE_EVENT_TIMEOUT);
                });
            });
        }, 3 * REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-DA-1 (group): admin_ids update via push_all is delivered to both MUC participants', function (done) {
            var dual = setupDualListener('onDialogUpdatedListener');

            QB_A.chat.dialog.update(dialogIdGroup, {
                push_all: {
                    admin_ids: [QBUser2.id]
                }
            }, function (errUpd) {
                expect(errUpd).toBeNull();
            });

            dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                if (failMsg) {
                    fail(failMsg);
                    dual.clear();
                    done();
                    return;
                }
                var dlgA = dual.getLastA()[0];
                var dlgB = dual.getLastB()[0];
                expect(dlgA._id).toEqual(dialogIdGroup);
                expect(dlgB._id).toEqual(dialogIdGroup);
                expect(dlgA.admin_ids).toContain(QBUser2.id);
                expect(dlgB.admin_ids).toContain(QBUser2.id);
                dual.clear();
                done();
            });
        }, REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-DA-2 (private): admin_ids update is sent and backend returns empty admin_ids', function (done) {
            QB_A.chat.dialog.update(dialogIdPrivate, {
                admin_ids: [QBUser2.id]
            }, function (errUpd, res) {
                expect(errUpd).toBeNull();
                expect(res).toBeDefined();
                if (res.admin_ids) {
                    expect(res.admin_ids.length).toEqual(0);
                } else {
                    expect(res.admin_ids).toBeFalsy();
                }
                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('I-DD-1 (private): dialog delete is delivered to BOTH participants', function (done) {
            // Use a fresh private dialog to avoid breaking other tests.
            QB_A.chat.dialog.create({
                type: 3,
                occupants_ids: [QBUser2.id]
            }, function (errC, dlg) {
                expect(errC).toBeNull();
                var tempDialogId = dlg._id;

                var dual = setupDualListener('onDialogDeletedListener');

                QB_A.chat.dialog.delete([tempDialogId], { force: 1 }, function (errDel) {
                    expect(errDel).toBeNull();
                });

                dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                    if (failMsg) {
                        fail(failMsg);
                        dual.clear();
                        done();
                        return;
                    }
                    expect(dual.getLastA()[0]).toEqual(tempDialogId);
                    expect(dual.getLastB()[0]).toEqual(tempDialogId);
                    dual.clear();
                    done();
                });
            });
        }, 2 * REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);

        it('I-DD-2 (group): dialog delete is delivered to both MUC participants', function (done) {
            QB_A.chat.dialog.create({
                type: 2,
                name: 'CROS-1055 group to delete ' + Date.now(),
                occupants_ids: [QBUser2.id]
            }, function (errC, dlg) {
                expect(errC).toBeNull();
                var tempDialogId = dlg._id;
                var jid = QB_A.chat.helpers.getRoomJidFromDialogId(tempDialogId);

                QB_A.chat.muc.join(jid, function (errJA, _resA) {
                    expect(errJA).toBeNull();

                    QB_B.chat.muc.join(jid, function (errJB, _resB) {
                        expect(errJB).toBeNull();

                        var dual = setupDualListener('onDialogDeletedListener');

                        QB_A.chat.dialog.delete([tempDialogId], { force: 1 }, function (errDel) {
                            expect(errDel).toBeNull();
                        });

                        dual.waitForBoth(NOTICE_EVENT_TIMEOUT, function (failMsg) {
                            if (failMsg) {
                                fail(failMsg);
                                dual.clear();
                                done();
                                return;
                            }
                            expect(dual.getLastA()[0]).toEqual(tempDialogId);
                            expect(dual.getLastB()[0]).toEqual(tempDialogId);
                            dual.clear();
                            done();
                        });
                    });
                });
            });
        }, 3 * REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);
    });

    // ------------------------------------------------------------------
    // 6.6 MUC precondition (group only)
    // ------------------------------------------------------------------

    describe('MUC precondition:', function () {
        // I-MUC-1 originally checked that a participant who hasn't joined MUC
        // does NOT receive group notice events. Real-server behavior on this
        // backend (verified 2026-05-07) is different: NoticeUpdatedDialog is
        // routed to all dialog `occupants_ids` regardless of MUC presence —
        // notice headline stanzas use the dialog membership, not MUC roster,
        // for fan-out. MUC join is only required for actual `<message
        // type="groupchat">` body delivery, not for Notice events.
        //
        // The test now documents this observed behavior: both A (in MUC) and
        // B (NOT in MUC) receive `onDialogUpdatedListener`. If the server
        // contract ever changes back, this test will surface the regression.
        it('I-MUC-1: group dialog notice is delivered by occupants_ids (not by MUC roster)', function (done) {
            QB_A.chat.dialog.create({
                type: 2,
                name: 'CROS-1055 muc-precondition ' + Date.now(),
                occupants_ids: [QBUser2.id]
            }, function (errC, dlg) {
                expect(errC).toBeNull();
                var tempDialogId = dlg._id;
                var jid = QB_A.chat.helpers.getRoomJidFromDialogId(tempDialogId);

                // Only QB_A joins MUC. QB_B intentionally does NOT join.
                QB_A.chat.muc.join(jid, function (errJA, _resA) {
                    expect(errJA).toBeNull();

                    var firedA = false;
                    var firedB = false;

                    QB_A.chat.onDialogUpdatedListener = function () { firedA = true; };
                    QB_B.chat.onDialogUpdatedListener = function () { firedB = true; };

                    QB_A.chat.dialog.update(tempDialogId, {
                        name: 'renamed before B joins ' + Date.now()
                    }, function (errUpd) {
                        expect(errUpd).toBeNull();
                    });

                    setTimeout(function () {
                        // Both fired: A is in MUC and is occupant; B is NOT in MUC but IS in occupants_ids.
                        expect(firedA).toBe(true);
                        expect(firedB).toBe(true); // observed server behavior, not the original Android-derived hypothesis.
                        QB_A.chat.onDialogUpdatedListener = null;
                        QB_B.chat.onDialogUpdatedListener = null;
                        done();
                    }, NOTICE_EVENT_TIMEOUT);
                });
            });
        }, 3 * REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);
    });

    // ------------------------------------------------------------------
    // Disable-then-re-enable lifecycle (kept at the end so other tests
    // don't run with notices off).
    // ------------------------------------------------------------------

    describe('Disable fan-out:', function () {
        it('I-EN-3: after disableNotices() on QB_B, QB_B does NOT receive notice; QB_A (still enabled) does', function (done) {
            // 1. Disable notice subscription on QB_B only.
            QB_B.chat.disableNotices(function (errDis) {
                expect(errDis).toBeNull();
                expect(QB_B.chat.isNoticesEnabled()).toBe(false);

                // 2. Set listeners on both — QB_B's must NOT fire.
                var firedA = false;
                var firedB = false;
                QB_A.chat.onDialogUpdatedListener = function () { firedA = true; };
                QB_B.chat.onDialogUpdatedListener = function () { firedB = true; };

                // 3. Trigger a dialog update — actor QB_A, dialog with both A and B.
                QB_A.chat.dialog.update(
                    dialogIdGroup,
                    { name: 'disable fan-out test ' + Date.now() },
                    function (errUpd) {
                        expect(errUpd).toBeNull();
                    }
                );

                // 4. Wait the full notice window. QB_A receives (still enabled),
                //    QB_B must NOT (disabled).
                setTimeout(function () {
                    expect(firedA).toBe(true);
                    expect(firedB).toBe(false);
                    QB_A.chat.onDialogUpdatedListener = null;
                    QB_B.chat.onDialogUpdatedListener = null;

                    // 5. Re-enable QB_B so afterAll cleanup paths and any later
                    //    tests (or re-runs) see a consistent state.
                    QB_B.chat.enableNotices(function (errReB) {
                        expect(errReB).toBeNull();
                        expect(QB_B.chat.isNoticesEnabled()).toBe(true);
                        done();
                    });
                }, NOTICE_EVENT_TIMEOUT);
            });
        }, 3 * REST_REQUESTS_TIMEOUT + NOTICE_EVENT_TIMEOUT);
    });

    // ------------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------------

    afterAll(function (done) {
        // Best-effort cleanup. Errors are ignored — tests already passed by here.
        var pending = 0;
        var checkDone = function () {
            pending--;
            if (pending === 0) {
                QB_A.chat.disconnect();
                QB_B.chat.disconnect();
                done();
            }
        };

        if (dialogIdGroup) {
            pending++;
            QB_A.chat.dialog.delete([dialogIdGroup], { force: 1 }, checkDone);
        }
        if (dialogIdPrivate) {
            pending++;
            QB_A.chat.dialog.delete([dialogIdPrivate], { force: 1 }, checkDone);
        }
        if (pending === 0) {
            QB_A.chat.disconnect();
            QB_B.chat.disconnect();
            done();
        }
    }, 2 * REST_REQUESTS_TIMEOUT);
});
