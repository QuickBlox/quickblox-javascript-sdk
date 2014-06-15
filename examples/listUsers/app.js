/*
 * Sample JavaScript app using some of the QuckBlock WebSDK APIs
 *
 * Author: Dan Murphy (dan@quickblox.com)
 *
 */

(function () {
  APP = new App();
  $(document).ready(function(){APP.init();});
}());

function App(){
  console.log('App constructed');
}

App.prototype.init = function(){
  var _this= this;
  this.compileTemplates();
  $('#sessionButton').click(function(e){_this.createSession(e); return false;});
  $('#sessionDeleteButton').click(function(e){_this.deleteSession(e); return false;});
  $('#listUsersButton').click(function(e){_this.listUsers(e); return false;});
};

App.prototype.compileTemplates = function(){
  var template = $('#users-template').html();
  this.usersTemplate = Handlebars.compile(template);
};

App.prototype.createSession = function(e){
  var form, appId, authKey, secret;
  console.log('createSession', e);
  form = $('#apiSession');
  appId = form.find('#appId')[0].value;
  authKey = form.find('#authKey')[0].value;
  secret = form.find('#secret')[0].value;
  console.log(form, appId, authKey, secret);
  QB.init(appId,authKey,secret, true);
  QB.createSession(function(err,result){
    console.log('Session create callback', err, result);
    if (result){
      $('#session').append('<p><em>Created session token<em>: ' + result.token + '</p>');
      $('#sessionDeleteButton').removeAttr('disabled');
    } else {
      $('#session').append('<p><em>Error creating session token<em>: ' + JSON.stringify(err)+'</p>');
    }
  });
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
    params.filter.field = filterType;
    params.filter.param = 'eq';
    params.filter.value = filterValue;
  }
  perPage = parseInt(form.find('#per_page')[0].value, 10);
  pageNo = parseInt(form.find('#page')[0].value, 10);
  if (typeof perPage === 'number') {params.per_page = perPage;}
  if (typeof pageNo === 'number') {params.page = pageNo;}
  QB.users.listUsers(params, function(err,result){
    console.log('Users callback', err, result);
    $('#userList').empty();
    if (result) {
      $('#userList').append(_this.usersTemplate(result));
    } else {
      $('#usersList').append('<em>Error retrieving users</em>:' + JSON.stringify(err));
    }
  });
}
