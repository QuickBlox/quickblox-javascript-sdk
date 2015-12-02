var LOGIN_TIMEOUT = 10000;

describe('Helpers', function() {

  // beforeAll
  //
  beforeAll(function(){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);
  });


  it("can generate user's jid", function() {
    var userJid = QB.chat.helpers.getUserJid(5, 29650);
    expect(userJid).toEqual("5-29650@chat.quickblox.com");
    console.info("can generate user's jid");
  });

  it("can return jid from jid or from user's id", function() {
    var jid = QB.chat.helpers.jidOrUserId(100500);
    expect(jid).toEqual("100500-29650@chat.quickblox.com");
    console.info("can return jid from jid or from user's id");
  });

  it("can get type chat from jid or from user's id", function() {
    var id = QB.chat.helpers.typeChat(100500);
    expect(id).toEqual("chat");
    var jid = QB.chat.helpers.typeChat("100500-29650@chat.quickblox.com");
    expect(jid).toEqual("chat");
    var room = QB.chat.helpers.typeChat("29650_562f271ba28f9aa53e004788@muc.chat.quickblox.com");
    expect(room).toEqual("groupchat");
    console.info("can get type chat from jid or from user's id");
  });

  it("can get recipient id for privat dialog", function() {
  	var occupantsIds = [100500, 707070];
  	var userId = 100500;
    var recipientId = QB.chat.helpers.getRecipientId(occupantsIds, userId);
    expect(recipientId).toEqual(707070);
    console.info("can get recipient id from privat chat");
  });

  it("can get user nick with muc domain", function() {
    var userNick = QB.chat.helpers.getUserNickWithMucDomain(100500);
    expect(userNick).toEqual("muc.chat.quickblox.com/100500");
    console.info("can get user nick with muc domain");
  });

  it("can get id from node", function() {
    var userId = QB.chat.helpers.getIdFromNode("100500-29650@chat.quickblox.com");
    expect(userId).toEqual(100500);
    console.info("can get id from node");
  });

  it("can get dialog id from node", function() {
    var dialogId = QB.chat.helpers.getDialogIdFromNode("28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com");
    expect(dialogId).toEqual("5640ada2a28f9a76540006b6");
    console.info("can get dialog id from node");
  });

  it("can get roomJid from jid", function(done) {
    QB.chat.connect({userId: QBUser1.id, password: QBUser1.password}, function(err, roster) {
      if (err) {
        done.fail("Connection to chat error: " + JSON.stringify(err));
      } else {
        var roomJid = QB.chat.helpers.getRoomJid("28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com");
        expect(roomJid).toEqual("28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com/6126733");
        console.info("can get roomJid from jid");
        done();
      }
    });
  }, LOGIN_TIMEOUT);

  it("can get id from resource", function() {
    var userId = QB.chat.helpers.getIdFromResource("28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com/6126733");
    expect(userId).toEqual(6126733);
    console.info("can get id from resource");
  });

  it("can get unique id", function() {
    var uniqueId = QB.chat.helpers.getUniqueId();
    expect(uniqueId).toEqual(jasmine.any(String));
    console.info("can get unique id");
  });

  it("can get bson object id", function() {
    var ObjectId = QB.chat.helpers.getBsonObjectId();
    expect(ObjectId).toEqual(jasmine.any(String));
    console.info("can get bson object id");
  });

  it("can get user id from roomJid", function() {
    var userId = QB.chat.helpers.getUserIdFromRoomJid("28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com/6126733");
    expect(userId).toEqual("6126733");
    console.info("can get user id from roomJid");
  });

});
