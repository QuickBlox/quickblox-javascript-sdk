var users = {};

function retrieveUsersForDialogCreation(callback) {
    retrieveUsers(callback);
}

function retrieveUsersForDialogUpdate(callback) {
    retrieveUsers(callback);
}

function retrieveUsers(callback) {
    var $loader = $("#load-users");

    $loader.show(0);

    // Load users, 100 per request
    //
    QB.users.get({
        'tags': currentUser.tag_list,
        'page': 1,
        'per_page': '100'
    }, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            console.log("new users");
            mergeUsers(result.items);
            callback(result.items);
            $loader.delay(100).fadeOut(500);
        }
    });
}

function updateDialogsUsersStorage(usersIds, callback) {
    var params = {
        filter: {
            field: 'id',
            param: 'in',
            value: usersIds
        },
        per_page: 100
    };

    QB.users.listUsers(params, function(err, result) {
        if (result) {
            mergeUsers(result.items);
        }

        callback();
    });
}

function mergeUsers(usersItems) {
    var newUsers = {};
    usersItems.forEach(function(item, i, arr) {
        newUsers[item.user.id] = item.user;
    });
    users = $.extend(users, newUsers);
}

function getUserLoginById(byId) {
    var userName;

    if(byId == currentUser.id){
      return currentUser.full_name;
    }

    if (users[byId]) {
        userName = users[byId].full_name || 'Unknown user';
        return userName;
    }
}
