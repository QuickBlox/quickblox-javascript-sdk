'use strict';

function Helpers(){}

Helpers.prototype.redirectToPage = function(page){
    window.location.hash = '#' + page;
};

Helpers.prototype.fillTemplate = function (name, options){
    var tpl = _.template(document.querySelector('#' + name).innerHTML);
    return tpl(options);
};

Helpers.prototype.clearView = function(view){
    var nodeList = view.childNodes;
    for(var i = nodeList.length; i > 0; i--){
        view.removeChild(nodeList[i-1]);
    }
};

Helpers.prototype.compileDialogParams = function(dialog){
    var lastDate;

    if(dialog.last_message_date_sent){
        var date = new Date(dialog.last_message_date_sent);
        lastDate = date.getHours() + ':' + date.getMinutes();
    }

    return {
        _id: dialog._id,
        name: dialog.name,
        type: dialog.type,
        last_message: dialog.last_message === '[attachment]' ? 'Attachment' : dialog.last_message,
        attachment: dialog.last_message === '[attachment]',
        last_message_date_sent: lastDate,
        users: dialog.occupants_ids || []
    };
};

Helpers.prototype.fillMessagePrams = function(message){
    if(message.attachments){
        var attachments = message.attachments;

        for(var i = 0; i < attachments.length; i++) {
            var src =  QB.content.publicUrl(attachments[i].id) + '/' + '/download.xml?token=' + app.token;
            attachments[i].src = src;
        }
    }

    return message;
};

Helpers.prototype.addEvent = function(elems, eventType, callback){
    _.each(elems, addEvent);

    function addEvent(elem){
        elem.addEventListener(eventType, callback);
    }
};

Helpers.prototype.removeclass = function(elem, classname){
    elem.classList.remove(classname);
};

Helpers.prototype.toHtml = function(str){
    var tmp = document.createElement('div'),
        elements = [],
        nodes;

    tmp.innerHTML = str;
    nodes = tmp.childNodes;

    for(var i = 0; i < nodes.length; i++){
        if(nodes[i].nodeType === 1) elements.push(nodes[i]);
    }

    return elements;
};

var helpers = new Helpers();
