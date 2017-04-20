var messagesStats = {};

function incrementMessagesSentPerDialog(dialogId, isREST){
  var count = messagesStats[dialogId];
  if(!count){
    count = 0;
  }
  messagesStats[dialogId] = count+1;
  console.info("SENT: " + messagesStats[dialogId] + ", isREST:" + isREST + ". Dialog: " + dialogId);
}

function sortUsers(user1, user2){
  var ocuupantsArray = [user1, user2].sort(function(a,b){
      return a - b;
  });
  return ocuupantsArray;
}

function groupChat_joinAndSendAndReceiveMessageAndLeave(roomJid, dialogId, callback){
  groupChat_joinAndSendAndReceiveMessage(roomJid, dialogId, function(){
    QB.chat.muc.leave(roomJid, function() {
      callback();
    });
  });
}

function groupChat_joinAndSendAndReceiveMessage(roomJid, dialogId, callback){
  QB.chat.muc.join(roomJid, function(stanzaResponse) {
    expect(stanzaResponse).not.toBeNull();

    groupChat_sendAndReceiveMessage(roomJid, dialogId, function(){
      callback();
    });

  });
}

function groupChat_sendAndReceiveMessage(roomJid, dialogId, callback){
  var body = 'Warning! People are coming! XMPP message ' + Math.floor((Math.random() * 100) + 1);
  var msgExtension = {
      name: 'skynet',
      mission: 'take over the planet',
      save_to_history: 1
  };
  var msg = {
      type: 'groupchat',
      body: body,
      extension: msgExtension,
      markable: 1
  };

  incrementMessagesSentPerDialog(dialogId, false);

  function onMsgCallback(userId, receivedMessage) {
      expect(userId).toEqual(QBUser2.id);
      expect(receivedMessage).toBeDefined();
      expect(receivedMessage.id).toEqual(msg.id);
      expect(receivedMessage.type).toEqual(msg.type);
      expect(receivedMessage.body).toEqual(body);
      expect(receivedMessage.extension.name).toEqual(msgExtension.name);
      expect(receivedMessage.extension.mission).toEqual(msgExtension.mission);
      expect(receivedMessage.extension.dialog_id).toEqual(dialogId);
      expect(receivedMessage.markable).toEqual(msg.markable);

      QB.chat.onMessageListener = null;

      callback();
  }

  QB.chat.onMessageListener = onMsgCallback;
  msg.id = QB.chat.send(roomJid, msg);
}

function createNormalMessageWithoutReceivingItTest(params, dialogId, timeout, callback){
  QB.chat.message.create(params, function(err, res) {
    expect(err).toBeNull();
    expect(res).toBeDefined()
    expect(res._id).not.toBeNull();
    expect(res.message).toEqual(params.message);
    expect(res.chat_dialog_id).toEqual(dialogId);

    messageIdPrivate = res._id;

    incrementMessagesSentPerDialog(dialogId, true);
  });

  var messageReceived = false;
  QB.chat.onMessageListener = function(userId, receivedMessage) {
    messageReceived = true;
  };

  setTimeout(function(){
    console.info("MSG receive timeout");
    QB.chat.onMessageListener = null;
    expect(messageReceived).toEqual(false);
    callback();
  }, timeout);
};

function createNormalMessageAndReceiveItTest(params, msgExtension, dialogId, xmppMessageType, callback){
  QB.chat.message.create(params, function(err, res) {
    expect(err).toBeNull();
    expect(res).toBeDefined()
    expect(res._id).not.toBeNull();
    expect(res.message).toEqual(params.message);
    expect(res.chat_dialog_id).toEqual(dialogId);

    messageIdPrivate = res._id;

    incrementMessagesSentPerDialog(dialogId, true);
  });

  QB.chat.onMessageListener = function(userId, receivedMessage) {
    expect(userId).toEqual(QBUser1.id);
    expect(receivedMessage).toBeDefined();
    expect(receivedMessage.id).toEqual(messageIdPrivate);
    expect(receivedMessage.type).toEqual(xmppMessageType);
    expect(receivedMessage.body).toEqual(params.message);
    expect(receivedMessage.extension).toEqual($.extend($.extend({save_to_history: '1'}, msgExtension), {dialog_id: dialogId}));

    QB.chat.onMessageListener = null;

    callback();
  };
};
