"use strict";

const QB = require('../../../src/qbMain.js');
const config = require('./config');
var ListenersConstructor = require('./listeners');
var listeners = null;

QB.init(config.QBApp.appId, config.QBApp.authKey, config.QBApp.authSecret, config.QBAppConfig);

QB.createSession({login: config.QBUser.login, password: config.QBUser.pass}, (err, res) => {
	if (res) {
		console.log('session created successfully');

		QB.chat.connect({userId: config.QBUser.id, password: config.QBUser.pass}, (err, roster) => {
			if (err) {
				console.log('error',err);
				process.exit(1);
			}
			listeners = new ListenersConstructor(QB);
			SetListeners(listeners);
		});
	}else{
		console.log('can\'t  create session', err);
	}
});

function SetListeners(){
	QB.chat.onMessageTypingListener = listeners.onMessageTypingListener;

	QB.chat.onMessageListener = listeners.messageListener;

	QB.chat.onDeliveredStatusListener = listeners.onDeliveredStatusListener;

	QB.chat.onSystemMessageListener = listeners.systemMessageListener;
};

process.on('exit', function () {
	QB.chat.disconnect();
});