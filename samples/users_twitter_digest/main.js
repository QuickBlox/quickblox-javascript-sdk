(function () {
  QB.createSession(function(err,result){
    console.log('Session create callback', err, result);
  });

  $('#digits-sdk').load(function () {
    Digits.init({ consumerKey: digitsKey })
      .done(function() {
        console.log('Digits initialized.');
      })
      .fail(function() {
        console.log('Digits failed to initialize.');
      });

    $('#sign_in_social').click(onLoginButtonClick);
  });
})();

function onLoginButtonClick(event) {
  console.log('Digits login started.');
  Digits.logIn().done(onLogin).fail(onLoginFailure);
}

function onLogin(loginResponse) {
  console.log('Digits login succeeded.');

  var params = {
    provider: 'twitter_digits',
    twitter_digits: loginResponse.oauth_echo_headers
  };

  // login with twitter_digits params
  QB.login(params, function(err, user){
    if (user) {
      $('#output_place').val(JSON.stringify(user));
      onDigitsSuccess();
    }else{
      $('#output_place').val(JSON.stringify(err));
      onLoginFailure();
    }
  });
}

function onLoginFailure(loginResponse) {
  console.log('Digits login failed.');
}

function onDigitsSuccess(response) {
  console.log('Digits phone number retrieved.');
}
