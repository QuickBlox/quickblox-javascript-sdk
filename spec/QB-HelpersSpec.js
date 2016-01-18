describe('Helpers', function() {
  'use strict';
  
  var LOGIN_TIMEOUT = 10000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

  var QB = isNodeEnv ? require('../quickblox.min.js') : window.QB;
  var CREDENTIALS = isNodeEnv ? require('./config').CREDENTIALS : window.CREDENTIALS;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

  beforeAll(function() {
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);
  });

  /**
   * TEST CASES
   */
  it('can generate user\'s jid', function() {
    var userJid = QB.chat.helpers.getUserJid(5, 29650);

    expect(userJid).toEqual('5-29650@chat.quickblox.com');
  });

  it('can return jid from jid or from user\'s id', function() {
    var jid = QB.chat.helpers.jidOrUserId(100500);

    expect(jid).toEqual('100500-29650@chat.quickblox.com');
  });

  it('can get type chat from jid or from user\'s id', function() {
    var id = QB.chat.helpers.typeChat(100500);

    expect(id).toEqual('chat');
    var jid = QB.chat.helpers.typeChat('100500-29650@chat.quickblox.com');
    expect(jid).toEqual('chat');

    var room = QB.chat.helpers.typeChat('29650_562f271ba28f9aa53e004788@muc.chat.quickblox.com');
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

    expect(userNick).toEqual('muc.chat.quickblox.com/100500');
  });

  it('can get id from node', function() {
    var userId = QB.chat.helpers.getIdFromNode('100500-29650@chat.quickblox.com');

    expect(userId).toEqual(100500);
  });

  it('can get dialog id from node', function() {
    var dialogId = QB.chat.helpers.getDialogIdFromNode('28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com');

    expect(dialogId).toEqual('5640ada2a28f9a76540006b6');
  });

  it('can get room jid from dialog id', function() {
    var roomJid = QB.chat.helpers.getRoomJidFromDialogId('5640ada2a28f9a76540006b6');

    expect(roomJid).toEqual('29650_5640ada2a28f9a76540006b6@muc.chat.quickblox.com');
  });

  it('can get roomJid from jid', function(done) {
    if(isNodeEnv) {
      pending('This function isn\'t supported outside of the browser');
    }

    QB.chat.connect({userId: QBUser1.id, password: QBUser1.password}, function(err, roster) {
      if (err) {
        done.fail('Connection to chat error: ' + JSON.stringify(err));
      } else {
        var roomJid = QB.chat.helpers.getRoomJid('28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com');

        expect(roomJid).toEqual('28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com/6126733');
        done();
      }
    });
  }, LOGIN_TIMEOUT);

  it('can get id from resource', function() {
    var userId = QB.chat.helpers.getIdFromResource('28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com/6126733');

    expect(userId).toEqual(6126733);
  });

  it('can get unique id', function() {
    if(isNodeEnv) {
      pending('This function isn\'t supported outside of the browser');
    }

    var uniqueId = QB.chat.helpers.getUniqueId();

    expect(uniqueId).toEqual(jasmine.any(String));
  });

  it('can get bson object id', function() {
    var ObjectId = QB.chat.helpers.getBsonObjectId();

    expect(ObjectId).toEqual(jasmine.any(String));
  });

  it('can get user id from roomJid', function() {
    var userId = QB.chat.helpers.getUserIdFromRoomJid('28287_5640ada2a28f9a76540006b6@muc.chat.quickblox.com/6126733');

    expect(userId).toEqual('6126733');
  });
});
