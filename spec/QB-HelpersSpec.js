describe('Helpers', function() {
  'use strict';

  var LOGIN_TIMEOUT = 20000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

  var QB = isNodeEnv ? require('../src/qbMain.js') : window.QB;
  var CREDENTIALS = isNodeEnv ? require('./config').CREDS : window.CREDS;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
  var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;

  var appId = CREDENTIALS.appId;
  var chatEndpoint = CONFIG.endpoints.chat;

  beforeAll(function() {
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CONFIG);
  });

  it('can get OS information', function(){
    var env = QB._getOS();

    expect(env).toEqual(jasmine.any(String));
  });

  it('can generate user\'s jid', function() {
    var userJid = QB.chat.helpers.getUserJid(5, appId);

    expect(userJid).toEqual('5-' + appId + '@' + chatEndpoint);
  });

  it('can return jid from jid or from user\'s id', function() {
    var jid = QB.chat.helpers.jidOrUserId(100500);

    expect(jid).toEqual('100500-' + appId + '@' + chatEndpoint);
  });

  it('can get type chat from jid or from user\'s id', function() {
    var id = QB.chat.helpers.typeChat(100500);

    expect(id).toEqual('chat');
    var jid = QB.chat.helpers.typeChat('100500-29650@' + chatEndpoint);
    expect(jid).toEqual('chat');

    var room = QB.chat.helpers.typeChat('29650_562f271ba28f9aa53e004788@muc.' + chatEndpoint);
    expect(room).toEqual('groupchat');
  });

  it('can get recipient id for privat dialog', function() {
    var occupantsIds = [100500, 707070];
    var userId = 100500;
    var recipientId = QB.chat.helpers.getRecipientId(occupantsIds, userId);

    expect(recipientId).toEqual(707070);
  });

  it('can get user nick with muc domain', function() {
    var userNick = QB.chat.helpers.getUserNickWithMucDomain(100500);

    expect(userNick).toEqual('muc.' + chatEndpoint + '/100500');
  });

  it('can get id from node', function() {
    var userId = QB.chat.helpers.getIdFromNode('100500-29650@' + chatEndpoint);

    expect(userId).toEqual(100500);
  });

  it('can get dialog id from node', function() {
    var dialogId = QB.chat.helpers.getDialogIdFromNode(appId + '_5640ada2a28f9a76540006b6@muc.' + chatEndpoint);

    expect(dialogId).toEqual('5640ada2a28f9a76540006b6');
  });

  it('can get room jid from dialog id', function() {
    var roomJid = QB.chat.helpers.getRoomJidFromDialogId('5640ada2a28f9a76540006b6');

    expect(roomJid).toEqual(appId + '_5640ada2a28f9a76540006b6@muc.' + chatEndpoint);
  });

  it('can get roomJid from jid', function(done) {
    QB.chat.connect({userId: QBUser1.id, password: QBUser1.password}, function(err, roster) {
      if (err) {
        done.fail('Connection to chat error: ' + JSON.stringify(err));
      } else {
        var roomJid = QB.chat.helpers.getRoomJid(appId + '_5640ada2a28f9a76540006b6@muc.' + chatEndpoint,
                  QB.chat.helpers.getUserJid(QBUser1.id, appId));

        expect(roomJid).toEqual(appId + '_5640ada2a28f9a76540006b6@muc.' + chatEndpoint + '/' + QBUser1.id);

        QB.chat.disconnect();

        done();
      }
    });
  }, LOGIN_TIMEOUT);

  it('can get id from resource', function() {
    var userId = QB.chat.helpers.getIdFromResource(appId + '_5640ada2a28f9a76540006b6@muc.' + chatEndpoint + '/' + QBUser1.id);

    expect(userId).toEqual(QBUser1.id);
  });

  it('can get unique id', function() {
    var uniqueId = QB.chat.helpers.getUniqueId();

    expect(uniqueId).toEqual(jasmine.any(String));
  });

  it('can get bson object id', function() {
    var ObjectId = QB.chat.helpers.getBsonObjectId();

    expect(ObjectId).toEqual(jasmine.any(String));
  });

  it('can get user id from roomJid', function() {
    var userId = QB.chat.helpers.getUserIdFromRoomJid('28287_5640ada2a28f9a76540006b6@muc.' + chatEndpoint + '/' + QBUser1.id);

    expect(parseInt(userId)).toEqual(QBUser1.id);
  });

  it("can get room's bare jid from room's full jid", function() {
    var originRoomsBareJid = '28287_5640ada2a28f9a76540006b6@muc.' + chatEndpoint;
    var roomsBareJid = QB.chat.helpers.getRoomJidFromRoomFullJid(originRoomsBareJid + '/' + QBUser1.id);

    expect(roomsBareJid).toEqual(originRoomsBareJid);
  });


});
