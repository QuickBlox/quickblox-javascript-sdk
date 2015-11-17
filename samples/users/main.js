// Init QuickBlox application here
//
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

$(document).ready(function() {

  // First of all create a session and obtain a session token
  // Then you will be able to run requests to Users
  //
  QB.createSession(function(err,result){
    console.log('Session create callback', err, result);
  });

  // Init Twitter Digits
  //

  var digitsKey = 'uH2aUsd3BP0qLpTezVnqXyZAk';

  $('#digits-sdk').load(function () {
    Digits.init({ consumerKey: digitsKey })
      .done(function() {
        console.log('Digits initialized.');
      })
      .fail(function(error) {
        console.log('Digits failed to initialize: ' + JSON.stringify(error));
      });

    // Login user twitter digits
    $('#sign_in_twitter_digits').on('click', function() {
      Digits.logIn()
        .done(function(loginResponse) {

          var params = {
            provider: 'twitter_digits',
            twitter_digits: loginResponse.oauth_echo_headers
          };

          // login with twitter_digits params
          QB.login(params, function(err, user){
            if (user) {
              $('#output_place').val(JSON.stringify(user));
            }else{
              $('#output_place').val(JSON.stringify(err));
            }
          });

        })
        .fail(function(error) {
          console.log('Digits failed to login: ' + JSON.stringify(error));
        });
    });
  });

  // Create user
  //
  $('#sign_up').on('click', function() {
    var login = $('#usr_sgn_p_lgn').val();
    var password = $('#usr_sgn_p_pwd').val();

    var params = { 'login': login, 'password': password};

    QB.users.create(params, function(err, user){
      if (user) {
        $('#output_place').val(JSON.stringify(user));
      } else  {
        $('#output_place').val(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");

      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  });


  // Login user
  //
  $('#sign_in').on('click', function() {
    var login = $('#usr_sgn_n_lgn').val();
    var password = $('#usr_sgn_n_pwd').val();

    var params = { 'login': login, 'password': password};

    QB.login(params, function(err, user){
      if (user) {
        $('#output_place').val(JSON.stringify(user));
      } else  {
        $('#output_place').val(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");

      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  });

  // Login user with social provider
  //
  $('#sign_in_social').on('click', function() {

    var provider = $('#usr_sgn_n_social_provider').val();
    var token = $('#usr_sgn_n_social_token').val();
    var secret = $('#usr_sgn_n_social_secret').val();

    var params = { 'provider': provider, 'keys[token]': token, 'keys[secret]': secret};

    QB.login(params, function(err, user){
      if (user) {
        $('#output_place').val(JSON.stringify(user));
      } else  {
        $('#output_place').val(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");

      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  });

  // Logout user
  //
  $('#sign_out').on('click', function() {
     QB.logout(function(err, result){
      if (result) {
        $('#output_place').val(JSON.stringify(result));
      } else  {
        $('#output_place').val(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");

      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  });

  // Get users
  //
  $('#get_by').on('click', function() {
    var filter_value = $('#usrs_get_by_filter').val();
    var filter_type = $("#sel_filter_for_users option:selected").val();

    var params;

    var request_for_many_user = false;

    switch (filter_type) {
      // all users, no filters<
      case "1":
        params = { page: '1', per_page: '100'};
        request_for_many_user = true;
        break;

      // by id
      case "2":
        params = parseInt(filter_value);
        break;

      // by login
      case "3":
        params = {login: filter_value};
        break;

      // by fullname
      case "4":
        params = {full_name: filter_value};
        break;

      // by facebook id
      case "5":
        params = {facebook_id: filter_value};
        break;

      // by twitter id
      case "6":
        params = {twitter_id: filter_value};
        break;

      // by email
      case "7":
        params = {email: filter_value};
        break;

      // by tags
      case "8":
        params = {tags: filter_value};
        break;

      // by external id
      case "9":
        params = {external: filter_value};
        break;

      // custom filters
      case "10":
        // More info about filters here
        // http://quickblox.com/developers/Users#Filters
        params = {filter: { field: 'login', param: 'in', value: ["sam33","ivan_gram"] }};
        request_for_many_user = true;
        break;
    }

    console.log("filter_value: " + filter_value);

    if(request_for_many_user){
      QB.users.listUsers(params, function(err, result){
        if (result) {
          $('#output_place').val(JSON.stringify(result));
        } else  {
          $('#output_place').val(JSON.stringify(err));
        }

        console.log("current_page: " + result.current_page);
        console.log("per_page: " + result.per_page);
        console.log("total_entries: " + result.total_entries);
        console.log("count: " + result.items.length);

        $("#progressModal").modal("hide");

        $("html, body").animate({ scrollTop: 0 }, "slow");
      });
    }else{
      QB.users.get(params, function(err, user){
        if (user) {
          $('#output_place').val(JSON.stringify(user));
        } else  {
          $('#output_place').val(JSON.stringify(err));
        }

        $("#progressModal").modal("hide");

        $("html, body").animate({ scrollTop: 0 }, "slow");
      });
    }
  });

  // Update user
  //
  $('#update').on('click', function() {
    var user_id = $('#usr_upd_id').val();
    var user_fullname = $('#usr_upd_full_name').val();

    QB.users.update(parseInt(user_id), {full_name: user_fullname}, function(err, user){
      if (user) {
        $('#output_place').val(JSON.stringify(user));
      } else  {
        $('#output_place').val(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");

      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  });

  // Delete user
  //
  $('#delete_by').on('click', function() {
    var user_id = $('#usr_delete_id').val();
    var operation_type = $("#sel_filter_for_delete_user option:selected").val();

    var params;

    switch (operation_type) {
      // delete by id
      case "1":
        params = parseInt(user_id);
        break;

      // delete by external id
      case "2":
        params = {external: user_id};
        break;
    }

    QB.users.delete(params, function(err, user){
      if (user) {
        $('#output_place').val(JSON.stringify(user));
      } else  {
        $('#output_place').val(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");

      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  });

  // Reset email
  //
  $('#reset').on('click', function() {
    var user_email = $('#usr_rst_email').val();

    QB.users.resetPassword(user_email, function(err, user){
      if (user) {
        $('#output_place').val(JSON.stringify(user));
      } else  {
        $('#output_place').val(JSON.stringify(err));
      }

      $("#progressModal").modal("hide");

      $("html, body").animate({ scrollTop: 0 }, "slow");
    });
  });
});
