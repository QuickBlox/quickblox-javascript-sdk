
// Init QuickBlox application here
//
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

var opponent, currentUser;

$(document).ready(function() {

  $("#loginForm").modal("show");
  $('#loginForm .progress').hide();

  // User1 login action
  //
  $('#user1').click(function() {
    opponent = QBUser2;
    connectChat(QBUser1);
  });

  // User2 login action
  //
  $('#user2').click(function() {
    opponent = QBUser1;
    connectChat(QBUser2);
  });

  // Send message action
  //
  $('#sendMessage').click(function() {
    var msg = $('#message').val().trim();
    $('#message').val('').focus();

    if (msg.length > 0){
      sendMessage(opponent.id, msg);
    }
  });
});

function connectChat(user) {

  $('#loginForm button').hide();
  $('#loginForm .progress').show();

  // Create session and connect to chat
  //
  QB.createSession({login: user.login, password: user.pass}, function(err, res) {
    if (res) {
      var user_jid = QB.chat.helpers.getUserJid(user.id, QBApp.appId);
      QB.chat.connect({jid: user_jid, password: user.pass}, function(err, roster) {
        $("#loginForm").modal("hide");

        if (err) {
          console.log(err);
        } else {
          console.log(roster);

          QB.chat.onMessageListener = showMessage;

          $('#feed').val('User : CONNECTED at ' + getLocalTime());
        }
      });
    }
  });
}

// Send a chat message
//
function sendMessage(user_id, val) {
  var msg = {
    type: 'chat',
    body: val,

    extension: {
      time: Math.floor(Date.now() / 1000),
    }
  };

  var user_jid = QB.chat.helpers.getUserJid(user_id, QBApp.appId);
  QB.chat.send(user_jid, msg);

  showMessage(null, msg);
}

// Show messages in UI
//
function showMessage(userId, msg) {

  var body = msg.body,
      time = msg.extension && msg.extension.time,
      messageDate = new Date(time * 1000);

  var message = "\n";
      message += (userId === null ? "Me" : "Opponent");
      message += " (" + messageDate.getHours() + ':' + (messageDate.getMinutes().toString().length === 1 ? '0'+messageDate.getMinutes() : messageDate.getMinutes()) + ':' + messageDate.getSeconds() + ")";
      message +=  ": ";
      message += body;

  var currentText = $('#feed').val();
  $('#feed').val(currentText + message); 
}

function getLocalTime() {
  return (new Date).toTimeString().split(' ')[0];
}
