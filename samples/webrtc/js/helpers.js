;(function(window, QB) {
    'use strict';

    /** GLOBAL */
    window.app = new Proxy({}, {
        set: function(obj, prop, value) {

            if (prop === 'currentSession') {

                if(typeof value === "object" && value.opponentsIDs && value.opponentsIDs.length > 1  ){
                    $('.j-record').css("display", "none");
                }else{
                    $('.j-record').css("display", "inline-block");
                }

                if(typeof value === "object" && value.callType && value.callType === QB.webrtc.CallType.AUDIO){
                    $('.j-caller__ctrl[data-target="screen"]').css("display", "none");
                    $('.j-caller__ctrl[data-target="video"]').css("display", "none");
                }else{
                    $('.j-caller__ctrl[data-target="screen"]').css("display", "inline-block");
                    $('.j-caller__ctrl[data-target="video"]').css("display", "inline-block");
                }

            }

            // The default behavior to store the value
            obj[prop] = value;

            // Indicate success
            return true;
        }
    });
    app.helpers = {};
    app.filter = {
        'names': 'no _1977 inkwell moon nashville slumber toaster walden'
    };
    app.network = {};

    /**
     * [Set fixed of relative position on footer]
     */
    app.helpers.setFooterPosition = function() {
        var $footer = $('.j-footer'),
            invisibleClassName = 'invisible',
            footerFixedClassName = 'footer-fixed';

        if( $(window).outerHeight() > $('.j-wrapper').outerHeight() ) {
          $footer.addClass(footerFixedClassName);
        } else {
          $footer.removeClass(footerFixedClassName);
        }

        $footer.removeClass(invisibleClassName);
    };

    app.helpers.notifyIfUserLeaveCall = function(session, userId, reason, title) {
        var userRequest = _.findWhere(app.users, {'id': +userId}),
            userCurrent = _.findWhere(app.users, {'id': +session.currentUserID});

        /** It's for p2p call */
        if(session.opponentsIDs.length === 1) {
            app.helpers.stateBoard.update({
                'title': 'p2p_call_stop',
                'property': {
                    'name': userRequest.full_name,
                    'currentName': userCurrent.full_name,
                    'reason': reason
                }
            });
        } else {
            /** It's for groups call */

            $('.j-callee_status_' + userId).text(title);
        }
    };

    app.helpers.changeFilter = function(selector, filterName) {
        $(selector).removeClass(app.filter.names)
            .addClass( filterName );
    };

    app.helpers.getConStateName = function(num) {
        var answ;

        switch (num) {
            case QB.webrtc.PeerConnectionState.DISCONNECTED:
            case QB.webrtc.PeerConnectionState.FAILED:
            case QB.webrtc.PeerConnectionState.CLOSED:
                answ = 'DISCONNECTED';
                break;
            default:
                answ = 'CONNECTING';
        }

        return answ;
    };

    app.helpers.toggleRemoteVideoView = function(userId, action) {
      var $video = $('#remote_video_' + userId);

      if(!_.isEmpty(app.currentSession) && $video.length){
          if(action === 'show') {
              $video.parents('.j-callee').removeClass('wait');
          } else if(action === 'hide') {
              $video.parents('.j-callee').addClass('wait');
          } else if(action === 'clear') {
              /** detachMediaStream take videoElementId */
              app.currentSession.detachMediaStream('remote_video_' + userId);
              $video.parents('.j-callee').removeClass('wait');
          }
        }
    };

    app.helpers.join = function(data) {
        var userRequiredParams = {
            'login': data.login,
            'password': 'quickblox'
        };

        return new Promise(function(resolve, reject) {
            QB.createSession(function(csErr, csRes){
                if(csErr) {
                    reject(csErr);
                } else {
                    /** In first trying to login */
                    QB.login(userRequiredParams, function(loginErr, loginUser){
                        if(loginErr) {
                            /** Login failed, trying to create account */
                            QB.users.create({
                                'login': userRequiredParams.login,
                                'password': userRequiredParams.password,
                                'full_name': data.username,
                            }, function(createErr, createUser){
                                if(createErr) {
                                    console.log('[create user] Error:', createErr);
                                    reject(createErr);
                                } else {
                                    QB.login(userRequiredParams, function(reloginErr, reloginUser) {
                                        if(reloginErr) {
                                            console.log('[relogin user] Error:', reloginErr);
                                        } else {
                                            resolve(reloginUser);
                                        }
                                    });
                                }
                            });
                        } else {
                            /** Update info */
                            if(loginUser.full_name !== data.username) {
                                QB.users.update(loginUser.id, {
                                    'full_name': data.username,
                                }, function(updateError, updateUser) {
                                    if(updateError) {
                                        console.log('APP [update user] Error:', updateError);
                                        reject(updateError);
                                    } else {
                                        resolve(updateUser);
                                    }
                                });
                            } else {
                                resolve(loginUser);
                            }
                        }
                    });
                }
            });
        });
    };

    app.helpers.renderUsers = function() {

        if(app.helpers.renderUsers.stop == undefined){
            app.helpers.renderUsers.stop = false;
        }

        if(app.helpers.renderUsers.condition == undefined){
            app.helpers.renderUsers.condition = {
                order: {
                    field:"updated_at",
                    sort: "desc"
                },
                page:1,
                per_page: 100
            };
        }

        return new Promise(function(resolve, reject) {

            if(app.helpers.renderUsers.stop){
                reject({
                    'title': 'function is stopped',
                    'message': 'function is stopped'
                });
            }

            var tpl = _.template( $('#user_tpl').html() ),
                usersHTML = '',
                tmp,
                users = [];

            QB.users.listUsers(app.helpers.renderUsers.condition, function(err, result){
                if (err) {
                    reject(err);
                } else {
                    _.each(result.items, function(item) {
                        users.push(item.user);
                        if( item.user.id !== app.caller.id ) {
                            usersHTML += tpl(item.user);
                        }else{
                            tmp += 1;
                        }
                    });

                    if(result.items.length < tmp) {
                        reject({
                            'title': 'not found',
                            'message': 'Not found users'
                        });
                    } else {
                        resolve({
                            'usersHTML': usersHTML,
                            'users': users
                        });
                    }
                }
            });
        });
    };

    app.helpers.getUsersStatus = function(){
        var users = {};

        if(app.calleesAnwered.length){
            users.accepted = app.calleesAnwered;
        }

        if(app.calleesRejected.length){
            users.rejected = app.calleesRejected;
        }

        return users;
    };



}(window, window.QB));
