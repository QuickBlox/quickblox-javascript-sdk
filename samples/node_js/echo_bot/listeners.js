"use strict";

const config = require('./config');

function Listeners (QB){
	this.messageListener = (userId, receivedMessage) => {
		if(userId === config.QBUser.id) return;

		var answer = {
			type: 'chat',
			body: 'This bot is in developing now...',
			extension: {
				save_to_history: 1
			}
		};

		QB.chat.send(userId, answer);
	};

	this.onMessageTypingListener  = (composing, userId, dialogId) => {
		var msg = composing ? 'start typing...' : 'stop typing.';
		console.log('User '  + userId + ' ' + msg);
	};
	this.onDeliveredStatusListener = (status, dialogId, userId) => {
		console.log('Message from ' + dialogId + ' was getting status ' + status + ' from ' + userId);
	};

	this.systemMessageListener = (receivedMessage) => {
		if(receivedMessage.extension.notification_type === '1'){
			QB.chat.dialog.list({'_id': receivedMessage.extension.dialog_id}, (err, res) => {

				if(err){
					console.log(err);
					return;
				}
				if(res.items[0].type === 2){
					var dialogJid = res.items[0].xmpp_room_jid;

					QB.chat.muc.join(dialogJid, () => {
						console.log("Joined dialog "+ res.items[0]._id);
						sendOnAddToChatMessage(dialogJid, 'groupchat');
					});
				} else {
					sendOnAddToChatMessage(receivedMessage.userId, 'chat');
				}
			});
		}
	};

	function sendOnAddToChatMessage(id, type){
		console.log('sendOnAddToChatMessage', type, id);
		QB.chat.send(id, {
			type: type,
			body: `Hello! I'm QBChat Echo Bot.\n
						Everything that I can do is give you the same answer as your question. It's really easy to write the same bot, with your own logic, using our javascript SDK and Node.js.\n
						P.S. have a good day!!!`,
			extension: {
				save_to_history: 1
			}
		});
	}
}

module.exports = Listeners;