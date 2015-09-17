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
          console.log(roster);

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
    console.log(otherUser.id);
    output.val(output.val()+"You have sent a request to add the user <"+otherUser.name+"> to your contact list\n");
  });
}

function rosterRemove() {
  QB.chat.roster.remove(otherUser.id, function() {
    console.log(otherUser.id);
    output.val(output.val()+"you removed the user <"+otherUser.name+"> from your contact list\n");
  });
}

function rosterConfirm() {
  QB.chat.roster.confirm(otherUser.id, function() {
    console.log(otherUser.id);
    output.val(output.val()+"Confirmed...\n");
  });
}

function rosterReject() {
  QB.chat.roster.reject(otherUser.id, function() {
    console.log(otherUser.id);
    output.val(output.val()+"Rejected...\n");
  });
}

function rosterGet() {
  QB.chat.roster.get(function(roster) {
    console.log(roster);
    output.val(output.val()+"Look in console to inspect roster object\n");
  });
}

QB.chat.onSubscribeListener = function(userId) {
  console.log("onSubscribeListener");
  output.val(output.val()+"User <"+otherUser.name+"> wants to add you to their contact list. Confirm or reject?\n");
};

QB.chat.onConfirmSubscribeListener = function(userId) {
  console.log("onConfirmSubscribeListener");
  output.val(output.val()+"User <"+otherUser.name+"> is now in your contact list\n");
};

QB.chat.onRejectSubscribeListener = function(userId) {
  console.log("onRejectSubscribeListener");
  output.val(output.val()+"User <"+otherUser.name+"> has rejected a request\n");
};

QB.chat.onContactListListener = function(userId, type) {
  console.log("onContactListListener");
  if (type === undefined) {
    output.val(output.val()+"User <"+otherUser.name+"> is ONLINE\n");
    console.log("status: online");
  } else {
    output.val(output.val()+"User <"+otherUser.name+"> is OFFLINE\n");
    console.log("status: "+type);
  }
};
