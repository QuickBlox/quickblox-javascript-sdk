'use strict';

Path.map("#login").to(function(){
    loginModule.renderLoginPage();
});

Path.map("#dashboard").to(function(){
    if(!app.user) {
        helpers.redirectToPage('login');
        return false;
    }

    helpers.clearView(app.page);

    app.page.innerHTML = helpers.fillTemplate('tpl_dashboardContainer', {user: app.user});
    app.loadDashboard();
});

Path.root("#login");

Path.listen();
