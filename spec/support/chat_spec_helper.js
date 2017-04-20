function sortUsers(user1, user2){
  var ocuupantsArray = [user1, user2].sort(function(a,b){
      return a - b;
  });
  return ocuupantsArray;
}

function groupChat_joinAndSendAndReceiveMessage(done, roomJid, dialogId){
  QB.chat.muc.join(roomJid, function(stanzaResponse) {
    expect(stanzaResponse).not.toBeNull();

    groupChat_sendAndReceiveMessage(done, roomJid, dialogId);

  });
}

function groupChat_sendAndReceiveMessage(done, roomJid, dialogId){
  var body = 'Warning! People are coming';
  var msgExtension = {
      name: 'skynet',
      mission: 'take over the planet'
  };
  var msg = {
      type: 'groupchat',
      body: body,
      extension: msgExtension,
      markable: 1
  };

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

      done();
  }

  QB.chat.onMessageListener = onMsgCallback;
  msg.id = QB.chat.send(roomJid, msg);
}
