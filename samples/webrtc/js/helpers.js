;(function(window, QB) {
    'use strict';

    /** GLOBAL */
    window.app = {};
    app.helpers = {};
    app.filter = {
        'names': 'no _1977 inkwell moon nashville slumber toaster walden'
    };
    app.network = {};

    app.helpers.isBytesReceivedChanges = function(userId, inboundrtp) {
        var res = true,
            inbBytesRec = inboundrtp.bytesReceived;

        if(app.network[userId] === undefined) {
            app.network[userId] = {
              'bytesReceived': inbBytesRec
            };
        } else {
            if(app.network[userId].bytesReceived === inbBytesRec) {
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
              $video.removeClass('wait');
          }
        }
    };

    /**
     * [getUui - generate a unique id]
     * @return {[string]} [a unique id]
     */
    function getUui() {
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
        return new Promise(function(resolve, reject) {
            QB.createSession(function(csError, csResult){
                if(csError) {
                    reject(csError);
                } else {
                    /** Login */
                    QB.login({
                            'login': getUui(),
                            'password': 'webAppPass'
                        },
                        function(egError, egUser){
                            /** User not found */
                            if(egError) {
                                QB.users.create({
                                        'login': getUui(),
                                        'password': 'webAppPass',
                                        'full_name': data.username,
                                        'tag_list': data.room
                                    },
                                    function(ucError, ucUser){
                                        if(ucError) {
                                            console.log('[create user] Error:', ucError);
                                            reject(ucError);
                                        } else {
                                            console.log('[create user] User:', ucUser);
                                            resolve(ucUser);
                                        }
                                    }
                                );
                            } else {
                                /** Update info */
                                if(egUser.user_tags !== data.room || egUser.full_name !== data.username ) {
                                    QB.users.update(egUser.id, {
                                        'full_name': data.username,
                                        'tag_list': data.room
                                    }, function(uuError, uuUser) {
                                        if(uuError) {
                                            console.log('APP [update user] Error:', uuError);
                                            reject(uuError);
                                        } else {
                                            console.log('APP [update user] User:', uuUser);
                                            resolve(uuUser);
                                        }
                                    });
                                } else {
                                    resolve(egUser);
                                }
                            }
                        }
                    );
                }
            });
        });
    };

    app.helpers.renderUsers = function() {
        return new Promise(function(resolve, reject) {
            var tpl = _.template( $('#user_tpl').html() ),
                usersHTML = '',
                users = [];

            QB.users.get({'tags': [app.caller.user_tags]}, function(err, result){
                if (err) {
                    reject(err);
                } else {
                    _.each(result.items, function(item) {
                        users.push(item.user);

                        if( item.user.id !== app.caller.id ) {
                            usersHTML += tpl(item.user);
                        }
                    });

                    if(!result.items.length) {
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
}(window, window.QB));
