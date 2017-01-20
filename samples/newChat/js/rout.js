'use strict';

Path.map("#login").to(function(){
    helpers.clearMainView();
    // usersList - variable from QBconfig.js file
    var loginTemplate = helpers.fillTemplate('tpl_login',{
        users: usersList,
        version: QB.version
    });
    app.page.innerHTML = loginTemplate;

    app.setLoginListeners();
});

Path.map("#dashboard").to(function(){
    app.user = usersList[0];
    if(!app.user){
        helpers.redirrectToPage('login');
        return false;
    }

    app.login();
    helpers.clearMainView();

    var dashboardTemplate = helpers.fillTemplate('tpl_dachboardContainer', {user: app.user});
    app.page.innerHTML = dashboardTemplate;

    app.tabSelectInit();
});

Path.root("#login");

Path.listen();
