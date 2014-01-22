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
  console.debug('App constructed');
}

App.prototype.init = function(){
  var _this= this;
  //this.compileTemplates();
  $('#facebookButton').click(function(e){e.preventDefault(); _this.facebookLogin(e); return false;});
  $('#sessionButton').click(function(e){e.preventDefault(); _this.createSession(e); return false;});
  $('#sessionDeleteButton').click(function(e){e.preventDefault(); _this.deleteSession(e); return false;});
  $('#uploadFileButton').click(function(e){e.preventDefault(); _this.uploadFile(e); return false;});
  $('#updateFileButton').click(function(e){e.preventDefault(); _this.updateFile(e); return false;});
  $('#deleteFileButton').click(function(e){e.preventDefault(); _this.deleteFile(e); return false;});
  $('#downloadFileButton').click(function(e){e.preventDefault(); _this.downloadFile(e); return false;});
};

App.prototype.compileTemplates = function(){
  var template = $('#content-template').html();
  this.template = Handlebars.compile(template);
};

App.prototype.createSession = function(e){
  var form, appId, authKey, secret, user, password, params, _this = this;
  console.debug('createSession', e);
  form = $('#apiSession');
  appId = form.find('#appId')[0].value;
  authKey = form.find('#authKey')[0].value;
  secret = form.find('#secret')[0].value;
  user = form.find('#user')[0].value;
  password = form.find('#password')[0].value;
  console.debug(appId, authKey, secret, user);
  QB.init(appId,authKey,secret, true);
  if (this.facebook) {
    QB.createSession({provider:'facebook', keys: {token: this.facebook.accessToken}}, function(e,r){_this.sessionCallback(e,r);});
  } else {
    if (user && password) {
      QB.createSession({login: user, password: password}, function(e,r) {_this.sessionCallback(e,r);});
    } else {
      QB.createSession(function(e,r){_this.sessionCallback(e,r);});
    }
  }
};

App.prototype.sessionCallback= function(err, result){
  console.debug('Session create callback', err, result);
  if (result){
    $('#session').append('<p><em>Created session</em>: ' + JSON.stringify(result) + '</p>');
    $('#sessionDeleteButton').removeAttr('disabled');
  } else {
    $('#session').append('<p><em>Error creating session token<em>: ' + JSON.stringify(err)+'</p>');
  }
};

App.prototype.deleteSession = function(e){
  var token = QB.session.token;
  console.debug('deleteSession', e);
  QB.destroySession(function(err, result){
    console.debug('Session destroy callback', err, result);
    if (result) {
      $('#session').append('<p><em>Deleted session token</em>: ' + token + '</p>');
      $('#sessionDeleteButton').attr('disabled', true);
    } else {
      $('#session').append('<p><em>Error occured deleting session token</em>: ' + JSON.stringify(err) + '</p>');
    }
  });
};

App.prototype.formData= function(){
  return {
    className : document.getElementById('className').value,
    recId : document.getElementById('recId').value,
    field_name : document.getElementById('field_name').value,
    file : document.getElementById('file').files[0]
  };
};

App.prototype.uploadFile= function(e){
  data = this.formData();
  console.debug('uploadFile', data);
  QB.data.uploadFile(data.className, {id: data.recId, field_name: data.field_name, file: data.file},
                    function(err, result){
                      console.debug('upload file callback');
                      if (err) {
                        $('#customObjectResponse').append('<p><em>Error occured uploading file</em>: ' + JSON.stringify(err) + '</p>');
                      } else {
                         $('#customObjectResponse').append('<p><em>Uploaded file</em>:' + result.name + ' type ' + result.content_type + ' size ' + result.size);
                      }
  });
};

App.prototype.updateFile= function(e){
  var data = this.formData();
  console.debug('updateFile', data);
  QB.data.updateFile(data.className, {id: data.recId, field_name: data.field_name, file: data.file},
                    function(err, result){
                      console.debug('upload file callback');
                      if (err) {
                        $('#customObjectResponse').append('<p><em>Error occured updating file</em>: ' + JSON.stringify(err) + '</p>');
                      } else {
                         $('#customObjectResponse').append('<p><em>Uploaded file</em>:' + result.name + ' type ' + result.content_type + ' size ' + result.size);
                      }
   });
};

App.prototype.downloadFile= function(e){
  var data = this.formData();
  console.debug('downloadFile', data);
  QB.data.downloadFile(data.className, {id: data.recId, field_name: data.field_name, file: data.file},
                    function(err, result){
                      var buffer, bufferView, i, l, blob, objectUrl, image;
                      console.debug('upload file callback', err, result);
                      if (err) {
                        $('#customObjectResponse').append('<p><em>Error occured downloading file</em>: ' + JSON.stringify(err) + '</p>');
                      } else {
                         $('#customObjectResponse').append('<p><em>Downloaded size ' + result.length + ' bytes');
                         // NB this uses experimental code to display the file in browser
                         // see https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL
                         buffer = new ArrayBuffer(result.length);
                         bufferView = new Uint8Array(buffer);
                         for (i=0,l=result.length; i<l; i++){
                           bufferView[i] = result.charAt(i);
                         }
                         blob = new Blob([bufferView],{type:'image/jpeg'});
                         objectURL = window.URL.createObjectURL(blob);
                         image = document.createElement('img');
                         image.src = objectURL;
                         document.getElementById('customObjectResponse').appendChild(image);
                      }
   });
};

App.prototype.deleteFile= function(){
  var data= this.formData();
  console.debug('deleteFile', data);
  QB.data.deleteFile(data.className, {id: data.recId, field_name: data.field_name}, function(err,res){
                    if (err) {
                      $('#customObjectResponse').append('<p><em>Error occured deleting file</em>: ' + JSON.stringify(err) + '</p>');
                    } else {
                      $('#customObjectResponse').append('<p><em>File deleted</em>');
                    }
  });
};


App.prototype.facebookLogin = function (e){
  var _this = this;
  console.debug('facebookLogin', e);
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
        $('#session').append('<p><em>Facebook: ' + JSON.stringify(response) + '</p>');
      _this.facebook = response.authResponse;
    } else {
      FB.Event.subscribe('auth.authResponseChange', function(response) {
        console.debug('FB Auth change', response);
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
