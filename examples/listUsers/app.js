/*
 * Sample JavaScript app using some of the QuckBlock WebSDK APIs
 *
 * Author: Dan Murphy (dan@quickblox.com)
 *
 */

(function () {
  APP = new App();
}());

function App(){
  console.debug('App constructed');
}

App.prototype.createSession = function(e){
  var form, appId, authKey, secret;
  console.debug('CreateApiSession');
  e.preventDefault();
  form = $('#apiSession');
  appId = form.find('#appId')[0].value;
  authKey = form.find('#authKey')[0].value;
  secret = form.find('#secret')[0].value;
  console.debug(form, appId, authKey, secret);
  QB.init(appId,authKey,secret, true);
  QB.createSession(function(err,result){
    console.debug('Session create callback', err, result);
    if (result){
      $('#session').append('<h4>Created session token ' + result.token + '</h4>');
      $('#sessionDeleteButton').removeAttr('disabled');
    } else {
      $('#session').append('<h4>Error creating session token ' + JSON.stringify(err) + '</h4>');
    }
  });
};

App.prototype.deleteSession = function(e){
  var token = QB.session.token;
  console.debug('DeleteApiSession');
  e.preventDefault();
  QB.destroySession(function(err, result){
    console.debug('Session destroy callback', err, result);
    if (result) {
      $('#session').append('<h4>Deleted session token ' + token + '</h4>');
      $('#sessionDeleteButton').attr('disabled', true);
    } else {
      $('#session').append('<h4>Error occured deleting session token ' + JSON.stringify(err) + '</h4>');
    }
  });
};

App.prototype.listUsers= function(e){
  var form, filterType, filterValue, perPage, pageNo, params = {};
  console.debug('listUsers');
  e.preventDefault();
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
  $('#users').find('h4').remove();
  $('#users').find('p').remove();
  QB.users().listUsers(params, function(err,result){
    console.debug('Users callback', err, result);
    if (result) {
      $('#users').append('<h4>Retrieved users:</h4>' + '<p>' + JSON.stringify(result) + '</p>');
    } else {
      $('#users').append('<h4>Error retrieving users' + JSON.stringify(err) + '</h4>');
    }
  });
}
