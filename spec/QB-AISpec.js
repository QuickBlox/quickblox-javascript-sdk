'use strict';

var LOGIN_TIMEOUT = 10000;
var REST_REQUESTS_TIMEOUT = 6000;

var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

var QB = isNodeEnv ? require('../src/qbMain.js') : window.QB;
var QB_SENDER = new QB.QuickBlox();

var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;
var CREDS =  {
    appId: 75949,
    authKey: 'DdS7zxMEm5Q7DaS',
    authSecret: 'g88RhdOjnDOqFkv',
    accountKey: 'uK_8uinNyz8-npTNB6tx',
    sessionToken: '000'
};

var QBUser1 =  {
    'id': 134804147,
    'login': "artimed",
    'password': "quickblox",
    'email': "test1@test.com"
};

var smartChatAssistantId = '6633a1300fea600001bd6e71';
var messageToTranslate = 'Hola!';
var messageToAssist = 'Where is my order?';

describe('AI tests', function() {

    beforeAll(function() {
        QB_SENDER.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, CONFIG);
    });

    describe('AI translate tests ', function() {
        const languages = { 'English': 'en',
            'Spanish': 'es',
            'Chinese simplified': 'zh-Hans',
            'Chinese traditional': 'zh-Hant',
            'French': 'fr',
            'German': 'de',
            'Japanese': 'ja',
            'Korean': 'ko',
            'Italian': 'it',
            'Russian': 'ru',
            'Portuguese': 'pt',
            'Arabic': 'ar',
            'Hindi': 'hi',
            'Turkish': 'tr',
            'Dutch': 'nl',
            'Polish': 'pl',
            'Ukrainian': 'uk',
            'Albanian': 'sq',
            'Armenian': 'hy',
            'Azerbaijani': 'az',
            'Basque': 'eu',
            'Belarusian': 'be',
            'Bengali': 'bn',
            'Bosnian': 'bs',
            'Bulgarian': 'bg',
            'Catalan': 'ca',
            'Croatian': 'hr',
            'Czech': 'cs',
            'Danish': 'da',
            'Estonian': 'et',
            'Finnish': 'fi',
            'Galician': 'gl',
            'Georgian': 'ka',
            'Greek': 'el',
            'Gujarati': 'gu',
            'Hungarian': 'hu',
            'Indonesian': 'id',
            'Irish': 'ga',
            'Kannada': 'kn',
            'Kazakh': 'kk',
            'Latvian': 'lv',
            'Lithuanian': 'lt',
            'Macedonian': 'mk',
            'Malay': 'ms',
            'Maltese': 'mt',
            'Mongolian': 'mn',
            'Nepali': 'ne',
            'Norwegian': 'no',
            'Pashto': 'ps',
            'Persian': 'fa',
            'Punjabi': 'pa',
            'Romanian': 'ro',
            'Sanskrit': 'sa',
            'Serbian': 'sr',
            'Sindhi': 'sd',
            'Sinhala': 'si',
            'Slovak': 'sk',
            'Slovenian': 'sl',
            'Uzbek': 'uz',
            'Vietnamese': 'vi',
            'Welsh': 'cy' };

        beforeAll(function(done) {
            var createSessionParams = {
                'login': QBUser1.login,
                'password': QBUser1.password
            };
            QB_SENDER.createSession(createSessionParams, function (err, result) {
                expect(err).toBeNull();
                expect(result).toBeDefined();
                expect(result.application_id).toEqual(CREDS.appId);
                var connectToChatParams = {
                    'userId': QBUser1.id,
                    'password': QBUser1.password
                };
                QB_SENDER.chat.connect(connectToChatParams, function(err) {
                    expect(err).toBeNull();
                    done();
                });
            });
        }, REST_REQUESTS_TIMEOUT+LOGIN_TIMEOUT);

        Object.keys(languages).forEach((language) => {
            describe(`translate to ${language}`, function() {
                it('test Hello', function(done) {
                    const languageCode = languages[language];
                    QB_SENDER.ai.translate(smartChatAssistantId, messageToTranslate, languageCode,function(err, res) {
                        expect(err).toBeNull();
                        expect(res).not.toBeNull();
                        done();
                    });
                }, REST_REQUESTS_TIMEOUT);
            });
        });

        afterAll(function(done) {
            QB_SENDER.chat.disconnect();
            QB_SENDER.destroySession(function (err, result){
                expect(QB_SENDER.service.qbInst.session).toBeNull();
                done();
            });
        });
    });
    describe('AI answerAssist tests', function() {

        describe('test answerAssist', function() {

            beforeAll(function(done) {
                var createSessionParams = {
                    'login': QBUser1.login,
                    'password': QBUser1.password
                };

                QB_SENDER.createSession(createSessionParams, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    expect(result.application_id).toEqual(CREDS.appId);

                    var connectToChatParams = {
                        'userId': QBUser1.id,
                        'password': QBUser1.password
                    };
                    QB_SENDER.chat.connect(connectToChatParams, function(err) {
                        expect(err).toBeNull();
                        done();
                    });
                });
            }, REST_REQUESTS_TIMEOUT+LOGIN_TIMEOUT);

            it('test with valid history', function(done) {
                var history = [
                    {role: "user", message: "Hello"},
                    {role: "assistant", message: "Hi"}
                ];

                QB_SENDER.ai.answerAssist(smartChatAssistantId, messageToAssist, history, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            it('test with invalid history', function() {
                var invalidHistory = "Invalid string, not an array";
                expect(() => {
                    QB_SENDER.ai.answerAssist(smartChatAssistantId, messageToAssist, invalidHistory, function(err, res) {
                    });
                }).toThrow(new Error('History must be an array'));
            }, REST_REQUESTS_TIMEOUT);

            it('test with history item missing role or message', function() {
                var invalidHistory = [{role: "user"}]; // missing "message"
                expect(() => {
                    QB_SENDER.ai.answerAssist(smartChatAssistantId, messageToAssist, invalidHistory, function(err, res) {});
                }).toThrow(new Error('Each element of history must have an role and message fields'));
            }, REST_REQUESTS_TIMEOUT);
            afterAll(function(done) {
                QB_SENDER.chat.disconnect();
                QB_SENDER.destroySession(function (err, result){
                    expect(QB_SENDER.service.qbInst.session).toBeNull();
                    done();
                });
            });
        });
    });
});

