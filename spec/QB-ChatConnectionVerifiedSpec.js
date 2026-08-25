'use strict';

/**
 * [QC-1550] Unit tests for the connection-verification flags introduced in
 * src/modules/chat/qbChat.js. These tests are intentionally narrow: they cover
 * the state contract (initial values + reset on disconnect) without mocking
 * Strophe or wiring up a real XMPP connection.
 *
 * Full behavioural coverage (pong-defer reconnect listener, ping failure
 * gating, stale ping timer cleanup) is verified through Q-Consultation
 * integration testing — see ANALYSIS-AND-FIX-PLAN.md Stage 6 (SDK-9).
 *
 * This file is NOT registered in spec/support/jasmine.json. Run explicitly:
 *   npx jasmine spec/QB-ChatConnectionVerifiedSpec.js
 *
 * It does not require a live QuickBlox account and does not perform any
 * network calls. It only instantiates ChatProxy and checks its in-memory
 * state.
 */

var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

var QB = isNodeEnv ? require('../src/qbMain.js') : window.QB;

describe('[QC-1550] ChatProxy connection-verification state contract', function () {

    var instance;
    var chat;

    beforeEach(function () {
        instance = new QB.QuickBlox();
        // Minimal init: we only need ChatProxy to exist. We pass placeholder
        // credentials because init() validates the shape but never establishes
        // a connection until chat.connect() is called.
        instance.init(
            12345,                         // appId (placeholder)
            'placeholder-auth-key',
            'placeholder-auth-secret',
            'placeholder-account-key'
        );
        chat = instance.chat;
    });

    afterEach(function () {
        // ChatProxy holds timers internally; disconnect() clears them and
        // marks _isLogout=true so any in-flight callbacks become no-ops.
        try {
            chat.disconnect();
        } catch (e) {
            // disconnect() may throw in pure node env without real connection;
            // safe to ignore in this isolated unit test.
        }
    });

    it('initial _isConnectionVerified is false', function () {
        expect(chat._isConnectionVerified).toBe(false);
    });

    it('initial _isReconnectListenerPending is false', function () {
        expect(chat._isReconnectListenerPending).toBe(false);
    });

    it('disconnect() resets _isConnectionVerified and _isReconnectListenerPending to false', function () {
        // Simulate that a previous session had reached the verified state
        // with a pending reconnect listener (the in-flight reconnect would
        // normally clear pending on pong; here we test the explicit
        // disconnect cleanup contract).
        chat._isConnectionVerified = true;
        chat._isReconnectListenerPending = true;

        chat.disconnect();

        expect(chat._isConnectionVerified).toBe(false);
        expect(chat._isReconnectListenerPending).toBe(false);
    });
});
