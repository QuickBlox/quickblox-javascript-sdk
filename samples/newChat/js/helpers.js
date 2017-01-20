'use strict';

function Helpers(){};


Helpers.prototype.fillTemplate = function (name, options){
    var tpl = _.template(document.querySelector('#' + name).innerHTML);
    return tpl(options);
}

Helpers.prototype.clearMainView = function(){
    app.page.innerHTML = '';
};

Helpers.prototype.redirrectToPage = function(page){
    window.location.hash = '#' + page;
}

var helpers = new Helpers();
