/*eslint strict:off */

(function() {
    'use strict';

    /**
     * Test credentials are NOT stored in this repository.
     *
     * Node:
     *   cp spec/config.local.example.js spec/config.local.js   # gitignored
     *   ...and fill it in, or export QB_APP_ID / QB_AUTH_KEY / QB_AUTH_SECRET /
     *   QB_ACCOUNT_KEY / QB_USER1_ID / QB_USER1_LOGIN / QB_USER1_PASSWORD /
     *   QB_USER2_ID / QB_USER2_LOGIN / QB_USER2_PASSWORD / QB_AI_ASSISTANT_ID.
     *
     * Browser (SpecRunner.html):
     *   the same spec/config.local.js is loaded before this file and assigns
     *   window.QB_TEST_OVERRIDES.
     *
     * Environment variables win over config.local.js, which wins over the
     * empty defaults below.
     */

    var isNodeEnv = typeof window == 'undefined' && typeof exports == 'object',
        customExport = isNodeEnv ? exports : window;

    var CREDS = {
        appId: 0,
        authKey: '',
        authSecret: '',
        accountKey: '',
        sessionToken: ''
    };

    var QBUser1 = {
        'id': 0,
        'login': '',
        'password': '',
        'email': null
    };
    var QBUser2 = {
        'id': 0,
        'login': '',
        'password': '',
        'email': null
    };

    var AI = {
        smartChatAssistantId: ''
    };

    var CONFIG = {
        endpoints: {
            api: "api.quickblox.com",
            chat: "chat.quickblox.com"
        },
        chatProtocol: {
            active: 2 // set 1 to use BOSH, set 2 to use WebSockets (default)
        },
        pingTimeout: 3,
        debug: {
            'mode': 1,
            'file': null
        }
    };

    /** Shallow-merge only the keys the override actually defines. */
    function apply(target, source) {
        if (!source) return target;

        for (var key in target) {
            if (Object.prototype.hasOwnProperty.call(source, key) &&
                source[key] !== undefined && source[key] !== null && source[key] !== '') {
                target[key] = source[key];
            }
        }

        return target;
    }

    /** spec/config.local.js — untracked, absent on a fresh checkout. */
    function loadLocalOverrides() {
        if (!isNodeEnv) return typeof window.QB_TEST_OVERRIDES == 'object' ? window.QB_TEST_OVERRIDES : null;

        try {
            return require('./config.local');
        } catch (e) {
            return null;
        }
    }

    function fromEnv() {
        if (!isNodeEnv || typeof process == 'undefined' || !process.env) return null;

        var env = process.env;

        return {
            CREDS: {
                appId: env.QB_APP_ID ? Number(env.QB_APP_ID) : undefined,
                authKey: env.QB_AUTH_KEY,
                authSecret: env.QB_AUTH_SECRET,
                accountKey: env.QB_ACCOUNT_KEY,
                sessionToken: env.QB_SESSION_TOKEN
            },
            QBUser1: {
                id: env.QB_USER1_ID ? Number(env.QB_USER1_ID) : undefined,
                login: env.QB_USER1_LOGIN,
                password: env.QB_USER1_PASSWORD,
                email: env.QB_USER1_EMAIL
            },
            QBUser2: {
                id: env.QB_USER2_ID ? Number(env.QB_USER2_ID) : undefined,
                login: env.QB_USER2_LOGIN,
                password: env.QB_USER2_PASSWORD,
                email: env.QB_USER2_EMAIL
            },
            AI: {
                smartChatAssistantId: env.QB_AI_ASSISTANT_ID
            }
        };
    }

    [loadLocalOverrides(), fromEnv()].forEach(function(overrides) {
        if (!overrides) return;

        apply(CREDS, overrides.CREDS);
        apply(QBUser1, overrides.QBUser1);
        apply(QBUser2, overrides.QBUser2);
        apply(AI, overrides.AI);
        apply(CONFIG.endpoints, overrides.endpoints);
    });

    if (!CREDS.appId || !CREDS.authKey || !CREDS.authSecret || !CREDS.accountKey) {
        var warn = 'QuickBlox test credentials are not configured. ' +
            'Integration specs will fail. See the header of spec/config.js.';

        if (typeof console != 'undefined' && console.warn) console.warn(warn);
    }

    customExport.CREDS = CREDS;
    customExport.QBUser1 = QBUser1;
    customExport.QBUser2 = QBUser2;
    customExport.AI = AI;
    customExport.CONFIG = CONFIG;
}());
