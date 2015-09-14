var rosterJid;

function showRosterPopup() {
  $("#rosterForm").modal("show");
  $('#rosterForm .progress').hide();

  if (currentUser == QBUser1) {
    rosterJid = QB.chat.helpers.getUserJid(QBUser2.id, QBApp.appId);
  } else {
    rosterJid = QB.chat.helpers.getUserJid(QBUser1.id, QBApp.appId);
  }
}

function rosterAdd() {
  QB.chat.roster.add(rosterJid, function() {
    console.log(rosterJid);
  });
}

function rosterRemove() {
  QB.chat.roster.remove(rosterJid, function() {
    console.log(rosterJid);
  });
}

function rosterConfirm() {
  QB.chat.roster.confirm(rosterJid, function() {
    console.log(rosterJid);
  });
}

function rosterReject() {
  QB.chat.roster.reject(rosterJid, function() {
    console.log(rosterJid);
  });
}

QB.chat.onSubscribeListener = function(userId) {
  console.log('onSubscribeListener');
};

QB.chat.onConfirmSubscribeListener = function(userId) {
  console.log('onConfirmSubscribeListener');
};

QB.chat.onRejectSubscribeListener = function(userId) {
  console.log('onRejectSubscribeListener');
};

QB.chat.onContactListListener = function(userId, type) {
  console.log('onContactListListener');
  console.log('status: '+type);
};