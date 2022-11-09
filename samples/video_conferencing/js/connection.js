
'use strict';

var currentUser;


$(function() {
    var usersDetails = getUserNameAndGroupFromStorage();
    if(usersDetails && usersDetails.length > 0){
      $('#inputUserName').val(usersDetails[0]);
      $('#inputGroupName').val(usersDetails[1]);
    }

    configureAppAndLoadUser();

    //The following code will enable all popovers in the document:
    $('[data-toggle="popover"]').popover();
});

function configureAppAndLoadUser() {
    if(typeof QBCustomEndpoints !== "undefined"){
        CONFIG.APP_CONFIG.endpoints.api = QBCustomEndpoints.qbAPI;
        CONFIG.APP_CONFIG.endpoints.chat = QBCustomEndpoints.qbChat;
    }
    console.info("api endpoint: ", CONFIG.APP_CONFIG.endpoints.api);
    console.info("chat endpoint: ", CONFIG.APP_CONFIG.endpoints.chat);

    QB.init(
        CONFIG.CREDENTIALS.appId,
        CONFIG.CREDENTIALS.authKey,
        CONFIG.CREDENTIALS.authSecret,
        CONFIG.CREDENTIALS.accountKey,
        CONFIG.APP_CONFIG
    );

    QB.createSession(function(err, res) {
        $('#loginForm').modal('show');
        $('#loginForm .progress').hide();

        $('.login-button').on('click', function() {
            var userName = $('#inputUserName').val().trim(),
                userTag = $('#inputGroupName').val().trim();

            if ((userTag.length < 3) || (userTag.length > 15)) {
                loginError('length should between 3..15 symbols');
                return false;
            }

            if (!userName || !userTag) {
                loginError('Fields "Username" and "Group name" must be filled');
                return false;
            }

            currentUser = {
                'login': userUid() + userName.replace(/\s/g, ''),
                'password': 'quickblox',
                'full_name': userName,
                'tag_list': userTag
            };

            var params = { login: userName, password: "quickblox" };

            QB.login(params, function (error, user) {
                if (user) {
                    connectToChat(user);
                    saveUserNameAndGroupToStorage(userName, userTag);

                    $('#inputUserName').val('');
                    $('#inputGroupName').val('');
                } else {
                    createUser(params).then(
                        function() {
                            QB.login(params, function (e, newUser) {
                                connectToChat(newUser);
                                saveUserNameAndGroupToStorage(userName, userTag);

                                $('#inputUserName').val('');
                                $('#inputGroupName').val('');
                            });
                        }
                    ).catch(
                        function(error){
                            loginError(error);
                        }
                    );
                }
            });
        });

        // can provide username & usergroup via query string for autologin
        //
        var username = getQueryVar('username');
        var usergroup = getQueryVar('usergroup');
        console.info("username: " + username + ", usergroup: " + usergroup);
        //
        if(username && usergroup){
            $('#inputUserName').val(username);
            $('#inputGroupName').val(usergroup);

            $('.login-button').trigger("click");
        }
    });
}

function createUser(user) {
    return new Promise(function (resolve, reject) {
        QB.users.create(user, function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

function updateUser(resUser) {
    var params = {};

    var paramChanged = false;

    if (resUser.full_name !== currentUser.full_name) {
        params.full_name = currentUser.full_name;
        paramChanged = true;
    }

    if (resUser.user_tags !== currentUser.tag_list) {
        params.tag_list = currentUser.tag_list;
        paramChanged = true;
    }

    if (paramChanged){
        QB.users.update(currentUser.id, params, function(err, user){
            if (err) {
                loginError(err);
            }
        });
    }
}

function connectToChat(user) {
    $('#loginFormContainer').hide();
    $('#loginForm .progress').show();

    if (user) {
        currentUser.id = user.id;
        updateUser(user);
        mergeUsers([{
            user: user
        }]);

        QB.chat.connect({
            userId: currentUser.id,
            password: currentUser.password
        }, function(err, roster) {
            if (err) {
                console.error("connect to chat error: ", err);
            } else {
                $('#loginForm').modal('hide');
                $('.current-user-login').text('Logged as: ' + currentUser.full_name + "(" + currentUser.id + ")");

                // retrieve dialogs' list
                retrieveChatDialogs();
                onUpdateChatDialogs();
                // setup message listeners
                setupAllListeners();
                // setup scroll events handler
                setupMsgScrollHandler();

                setupStreamManagementListeners();
            }
        });
    } else {
        loginError(error);
    }
}

function setupAllListeners() {
    QB.chat.onMessageListener = onMessage;
    QB.chat.onSystemMessageListener = onSystemMessageListener;
    QB.chat.onDeliveredStatusListener = onDeliveredStatusListener;
    QB.chat.onReadStatusListener = onReadStatusListener;

    setupIsTypingHandler();
}

// reconnection listeners
function onDisconnectedListener() {
    console.log("onDisconnectedListener");
}

function onReconnectListener() {
    console.log("onReconnectListener");
}

function onUpdateChatDialogs() {
    $('#updateHistory').on('click', function() {
        $('#dialogs-list').html('');
        retrieveChatDialogs();
    });
}
