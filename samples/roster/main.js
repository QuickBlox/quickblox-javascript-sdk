var currentUser,
    rosterJid,
    rosterName;

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
            rosterJid = QBUser2.id;
            rosterName = QBUser2.name;
          } else {
            rosterJid = QBUser1.id;
            rosterName = QBUser1.name;
          }
        }
      });
    }
  });
}

function rosterAdd() {
  QB.chat.roster.add(rosterJid, function() {
    console.log(rosterJid);
    $('#output_place').val('You have sent a request to add the user <'+rosterName+'> to your contact list');
  });
}

function rosterRemove() {
  QB.chat.roster.remove(rosterJid, function() {
    console.log(rosterJid);
    $('#output_place').val('you removed the user <'+rosterName+'> from your contact list');
  });
}

function rosterConfirm() {
  QB.chat.roster.confirm(rosterJid, function() {
    console.log(rosterJid);
    $('#output_place').val('Confirmed...');
  });
}

function rosterReject() {
  QB.chat.roster.reject(rosterJid, function() {
    console.log(rosterJid);
    $('#output_place').val('Rejected...');
  });
}

function rosterGet() {
  QB.chat.roster.get(function(roster) {
    console.log(roster);
    $('#output_place').val('Look in console to inspect roster object');
  });
}

QB.chat.onSubscribeListener = function(userId) {
  console.log('onSubscribeListener');
  $('#output_place').val('User <'+rosterName+'> wants to add you to their contact list. Confirm or reject?');
};

QB.chat.onConfirmSubscribeListener = function(userId) {
  console.log('onConfirmSubscribeListener');
  $('#output_place').val('User <'+rosterName+'> is now in your contact list');
};

QB.chat.onRejectSubscribeListener = function(userId) {
  console.log('onRejectSubscribeListener');
  $('#output_place').val('User <'+rosterName+'> has rejected a request');
};

QB.chat.onContactListListener = function(userId, type) {
  console.log('onContactListListener');
  if (type === undefined) {
    $('#output_place').val('User <'+rosterName+'> is ONLINE');
    console.log('status: online');
  } else {
    $('#output_place').val('User <'+rosterName+'> is OFFLINE');
    console.log('status: '+type);
  }
};
