var currentUser;

$(document).ready(function() {

  $("#loginForm").modal("show");
  $('#loginForm .progress').hide();
  
  // User1 login action
  //
  $('#user1').click(function() {
    currentUser = QBUser1;
    connectToChat(QBUser1);
  });
  
  // User2 login action
  //
  $('#user2').click(function() {
    currentUser = QBUser2;
    connectToChat(QBUser2);
  });
});

function connectToChat(user) {
  $('#loginForm button').hide();
  $('#loginForm .progress').show();

  // Create session and connect to chat
  //
  QB.createSession({login: user.login, password: user.pass}, function(err, res) {
    if (res) {
      // save session token
      token = res.token;

      QB.chat.connect({userId: user.id, password: user.pass}, function(err, roster) {
        if (err) {
          console.log(err);
        } else {
          
          // load chat dialogs
          //
          retrieveChatDialogs();

          // setup message listeners
          //
          setupOnMessageListener()

          // setup 'isTyping' events handler and listener
          //
          setupIsTypingHandler();

          // setup 'on disconnected' listener
          //
          QB.chat.onDisconnectedListener = onDisconnectedListener;
        }
      });
    }
  });
}

function onDisconnectedListener(){
  console.log("onDisconnected");
}