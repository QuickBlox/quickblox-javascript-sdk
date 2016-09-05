'use strict'

const CONFIG = require('./config').CONFIG;
const QB = require('../../../src/qbMain.js');
const RiveScript = require('rivescript');

// Init QuickBlox
//
QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret);

// Init RiveScript
//
var riveScriptGenerator = new RiveScript();
riveScriptGenerator.loadFile("replies.rive", loadingDone, loadingError);

function loadingDone (batch_num) {
	console.log("(RiveScript) Batch #" + batch_num + " has finished loading!");

	// Now the replies must be sorted!
	riveScriptGenerator.sortReplies();
}

function loadingError (batch_num, error) {
	console.log("(RiveScript) Error when loading files: " + error);
}

QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret);


QB.createSession({
		login: CONFIG.user.name,
		password: CONFIG.user.password
	}, (err, res) => {
		if (res) {
			QB.chat.connect({userId: CONFIG.user.id, password: CONFIG.user.password}, (err, roster) => {
				if (err) {
					console.log('error',err);
					process.exit(1);
				}

				QB.chat.dialog.list({type: 2}, (err, result) => {
					if(err){
						console.log(`can\'t get to groupcahts`);
					}

					result.items.forEach((dialog)=>{
						QB.chat.muc.join(dialog.xmpp_room_jid);
					});

				});

				QB.chat.onMessageListener = processMessage;

				QB.chat.onSubscribeListener = function(userId){
					console.log('onSubscribeListener userId', userId);
					QB.chat.roster.confirm(userId, function(){
						console.log('confirm subscription from user ',userId);
					});
				};

				QB.chat.onSystemMessageListener = function(receivedMessage){
					if(receivedMessage.extension.notification_type === '1'){
						console.log(`user ${receivedMessage.userId} adds you to dialog`);
						var roomJid = QB.chat.helpers.getRoomJidFromDialogId(receivedMessage.extension.dialog_id);
						QB.chat.muc.join(roomJid);
					}
				};
			});
		}else{
			console.log('can\'t  create session', err);
		}
	}
);


process.on('exit', function () {
	QB.chat.disconnect();
});

function processMessage(userId, message){

    if (message.type == 'groupchat') {

		// - skip own messages in the group chat, don't replay to them
		// - reply only when someone mentions you. For example: "@YourBotBestFriend how are you?"
		var mentionStartIndex = -1;
		var mentionPattern = "@" + CONFIG.user.fullname;
		var mentionLength = mentionPattern.length;

		if(message.body){
			mentionStartIndex = message.body.indexOf(mentionPattern)
		}

		if(userId != CONFIG.user.id && mentionStartIndex >= 0){
			// build a reply
			var realBody;

			if(mentionStartIndex == 0 && message.body.substring(mentionLength, mentionLength+1) == " "){
				realBody = message.body.substring(mentionLength+1);
			}else{
				realBody = "What's up? I react only for commands like this: '@YourBotBestFriend <text>'"
			}

			var answer = {
				type: 'groupchat',
				body: riveScriptGenerator.reply(userId, realBody),
				extension: {
					save_to_history: 1
				}
			};

			QB.chat.send(QB.chat.helpers.getRoomJidFromDialogId(message.dialog_id), answer);
		}
	} else if (message.type == 'chat') {
		if(message.body){
			var answer = {
				type: 'chat',
				body: riveScriptGenerator.reply(userId, message.body),
				extension: {
					save_to_history: 1
				}
			};
			QB.chat.send(userId, answer);
		}
	}
}

function generatePresenceSubscribed(toJid){
	var stanza = new Client.Stanza('presence', {to: toJid, type: "subscribed"});
	return stanza
}

function generatePresenceSubscribe(toJid){
	var stanza = new Client.Stanza('presence', {to: toJid, type: "subscribe"});
	return stanza
}
