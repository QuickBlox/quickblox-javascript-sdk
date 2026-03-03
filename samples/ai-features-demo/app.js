/**
 * QuickBlox AI Features Demo
 * Demonstrates all AI methods: gateway, summarize, translate, answerAssist
 */

// ==================== CONFIGURATION ====================
// Fill these values for quick testing, or leave empty to enter manually in UI

var CONFIG = {
    appId: -1,
    authKey: '',
    authSecret: '',
    accountKey: ''
};

var USER = {
    login: 'artimed',
    password: 'quickblox'
};

var SMART_CHAT_ASSISTANT_ID = '';

// Default image URL for testing (from QuickBlox documentation)
var DEFAULT_IMAGE_URL = 'https://www.decorilla.com/online-decorating/wp-content/uploads/2024/06/Deep-rich-colors-and-vintage-velvet-chairs-define-this-dark-academia-aesthetic-by-Decorilla-scaled.jpg';

// ==================== STATE ====================

var smartChatAssistantId = '';
var isInitialized = false;

// DOM Elements cache
var elements = {};

// ==================== INITIALIZATION ====================

window.onload = function() {
    // Cache DOM elements
    elements = {
        // Config
        appId: document.getElementById('appId'),
        authKey: document.getElementById('authKey'),
        authSecret: document.getElementById('authSecret'),
        accountKey: document.getElementById('accountKey'),
        userLogin: document.getElementById('userLogin'),
        userPassword: document.getElementById('userPassword'),
        assistantId: document.getElementById('assistantId'),
        status: document.getElementById('status'),
        initBtn: document.getElementById('initBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        aiSection: document.getElementById('aiSection'),
        // Gateway
        gatewayMessage: document.getElementById('gatewayMessage'),
        imageUrl: document.getElementById('imageUrl'),
        imageFile: document.getElementById('imageFile'),
        imageFileName: document.getElementById('imageFileName'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        clearImageBtn: document.getElementById('clearImageBtn'),
        gatewayResponse: document.getElementById('gatewayResponse'),
        // Summarize
        dialogId: document.getElementById('dialogId'),
        dialogList: document.getElementById('dialogList'),
        summarizeResponse: document.getElementById('summarizeResponse'),
        // Translate
        translateText: document.getElementById('translateText'),
        translateLang: document.getElementById('translateLang'),
        translateResponse: document.getElementById('translateResponse'),
        // Answer Assist
        assistMessage: document.getElementById('assistMessage'),
        historyContainer: document.getElementById('historyContainer'),
        assistResponse: document.getElementById('assistResponse'),
        // Logs
        logs: document.getElementById('logs')
    };

    // Initialize Materialize components
    M.AutoInit();

    // Populate UI fields from CONFIG (if values are set)
    populateConfigFromConstants();

    // Bind event listeners
    bindEventListeners();

    log('Page loaded. Enter credentials and click "Initialize & Login"');
};

// Populate UI fields from CONFIG constants
function populateConfigFromConstants() {
    // App credentials
    if (CONFIG.appId) {
        elements.appId.value = CONFIG.appId;
        M.updateTextFields();
    }
    if (CONFIG.authKey) {
        elements.authKey.value = CONFIG.authKey;
    }
    if (CONFIG.authSecret) {
        elements.authSecret.value = CONFIG.authSecret;
    }
    if (CONFIG.accountKey) {
        elements.accountKey.value = CONFIG.accountKey;
    }

    // User credentials
    if (USER.login) {
        elements.userLogin.value = USER.login;
    }
    if (USER.password) {
        elements.userPassword.value = USER.password;
    }

    // Smart Chat Assistant ID
    if (SMART_CHAT_ASSISTANT_ID) {
        elements.assistantId.value = SMART_CHAT_ASSISTANT_ID;
    }

    // Default image URL
    if (DEFAULT_IMAGE_URL) {
        elements.imageUrl.value = DEFAULT_IMAGE_URL;
    }

    // Update Materialize labels
    M.updateTextFields();

    log('Config loaded from constants');
}

function bindEventListeners() {
    // Init & Logout
    document.getElementById('initBtn').addEventListener('click', initAndLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Gateway
    document.getElementById('testTextBtn').addEventListener('click', testGatewayText);
    document.getElementById('testStringBtn').addEventListener('click', testGatewayStringContent);
    document.getElementById('testImageBtn').addEventListener('click', testGatewayImage);
    document.getElementById('testConversationBtn').addEventListener('click', testGatewayConversation);
    document.getElementById('gatewayBtn').addEventListener('click', sendGateway);
    document.getElementById('imageFile').addEventListener('change', handleImageUpload);
    document.getElementById('clearImageBtn').addEventListener('click', clearUploadedImage);

    // Summarize
    document.getElementById('loadDialogsBtn').addEventListener('click', loadDialogs);
    document.getElementById('summarizeBtn').addEventListener('click', summarizeDialog);

    // Translate
    document.getElementById('translateBtn').addEventListener('click', translateText);

    // Answer Assist
    document.getElementById('assistBtn').addEventListener('click', sendAssist);
    document.getElementById('addHistoryBtn').addEventListener('click', addHistoryItem);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Logs
    document.getElementById('clearLogsBtn').addEventListener('click', function() {
        elements.logs.textContent = '';
    });
}

// ==================== HELPERS ====================

function log(message) {
    var timestamp = new Date().toLocaleTimeString();
    elements.logs.textContent = '[' + timestamp + '] ' + message + '\n' + elements.logs.textContent;
    console.log(message);
}

function setStatus(text, isError) {
    elements.status.textContent = text;
    elements.status.className = isError ? 'red-text' : 'green-text';
}

function checkInit() {
    if (!isInitialized) {
        log('ERROR: Please initialize and login first');
        setStatus('Not initialized', true);
        return false;
    }
    if (!smartChatAssistantId) {
        log('ERROR: Smart Chat Assistant ID is required');
        return false;
    }
    return true;
}

// ==================== INIT & LOGIN ====================

function initAndLogin() {
    // Read from UI, fallback to constants if empty
    var appId = parseInt(elements.appId.value) || CONFIG.appId;
    var authKey = elements.authKey.value || CONFIG.authKey;
    var authSecret = elements.authSecret.value || CONFIG.authSecret;
    var accountKey = elements.accountKey.value || CONFIG.accountKey;
    var login = elements.userLogin.value || USER.login;
    var password = elements.userPassword.value || USER.password;
    smartChatAssistantId = elements.assistantId.value || SMART_CHAT_ASSISTANT_ID;

    if (!appId || !authKey || !authSecret || !accountKey) {
        setStatus('Please fill all credentials', true);
        return;
    }

    if (!login || !password) {
        setStatus('Please fill user credentials', true);
        return;
    }

    log('Initializing QuickBlox SDK...');
    setStatus('Initializing...', false);

    QB.init(appId, authKey, authSecret, accountKey, { debug: false });
    log('QB.init() completed. Version: ' + QB.version);

    var sessionParams = { login: login, password: password };
    log('Creating session for user: ' + login);

    QB.createSession(sessionParams, function(err, result) {
        if (err) {
            log('ERROR: Session creation failed - ' + JSON.stringify(err));
            setStatus('Session error', true);
            return;
        }

        log('Session created. User ID: ' + result.user_id);
        setStatus('Logged in (User ID: ' + result.user_id + ')', false);
        isInitialized = true;

        // Show AI sections and logout button
        elements.aiSection.style.display = 'block';
        elements.logoutBtn.style.display = 'inline-block';
        elements.initBtn.disabled = true;

        // Reinitialize tabs
        var tabsElem = document.querySelector('.tabs');
        M.Tabs.init(tabsElem);
    });
}

function logout() {
    log('Logging out...');
    setStatus('Logging out...', false);

    QB.destroySession(function(err, result) {
        if (err) {
            log('ERROR: Logout failed - ' + JSON.stringify(err));
            // Still reset UI even if API call fails
        } else {
            log('Session destroyed successfully');
        }

        // Reset state
        isInitialized = false;
        smartChatAssistantId = '';

        // Reset UI
        elements.aiSection.style.display = 'none';
        elements.logoutBtn.style.display = 'none';
        elements.initBtn.disabled = false;
        setStatus('Logged out', false);

        // Clear responses
        elements.gatewayResponse.textContent = '';
        elements.summarizeResponse.textContent = '';
        elements.translateResponse.textContent = '';
        elements.assistResponse.textContent = '';
        elements.dialogList.innerHTML = '';

        // Clear uploaded image
        clearUploadedImage();

        log('Ready to login again');
    });
}

// ==================== GATEWAY (NEW) ====================

// Handle image file upload - convert to base64 data URI
function handleImageUpload(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        log('ERROR: Please select an image file');
        return;
    }

    // Check file size (max 5MB for base64)
    if (file.size > 5 * 1024 * 1024) {
        log('ERROR: Image too large (max 5MB)');
        return;
    }

    log('Uploading image: ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB)');

    var reader = new FileReader();
    reader.onload = function(e) {
        var base64Url = e.target.result;
        elements.imageUrl.value = base64Url;
        elements.previewImg.src = base64Url;
        elements.imagePreview.style.display = 'block';
        log('Image converted to base64 data URI');
    };
    reader.onerror = function() {
        log('ERROR: Failed to read image file');
    };
    reader.readAsDataURL(file);
}

// Clear uploaded image
function clearUploadedImage(event) {
    if (event) event.preventDefault();
    elements.imageUrl.value = DEFAULT_IMAGE_URL;
    elements.imageFile.value = '';
    elements.imageFileName.value = '';
    elements.imagePreview.style.display = 'none';
    elements.previewImg.src = '';
    log('Image cleared, restored default URL');
    return false;
}

function callGateway(messages, description) {
    log('Gateway: ' + description);
    elements.gatewayResponse.textContent = 'Loading...';

    QB.ai.gateway(smartChatAssistantId, messages, function(err, res) {
        if (err) {
            log('ERROR: Gateway failed - ' + JSON.stringify(err));
            elements.gatewayResponse.textContent = 'Error: ' + JSON.stringify(err, null, 2);
            return;
        }

        log('Gateway response received');
        elements.gatewayResponse.textContent = res.answer;
    });
}

// Test: Simple text message (array content)
function testGatewayText() {
    if (!checkInit()) return;

    var messages = [
        {
            role: 'user',
            content: [{ type: 'text', text: 'Hello, what can you do?' }]
        }
    ];
    callGateway(messages, 'Text message test (array content)');
}

// Test: String content (simple format)
function testGatewayStringContent() {
    if (!checkInit()) return;

    var messages = [
        {
            role: 'user',
            content: 'Hello, what can you do?' // Simple string instead of array
        }
    ];
    callGateway(messages, 'String content test (simple format)');
}

// Test: Image recognition (uses URL from field or default)
function testGatewayImage() {
    if (!checkInit()) return;

    var imageUrl = elements.imageUrl.value.trim() || DEFAULT_IMAGE_URL;

    if (!imageUrl) {
        log('ERROR: Please enter an image URL or upload an image');
        return;
    }

    var messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: "what's in this image?" },
                {
                    type: 'image_url',
                    image_url: { url: imageUrl }
                }
            ]
        }
    ];
    callGateway(messages, 'Image recognition test');
}

// Test: Multi-turn conversation with developer role
function testGatewayConversation() {
    if (!checkInit()) return;

    var messages = [
        {
            role: 'developer',
            content: [{ type: 'text', text: 'You are a helpful math tutor.' }]
        },
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
    callGateway(messages, 'Multi-turn conversation test');
}

// Custom gateway message
function sendGateway() {
    if (!checkInit()) return;

    var text = elements.gatewayMessage.value.trim();
    var imageUrl = elements.imageUrl.value.trim();

    if (!text) {
        log('ERROR: Please enter a message');
        return;
    }

    var content = [{ type: 'text', text: text }];

    if (imageUrl) {
        content.push({
            type: 'image_url',
            image_url: { url: imageUrl }
        });
    }

    var messages = [{ role: 'user', content: content }];
    callGateway(messages, 'Custom message' + (imageUrl ? ' with image' : ''));
}

// ==================== SUMMARIZE (NEW) ====================

function loadDialogs() {
    if (!checkInit()) return;

    log('Loading dialogs...');
    elements.dialogList.innerHTML = '<p class="grey-text">Loading...</p>';

    QB.chat.dialog.list({ limit: 10, sort_desc: 'updated_at' }, function(err, result) {
        if (err) {
            log('ERROR: Failed to load dialogs - ' + JSON.stringify(err));
            elements.dialogList.innerHTML = '<p class="red-text">Error loading dialogs</p>';
            return;
        }

        log('Loaded ' + result.items.length + ' dialogs');

        if (result.items.length === 0) {
            elements.dialogList.innerHTML = '<p>No dialogs found</p>';
            return;
        }

        var html = '<ul class="collection">';
        result.items.forEach(function(dialog) {
            var name = dialog.name || ('Dialog ' + dialog._id.substring(0, 8));
            html += '<li class="collection-item">' +
                '<a href="#" onclick="selectDialog(\'' + dialog._id + '\'); return false;">' +
                name + '</a>' +
                ' <small class="grey-text">(' + (dialog.unread_messages_count || 0) + ' unread)</small>' +
                '</li>';
        });
        html += '</ul>';
        elements.dialogList.innerHTML = html;
    });
}

function selectDialog(dialogId) {
    elements.dialogId.value = dialogId;
    log('Selected dialog: ' + dialogId);
}

function summarizeDialog() {
    if (!checkInit()) return;

    var dialogId = elements.dialogId.value.trim();
    if (!dialogId) {
        log('ERROR: Please enter or select a Dialog ID');
        return;
    }

    log('Summarizing dialog: ' + dialogId);
    elements.summarizeResponse.textContent = 'Loading...';

    QB.ai.summarize(smartChatAssistantId, dialogId, function(err, res) {
        if (err) {
            log('ERROR: Summarize failed - ' + JSON.stringify(err));
            elements.summarizeResponse.textContent = 'Error: ' + JSON.stringify(err, null, 2);
            return;
        }

        log('Summary received');
        elements.summarizeResponse.textContent = res.summary;
    });
}

// ==================== TRANSLATE ====================

function translateText() {
    if (!checkInit()) return;

    var text = elements.translateText.value.trim();
    var lang = elements.translateLang.value;

    if (!text) {
        log('ERROR: Please enter text to translate');
        return;
    }

    log('Translating to ' + lang + ': "' + text.substring(0, 30) + '..."');
    elements.translateResponse.textContent = 'Loading...';

    QB.ai.translate(smartChatAssistantId, text, lang, function(err, res) {
        if (err) {
            log('ERROR: Translate failed - ' + JSON.stringify(err));
            elements.translateResponse.textContent = 'Error: ' + JSON.stringify(err, null, 2);
            return;
        }

        log('Translation received');
        elements.translateResponse.textContent = res.answer;
    });
}

// ==================== ANSWER ASSIST ====================

function getHistory() {
    var history = [];
    var items = elements.historyContainer.querySelectorAll('.history-item');

    items.forEach(function(item) {
        var roleSelect = item.querySelector('.history-role');
        var messageInput = item.querySelector('.history-message');
        if (roleSelect && messageInput) {
            var role = roleSelect.value;
            var message = messageInput.value.trim();
            if (message) {
                history.push({ role: role, message: message });
            }
        }
    });

    return history;
}

function addHistoryItem() {
    var html = '<div class="history-item row">' +
        '<div class="input-field col s3">' +
        '<select class="history-role browser-default">' +
        '<option value="user">user</option>' +
        '<option value="assistant">assistant</option>' +
        '</select></div>' +
        '<div class="input-field col s8">' +
        '<input type="text" class="history-message" placeholder="Message">' +
        '</div>' +
        '<div class="col s1">' +
        '<a href="#" class="btn-flat remove-history" onclick="this.parentElement.parentElement.remove(); return false;">' +
        '<i class="material-icons">close</i></a>' +
        '</div></div>';

    elements.historyContainer.insertAdjacentHTML('beforeend', html);
    log('Added history item');
}

function clearHistory() {
    elements.historyContainer.innerHTML = '';
    log('History cleared');
}

function sendAssist() {
    if (!checkInit()) return;

    var message = elements.assistMessage.value.trim();
    if (!message) {
        log('ERROR: Please enter a message');
        return;
    }

    var history = getHistory();
    log('Sending to answerAssist: "' + message.substring(0, 30) + '..." (history: ' + history.length + ' items)');
    elements.assistResponse.textContent = 'Loading...';

    QB.ai.answerAssist(smartChatAssistantId, message, history, function(err, res) {
        if (err) {
            log('ERROR: answerAssist failed - ' + JSON.stringify(err));
            elements.assistResponse.textContent = 'Error: ' + JSON.stringify(err, null, 2);
            return;
        }

        log('Answer received');
        elements.assistResponse.textContent = res.answer;
    });
}
