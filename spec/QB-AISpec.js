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

    describe('AI gateway tests', function() {

        describe('gateway validation tests', function() {

            it('should throw error without callback', function() {
                var messages = [{ role: 'user', content: [{ type: 'text', text: 'Hello' }] }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages);
                }).toThrowError('Callback function is required and must be a function');
            });

            it('should throw error without smartChatAssistantId', function() {
                var messages = [{ role: 'user', content: [{ type: 'text', text: 'Hello' }] }];
                expect(function() {
                    QB_SENDER.ai.gateway(null, messages, function() {});
                }).toThrowError('smartChatAssistantId is required and must be a string');
            });

            it('should throw error without messages', function() {
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, null, function() {});
                }).toThrowError('messages is required and must be an array');
            });

            it('should throw error with empty messages array', function() {
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, [], function() {});
                }).toThrowError('messages array cannot be empty');
            });

            it('should throw error with invalid role', function() {
                var messages = [{ role: 'invalid', content: [{ type: 'text', text: 'Hello' }] }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).toThrowError('Each message must have a valid role (user, assistant, or developer)');
            });

            it('should throw error with invalid content type', function() {
                var messages = [{ role: 'user', content: [{ type: 'invalid', text: 'Hello' }] }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).toThrowError('Each content item must have a valid type (text or image_url)');
            });

            it('should accept string content', function() {
                var messages = [{ role: 'user', content: 'Hello, this is a simple string' }];
                // Should not throw - string content is valid
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).not.toThrow();
            });

            it('should throw error when string content is empty', function() {
                var messages = [{ role: 'user', content: '' }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).toThrowError('String content cannot be empty');
            });

            it('should throw error when content is not string or array', function() {
                var messages = [{ role: 'user', content: 123 }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).toThrowError('Message content must be a string or array');
            });

            it('should throw error when content is null', function() {
                var messages = [{ role: 'user', content: null }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).toThrowError('Each message must have content (string or array)');
            });

            it('should throw error when text content item has no text', function() {
                var messages = [{ role: 'user', content: [{ type: 'text' }] }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).toThrowError('Text content item must have a text string');
            });

            it('should throw error when image_url content item has no url', function() {
                var messages = [{ role: 'user', content: [{ type: 'image_url' }] }];
                expect(function() {
                    QB_SENDER.ai.gateway(smartChatAssistantId, messages, function() {});
                }).toThrowError('Image content item must have image_url.url string');
            });

        });

        describe('gateway API tests', function() {

            beforeAll(function(done) {
                var createSessionParams = {
                    'login': QBUser1.login,
                    'password': QBUser1.password
                };
                QB_SENDER.createSession(createSessionParams, function(err, result) {
                    if (err) {
                        done.fail('Create session error: ' + JSON.stringify(err));
                    } else {
                        done();
                    }
                });
            }, REST_REQUESTS_TIMEOUT + LOGIN_TIMEOUT);

            it('should call gateway with text message (array content)', function(done) {
                var messages = [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Hello, what can you do?' }
                        ]
                    }
                ];

                QB_SENDER.ai.gateway(smartChatAssistantId, messages, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();
                    expect(res.answer).toBeDefined();
                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            it('should call gateway with string content', function(done) {
                var messages = [
                    {
                        role: 'user',
                        content: 'Hello, what can you do?'
                    }
                ];

                QB_SENDER.ai.gateway(smartChatAssistantId, messages, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();
                    expect(res.answer).toBeDefined();
                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            // Test case from PDF: image recognition with URL
            it('should call gateway with image URL for recognition', function(done) {
                var messages = [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: "what's in this image?"
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: 'https://www.decorilla.com/online-decorating/wp-content/uploads/2024/06/Deep-rich-colors-and-vintage-velvet-chairs-define-this-dark-academia-aesthetic-by-Decorilla-scaled.jpg'
                                }
                            }
                        ]
                    }
                ];

                QB_SENDER.ai.gateway(smartChatAssistantId, messages, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();
                    expect(res.answer).toBeDefined();
                    // Expected: description of library/reading room with bookshelves, fireplace, armchairs
                    done();
                });
            }, REST_REQUESTS_TIMEOUT * 3); // Longer timeout for image processing

            it('should call gateway with developer role', function(done) {
                var messages = [
                    {
                        role: 'developer',
                        content: [
                            { type: 'text', text: 'You are a helpful assistant.' }
                        ]
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Hello!' }
                        ]
                    }
                ];

                QB_SENDER.ai.gateway(smartChatAssistantId, messages, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();
                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            it('should call gateway with multi-turn conversation', function(done) {
                var messages = [
                    {
                        role: 'user',
                        content: [{ type: 'text', text: 'What is 2+2?' }]
                    },
                    {
                        role: 'assistant',
                        content: [{ type: 'text', text: '2+2 equals 4.' }]
                    },
                    {
                        role: 'user',
                        content: [{ type: 'text', text: 'And what is that multiplied by 3?' }]
                    }
                ];

                QB_SENDER.ai.gateway(smartChatAssistantId, messages, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();
                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            afterAll(function(done) {
                QB_SENDER.destroySession(function(err, result) {
                    expect(QB_SENDER.service.qbInst.session).toBeNull();
                    done();
                });
            });

        });

    });

    describe('AI summarize tests', function() {

        describe('summarize validation tests', function() {

            it('should throw error without callback', function() {
                expect(function() {
                    QB_SENDER.ai.summarize(smartChatAssistantId, 'dialog123');
                }).toThrowError('Callback function is required and must be a function');
            });

            it('should throw error without smartChatAssistantId', function() {
                expect(function() {
                    QB_SENDER.ai.summarize(null, 'dialog123', function() {});
                }).toThrowError('smartChatAssistantId is required and must be a string');
            });

            it('should throw error with empty smartChatAssistantId', function() {
                expect(function() {
                    QB_SENDER.ai.summarize('', 'dialog123', function() {});
                }).toThrowError('smartChatAssistantId is required and must be a string');
            });

            it('should throw error without dialogId', function() {
                expect(function() {
                    QB_SENDER.ai.summarize(smartChatAssistantId, null, function() {});
                }).toThrowError('dialogId is required and must be a string');
            });

            it('should throw error with empty dialogId', function() {
                expect(function() {
                    QB_SENDER.ai.summarize(smartChatAssistantId, '', function() {});
                }).toThrowError('dialogId is required and must be a string');
            });

        });

        describe('summarize API tests', function() {

            var testDialogId = '507f1f77bcf86cd799439011'; // Mock dialog ID for testing

            beforeAll(function(done) {
                var createSessionParams = {
                    'login': QBUser1.login,
                    'password': QBUser1.password
                };
                QB_SENDER.createSession(createSessionParams, function(err, result) {
                    if (err) {
                        done.fail('Create session error: ' + JSON.stringify(err));
                    } else {
                        done();
                    }
                });
            }, REST_REQUESTS_TIMEOUT + LOGIN_TIMEOUT);

            it('should call summarize with valid dialogId', function(done) {
                QB_SENDER.ai.summarize(smartChatAssistantId, testDialogId, function(err, res) {
                    // Either success with summary or error (feature not enabled / dialog not found)
                    // We're testing that the request is properly formed
                    if (err) {
                        // Expected errors: 404 (dialog not found), 405 (feature disabled)
                        expect([404, 405]).toContain(err.code);
                    } else {
                        expect(res).toBeDefined();
                        expect(res.summary).toBeDefined();
                    }
                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            afterAll(function(done) {
                QB_SENDER.destroySession(function(err, result) {
                    expect(QB_SENDER.service.qbInst.session).toBeNull();
                    done();
                });
            });

        });

    });
});

