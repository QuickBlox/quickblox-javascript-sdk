/*eslint strict:off */

/**
 * Template for spec/config.local.js — copy it, fill in the values of your own
 * QuickBlox application (Dashboard -> Overview) and two test users:
 *
 *   cp spec/config.local.example.js spec/config.local.js
 *
 * spec/config.local.js is gitignored and must never be committed. It is picked
 * up by spec/config.js in both Node (require) and the browser (SpecRunner.html
 * loads it before config.js). Leave a field empty to keep the default from
 * spec/config.js; environment variables override this file.
 */
(function() {
    var overrides = {
        CREDS: {
            appId: 0,
            authKey: '',
            authSecret: '',
            accountKey: '',
            sessionToken: ''
        },
        QBUser1: {
            id: 0,
            login: '',
            password: '',
            email: null
        },
        QBUser2: {
            id: 0,
            login: '',
            password: '',
            email: null
        },
        AI: {
            // Smart Chat Assistant used by spec/QB-AISpec.js
            smartChatAssistantId: ''
        }
    };

    if (typeof module == 'object' && module.exports) {
        module.exports = overrides;
    } else {
        window.QB_TEST_OVERRIDES = overrides;
    }
}());
