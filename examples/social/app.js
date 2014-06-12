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
  this.compileTemplates();
  $('#facebookButton').click(function(e){e.preventDefault(); _this.facebookLogin(e); return false;});
  $('#sessionButton').click(function(e){e.preventDefault(); _this.createSession(e); return false;});
  $('#sessionDeleteButton').click(function(e){e.preventDefault(); _this.deleteSession(e); return false;});
  $('#listUsersButton').click(function(e){e.preventDefault(); _this.listUsers(e); return false;});
};

App.prototype.compileTemplates = function(){
  var template = $('#users-template').html();
  this.usersTemplate = Handlebars.compile(template);
};

App.prototype.createSession = function(e){
  var form, appId, authKey, secret, _this = this;
  console.log('createSession', e);
  form = $('#apiSession');
  appId = form.find('#appId')[0].value;
  authKey = form.find('#authKey')[0].value;
  secret = form.find('#secret')[0].value;
  console.log(form, appId, authKey, secret);
  QB.init(appId,authKey,secret, true);
  if (this.facebook) {
    QB.createSession({provider:'facebook', keys: {token: this.facebook.accessToken}}, function(e,r){_this.sessionCallback(e,r);});
  } else {
    QB.createSession(function(e,r){_this.sessionCallback(e,r);});
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
  var token = QB.service.qbInst.session.token;
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

App.prototype.listUsers= function(e){
  var form, filterType, filterValue, perPage, pageNo, params = {}, _this= this;
  console.log('listUsers', e);
  form = $('#listUsers');
  filterType = form.find('#userType')[0].value;
  filterValue = form.find('#userFilter')[0].value;
  if (filterType && filterValue) {
    params.filter = {};
    params.filter.type = filterType;
    params.filter.value = filterValue;
  }
  perPage = parseInt(form.find('#per_page')[0].value, 10);
  pageNo = parseInt(form.find('#page')[0].value, 10);
  if (typeof perPage === 'number') {params.perPage = perPage;}
  if (typeof pageNo === 'number') {params.pageNo = pageNo;}
  QB.users.listUsers(params, function(err,result){
    console.log('Users callback', err, result);
    $('#userList').empty();
    if (result) {
      $('#userList').append(_this.usersTemplate(result));
    } else {
      $('#usersList').append('<em>Error retrieving users</em>:' + JSON.stringify(err));
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


