/*
 * Sample JavaScript app using some of the QuckBlock WebSDK APIs
 *
 * Author: Dan Murphy (dan@quickblox.com)
 *
 */

(function () {
  APP = new App();
  $(document).ready(function(){
    APP.init();
    $.ajaxSetup({cache:true});
    $.getScript('//connect.facebook.net/en_UK/all.js', function(){
      FB.init({
        appId: '143947239147878',
        status: true,
        cookie: true
      });
    });
  });
}());

function App(){
  console.log('App constructed');
}

App.prototype.init = function(){
  var _this= this;
  //this.compileTemplates();
  $('#facebookButton').click(function(e){e.preventDefault(); _this.facebookLogin(e); return false;});
  $('#sessionButton').click(function(e){e.preventDefault(); _this.createSession(e); return false;});
  $('#sessionDeleteButton').click(function(e){e.preventDefault(); _this.deleteSession(e); return false;});
  $('#createContentButton').click(function(e){e.preventDefault(); _this.createContent(e); return false;});
};

App.prototype.compileTemplates = function(){
  var template = $('#content-template').html();
  this.template = Handlebars.compile(template);
};

App.prototype.createSession = function(e){
  var form, appId, authKey, secret, user, password, _this = this;
  console.log('createSession', e);
  form = $('#apiSession');
  appId = form.find('#appId')[0].value;
  authKey = form.find('#authKey')[0].value;
  secret = form.find('#secret')[0].value;
  console.log(form, appId, authKey, secret);
  user = form.find('#user')[0].value;
  password = form.find('#password')[0].value;
  QB.init(appId,authKey,secret, true);
  if (this.facebook) {
    QB.createSession({provider:'facebook', keys: {token: this.facebook.accessToken}}, function(e,r){_this.sessionCallback(e,r);});
  } else {
    if (user && password) {
      QB.createSession({login: user, password: password}, function(e,r){_this.sessionCallback(e,r);});
    } else {
      QB.createSession(function(e,r){_this.sessionCallback(e,r);});
    }
  }
};

App.prototype.sessionCallback= function(err, result){
  console.log('Session create callback', err, result);
  if (result){
    $('#session').append('<p><em>Created session</em>: ' + JSON.stringify(result) + '</p>');
    $('#sessionDeleteButton').removeAttr('disabled');
  } else {
    $('#session').append('<p><em>Error creating session token<em>: ' + JSON.stringify(err)+'</p>');
  }
};

App.prototype.deleteSession = function(e){
  var token = QB.session.token;
  console.log('deleteSession', e);
  QB.destroySession(function(err, result){
    console.log('Session destroy callback', err, result);
    if (result) {
      $('#session').append('<p><em>Deleted session token</em>: ' + token + '</p>');
      $('#sessionDeleteButton').attr('disabled', true);
    } else {
      $('#session').append('<p><em>Error occured deleting session token</em>: ' + JSON.stringify(err) + '</p>');
    }
  });
};

App.prototype.createContent= function(e){
  var form, params={}, name, type, isPublic, tags, _this= this;
  console.log('createContent', e);
  form = $('#createContent');
  name = form.find('#name')[0].value;
  isPublic = form.find('#public')[0].value === 'true';
  type = form.find('#type')[0].value;
  tags = form.find('#tags')[0].value;
  if (name) {params.name = name;}
  if (isPublic) {params.public = isPublic;}
  if (tags) {params.tag_list = tags;}
  params.file = form.find('#file')[0].files[0];
  QB.content.createAndUpload(params, function (err, result){
      if (err) {
        $('#usersList').append('<p><em>Error creating content</em>:' + JSON.stringify(err) + '</p>');
      } else {
        QB.content.getFileUrl(result.id, function (err, res) {
          $('#contentList').append('<p><em>File URL</em>:' + res + '</p>');
          $('#contentList').append('<img src="' + res + '"/>' );
          });
      }
  });
};

App.prototype.facebookLogin = function (e){
  var _this = this;
  console.log('facebookLogin', e);
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
        $('#session').append('<p><em>Facebook: ' + JSON.stringify(response) + '</p>');
      _this.facebook = response.authResponse;
    } else {
      FB.Event.subscribe('auth.authResponseChange', function(response) {
        console.log('FB Auth change', response);
        $('#session').append('<p><em>Facebook: ' + JSON.stringify(response) + '</p>');
        if (response.status === 'connected'){
          _this.facebook = response.authResponse;
        } else {
          _this.facebook = null;
        }
      });
      FB.login();
    }
  });
};


// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
// http://blog.stevenlevithan.com/archives/parseuri

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) {uri[o.key[i]] = m[i] || "";}

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) {uri[o.q.name][$1] = $2;}
	});

	return uri;
}

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
