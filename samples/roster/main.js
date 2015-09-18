var currentUser,
    otherUser,
    output = $('#output_place');

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
      QB.chat.connect({userId: user.id, password: user.pass}, function(err, roster) {
        if (err) {
          console.log(err);
        } else {
          $("#loginForm").modal("hide");
          $('#loginForm .progress').hide();

          log("Roster: " + JSON.stringify(roster));

          if (currentUser == QBUser1) {
            otherUser = QBUser2;
          } else {
            otherUser = QBUser1;
          }
        }
      });
    }
  });
}


function rosterAdd() {
  QB.chat.roster.add(otherUser.id, function() {
    log("You have sent a request to add the user " + otherUser.id);
  });
}

function rosterRemove() {
  QB.chat.roster.remove(otherUser.id, function() {
    log("You removed the user " + otherUser.id);
  });
}

function rosterConfirm() {
  QB.chat.roster.confirm(otherUser.id, function() {
    log("Confirmed user " + otherUser.id);
  });
}

function rosterReject() {
  QB.chat.roster.reject(otherUser.id, function() {
    log("Rejected user " + otherUser.id);
  });
}

function rosterGet() {
  QB.chat.roster.get(function(roster) {
    log("Roster: " + JSON.stringify(roster));
  });
}


QB.chat.onSubscribeListener = function(userId) {
  log("onSubscribeListener for user " + userId + ". Confirm or reject?");
};

QB.chat.onConfirmSubscribeListener = function(userId) {
  log("onConfirmSubscribeListener for user " + userId);
};

QB.chat.onRejectSubscribeListener = function(userId) {
  log("onRejectSubscribeListener for user " + userId);
};

QB.chat.onContactListListener = function(userId, type) {
  log("onContactListListener for user " + userId + ". Is online: " + (type === undefined || type == 'available'));
};


function log(string){
  output.val(output.val() + string + "\n");
}
