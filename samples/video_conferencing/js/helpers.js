var getQueryVar = function(q) {
    var query = window.location.search.substring(1),
        vars = query.split('&'),
        answ = false;

    vars.forEach(function(el, i) {
        var pair = el.split('=');

        if (pair[0] === q) {
            answ = pair[1];
        }
    });

    return answ;
};

var userUid = function() {
    var navigator_info = window.navigator;
    var screen_info = window.screen;
    var uid = navigator_info.mimeTypes.length;
    uid += navigator_info.userAgent.replace(/\D+/g, '');
    uid += navigator_info.plugins.length;
    uid += screen_info.height || '';
    uid += screen_info.width || '';
    uid += screen_info.pixelDepth || '';
    return uid;
};

function saveUserNameAndGroupToStorage(userName, userGroup){
  if (typeof(Storage) !== "undefined") {
      // Code for localStorage.
      localStorage.setItem("qbVideoConfUserName", userName);
      localStorage.setItem("qbVideoConfUserGroup", userGroup);
  } else {
      // Sorry! No Web Storage support..
      console.error("Sorry! No Web Storage support");
  }
};

function getUserNameAndGroupFromStorage(){
  return [localStorage.getItem("qbVideoConfUserName"), localStorage.getItem("qbVideoConfUserGroup")];
};
