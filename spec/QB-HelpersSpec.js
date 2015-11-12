describe('Helpers', function() {

  // beforeAll
  //
  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);
    done();
  });

  it("can generate user's jid", function(done) {
    var userJid = QB.chat.helpers.getUserJid(5, 29650);
    expect(userJid).toEqual("5-29650@chat.quickblox.com");
    done();
  });

  it("can return jid from jid or from user's id", function(done) {
    var jid = QB.chat.helpers.jidOrUserId(100500);
    expect(jid).toEqual("100500-29650@chat.quickblox.com");
    done();
  });

  it("can get type chat from jid or from user's id", function(done) {
    var id = QB.chat.helpers.typeChat(100500);
    expect(id).toEqual("chat");
    var jid = QB.chat.helpers.typeChat("100500-29650@chat.quickblox.com");
    expect(jid).toEqual("chat");
    var room = QB.chat.helpers.typeChat("29650_562f271ba28f9aa53e004788@muc.chat.quickblox.com");
    expect(room).toEqual("groupchat");
    done();
  });

  it("can get recipient id from privat chat", function(done) {
  	var occupantsIds = [100500, 707070];
  	var userId = 100500;
    var recipientId = QB.chat.helpers.getRecipientId(occupantsIds, userId);
    expect(recipientId).toEqual(707070);
    done();
  });
  
});

