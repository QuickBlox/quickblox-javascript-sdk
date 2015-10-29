describe('Helpers', function() {

  // beforeAll
  //
  beforeAll(function(){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);
  });

  it("can generate user's jid", function() {
    var userJid = QB.chat.helpers.getUserJid(5, 92);
    expect(userJid).toEqual("5-92@chat.quickblox.com");
  });

});
