
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

$(document).ready(function() {

  // First of all create a session and obtain a session token
  // Then you will be able to run requests to Users
  //
  QB.createSession(function(err,result){
    console.log('Session create callback', err, result);
  });

  $('#sign_up').on('click', function() {
    var login = $('#usr_sgn_p_lgn').val();
    var password = $('#usr_sgn_p_pwd').val();

    console.log("login: " + login + ", password: " + password);

    var params = { 'login': login, 'password': password};

    QB.users.create(params, function(err, user){
      if (user) {
        $('#output_place').html(JSON.stringify(user));
      } else  {
        $('#output_place').html(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");
    });
  });

  $('#sign_in').on('click', function() {
    var login = $('#usr_sgn_n_lgn').val();
    var password = $('#usr_sgn_n_pwd').val();

    console.log("login: " + login + ", password: " + password);
  });

  $('#sign_out').on('click', function() {
 
  });

});
