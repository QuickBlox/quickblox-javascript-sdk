;(function(window, QB) {
    'use strict';

    /** GLOBAL */
    window.app = {};
    app.helpers = {};
    app.filter = {
        'names': 'no _1977 inkwell moon nashville slumber toaster walden'
    };
    app.network = {};


    /* [getQueryVar get value of key from search string of url]
     * @param  {[string]} q [name of query]
     * @return {[string]}   [value of query]
     */
    app.helpers.getQueryVar = function(q){
        var query = window.location.search.substring(1),
            vars = query.split('&'),
            answ = false;

        vars.forEach(function(el, i){
            var pair = el.split('=');

            if(pair[0] === q) {
                answ = pair[1];
            }
        });

        return answ;
    };

    app.helpers.isBytesReceivedChanges = function(userId, inboundrtp) {
        var res = true,
            inbBytesRec = inboundrtp ? inboundrtp.bytesReceived : 0;

        if(!app.network[userId]) {
            app.network[userId] = {
              'bytesReceived': inbBytesRec
            };
        } else {
            if(app.network[userId].bytesReceived >= inbBytesRec) {
                res = false;
            } else {
                app.network[userId] = {
                    'bytesReceived': inbBytesRec
                };
            }
        }

        return res;
    };

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

    /**
     * [getUui - generate a unique id]
     * @return {[string]} [a unique id]
     */
    function _getUui() {
        var navigator_info = window.navigator;
        var screen_info = window.screen;
        var uid = navigator_info.mimeTypes.length;

        uid += navigator_info.userAgent.replace(/\D+/g, '');
        uid += navigator_info.plugins.length;
        uid += screen_info.height || '';
        uid += screen_info.width || '';
        uid += screen_info.pixelDepth || '';

        return uid;
    }

    app.helpers.join = function(data) {
        var userRequiredParams = {
            'login': _getUui(),
            'password': 'webAppPass'
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
                                'tag_list': data.room
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
                            if(loginUser.user_tags !== data.room || loginUser.full_name !== data.username ) {
                                QB.users.update(loginUser.id, {
                                    'full_name': data.username,
                                    'tag_list': data.room
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
        return new Promise(function(resolve, reject) {
            var tpl = _.template( $('#user_tpl').html() ),
                usersHTML = '',
                users = [];

            QB.users.get({'tags': [app.caller.user_tags], 'per_page': 100}, function(err, result){
                if (err) {
                    reject(err);
                } else {
                    _.each(result.items, function(item) {
                        users.push(item.user);

                        if( item.user.id !== app.caller.id ) {
                            usersHTML += tpl(item.user);
                        }
                    });

                    if(result.items.length < 2) {
                        reject({
                            'title': 'not found',
                            'message': 'Not found users by tag'
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
