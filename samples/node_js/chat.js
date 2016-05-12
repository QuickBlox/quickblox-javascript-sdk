/**
 * Start example from the root folder
 * by command `node samples/node_js/chat.js`
 */

const QB = require('../../src/qbMain.js');

var QBApp = {
    appId: 28287,
    authKey: 'XydaWcf8OO9xhGT',
    authSecret: 'JZfqTspCvELAmnW'
};

var config = {
    chatProtocol: {
        active: 2
    },
    debug: {
        mode: 1
    }
};

var QBUser = {
    id: 6729114,
    name: 'quickuser',
    login: 'chatusr11',
    pass: 'chatusr11'
};

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

QB.createSession({login: QBUser.login, password: QBUser.pass}, function(err, res) {
    if (res) {
        QB.chat.connect({userId: QBUser.id, password: QBUser.pass}, function(err, roster) {
            if (err) {
                console.log(err);
            } else {
                console.log(roster);
            }
        });
    }else{
        console.log(err);
    }
});
