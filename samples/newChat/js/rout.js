'use strict';

Path.map("#login").to(function(){
    helpers.clearView(app.page);
    // usersList - variable from QBconfig.js file
    var loginTemplate = helpers.fillTemplate('tpl_login',{
        users: usersList,
        version: QB.version
    });
    app.page.innerHTML = loginTemplate;

    app.setLoginListeners();
});

Path.map("#dashboard").to(function(){
    if(!app.user){
        helpers.redirectToPage('login');
        return false;
    }

    helpers.clearView(app.page);

    var dashboardTemplate = helpers.fillTemplate('tpl_dachboardContainer', {user: app.user});

    app.page.innerHTML = dashboardTemplate;
    app.loadDashboard();
});

Path.root("#login");

Path.listen();
