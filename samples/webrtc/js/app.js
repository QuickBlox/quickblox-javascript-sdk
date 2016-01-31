;(function(window, $) {
    'use strict';
    /** when DOM is ready */
    $(function() {
        var ui = {
                $usersTitle: $('.j-users__title'),
                $usersList: $('.j-users__list'),

                $panel: $('.j-pl'),
                $callees: $('.j-callees'),

                $btnCall: $('.j-call'),
                $btnHangup: $('.j-hangup'),

                $ctrlBtn: $('.j-caller__ctrl'),
                filterClassName: '.j-filter',

                modal: {
                    'income_call': '#income_call'
                },

                sounds: {
                    'call': 'callingSignal',
                    'end': 'endCallSignal',
                    'rington': 'ringtoneSignal'
                },
                setPositionFooter: function() {
                    var $footer = $('.j-footer'),
                        invisibleClassName = 'invisible',
                        footerFixedClassName = 'footer-fixed';

                    if( $(window).outerHeight() > $('.j-wrapper').outerHeight() ) {
                        $footer.addClass(footerFixedClassName);
                    } else {
                        $footer.removeClass(footerFixedClassName);
                    }

                    $footer.removeClass(invisibleClassName);
                },
                togglePreloadMain: function(action) {
                    var $main = $('.j-main'),
                        preloadClassName = 'main-preload';

                    if(action === 'show') {
                        $main.addClass( preloadClassName );
                    } else {
                        $main.removeClass( preloadClassName );
                    }
                },
                createUsers: function(users, $node) {
                    var tpl = _.template( $('#user_tpl').html() ),
                        usersHTML = '';

                    $node.empty();

                    _.each(users, function(user, i, list) {
                        usersHTML += tpl(user);
                    });

                    $node.append(usersHTML);
                },
                showCallBtn: function() {
                    this.$btnHangup.addClass('hidden');
                    this.$btnCall.removeClass('hidden');
                },
                hideCallBtn: function() {
                    this.$btnHangup.removeClass('hidden');
                    this.$btnCall.addClass('hidden');
                },
                toggleRemoteVideoView: function(userID, action) {
                    var $video = $('#remote_video_' + userID);

                    if(!_.isEmpty(app.currentSession) && $video.length){
                        if(action === 'show') {
                            $video.parents('.j-callee').removeClass('callees__callee-wait');
                        } else if(action === 'hide') {
                            $video.parents('.j-callee').addClass('callees__callee-wait');
                        } else if(action === 'clear') {
                            /** detachMediaStream take videoElementId */
                            app.currentSession.detachMediaStream('remote_video_' + userID);
                            $video.removeClass('fw-video-wait');
                        }
                    }
                },
                classesNameFilter: 'no aden reyes perpetua inkwell toaster walden hudson gingham mayfair lofi xpro2 _1977 brooklyn',
                changeFilter: function(selector, filterName) {
                    $(selector)
                        .removeClass(this.classesNameFilter)
                        .addClass( filterName );
                },
                callTime: 0,
                updTimer: function() {
                    this.callTime += 1000;

                    $('#timer').removeClass('hidden')
                        .text( new Date(this.callTime).toUTCString().split(/ /)[4] );
                }
            },
            app = {
                caller: {},
                callees: {},
                currentSession: {},
                mainVideo: 0
            },
            isDeviceAccess = true,
            takedCallCallee = [],
            remoteStreamCounter = 0,
            authorizationing = false,
            callTimer;

        function initializeUI(arg) {
            var params = arg || {};

            ui.createUsers(QBUsers, ui.$usersList);
            ui.$usersTitle.text(MESSAGES.title_login);

            if(!params.withoutUpdMsg || params.msg) {
                qbApp.MsgBoard.update(params.msg);
            }
        }

        function showErrorAccessPermission(error) {
          var errorTitle = 'Error: ',
            errorMsg = 'Failed to get access to your camera or microphone. Please check your hardware configuration.';

          if(error && error.message) {
            alert(errorTitle + error.message);
          } else {
            alert(errorTitle + errorMsg);
          }
        }

        /**
         * INITIALIZE
         */
        ui.setPositionFooter();
        QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, CONFIG);

        /** Before use WebRTC checking WebRTC is avaible */
        if (!QB.webrtc) {
          qbApp.MsgBoard.update('webrtc_not_avaible');
          alert('Error: ' + window.MESSAGES.webrtc_not_avaible);
          return;
        }

        initializeUI({withoutUpdMsg: false, msg: 'login'});

        /**
         * EVENTS
         */
        /** Choose caller or callees */
        $(document).on('click', '.j-user', function(e) {
            var $el = $(this),
                usersWithoutCaller = [],
                user = {},
                classNameCheckedUser = 'users__user-active';

            /** if app.caller is not exist create caller, if no - add callees */
            if(!window.navigator.onLine) {
                qbApp.MsgBoard.update('no_internet');
            } else {
                if(_.isEmpty(app.caller)) {
                    authorizationing = true;
                    ui.togglePreloadMain('show');
                    /**
                     * id: + for convert to number type
                     */
                    app.caller = {
                        id: +$.trim( $el.data('id') ),
                        login: $.trim( $el.data('login') ),
                        password: $.trim( $el.data('password') ),
                        full_name: $.trim( $el.data('name') )
                    };

                    usersWithoutCaller = _.filter(QBUsers, function(i) { return i.id !== app.caller.id; });

                    ui.$usersList.empty();

                    qbApp.MsgBoard.update('connect');

                    QB.chat.connect({
                        jid: QB.chat.helpers.getUserJid( app.caller.id, QBApp.appId ),
                        password: app.caller.password
                    }, function(err, res) {
                        if(err !== null) {
                            app.caller = {};

                            ui.setPositionFooter();
                            ui.togglePreloadMain('hide');
                            QB.chat.disconnect();
                        } else {
                            ui.createUsers(usersWithoutCaller, ui.$usersList);

                            ui.$usersTitle.text(MESSAGES.title_callee);
                            qbApp.MsgBoard.update('login_tpl', {name: app.caller.full_name});

                            ui.$panel.removeClass('hidden');
                            ui.setPositionFooter();
                            ui.togglePreloadMain('hide');
                        }

                        authorizationing = false;
                    });
                } else {
                    user.id = +$.trim( $el.data('id') );
                    user.name = $.trim( $el.data('name') );

                    if ($el.hasClass(classNameCheckedUser)) {
                        delete app.callees[user.id];
                        $el.removeClass(classNameCheckedUser);
                    } else {
                        app.callees[user.id] = user.name;
                        $el.addClass(classNameCheckedUser);
                    }
                }
            }

            return false;
        });

        /** Logout */
        $(document).on('click', '.j-logout', function() {
            QB.chat.disconnect();
            /** see others in onDisconnectedListener */
        });

        /** Call */
        $(document).on('click', '.j-call', function(e) {
          var videoElems = '',
              mediaParams = {
                  audio: true,
                  video: true,
                  options: {
                      muted: true,
                      mirror: true
                  },
                  elemId: 'localVideo'
              };

          if(!window.navigator.onLine) {
            qbApp.MsgBoard.update('no_internet');
          } else {
            if ( _.isEmpty(app.callees) ) {
              $('#error_no_calles').modal();
            } else {
              qbApp.MsgBoard.update('create_session');

              app.currentSession = QB.webrtc.createNewSession(Object.keys(app.callees), QB.webrtc.CallType.VIDEO);

              app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) {
                  var errorMsg = '';

                  if(err && err.message) {
                    errorMsg += 'Error: ' + err.message;
                  } else {
                    errorMsg += 'device_not_found';
                  }
                  app.currentSession.stop({});

                  showErrorAccessPermission(err);
                  qbApp.MsgBoard.update(errorMsg, {name: app.caller.full_name}, true);
                } else {
                  app.currentSession.call({}, function(error) {
                    if(error) {
                        console.warn(error.detail);
                    } else {
                      var compiled = _.template( $('#callee_video').html() );

                      qbApp.MsgBoard.update('calling');
                      document.getElementById(ui.sounds.call).play();

                      /** create video elements for callees */
                      Object.keys(app.callees).forEach(function(userID, i, arr) {
                          videoElems += compiled({userID: userID, name: app.callees[userID] });
                      });

                      ui.$callees.append(videoElems);

                      ui.hideCallBtn();
                      ui.setPositionFooter();
                    }
                  });
                }
              });
            }
          }
        });

        /** Hangup */
        $(document).on('click', '.j-hangup', function() {
            if(!_.isEmpty(app.currentSession)) {
                app.currentSession.stop({});
                app.currentSession = {};

                qbApp.MsgBoard.update('login_tpl', {name: app.caller.full_name});
            }
        });

        /** Accept */
        $(document).on('click', '.j-accept', function() {
            var mediaParams = {
                    audio: true,
                    video: true,
                    elemId: 'localVideo',
                    options: {
                        muted: true,
                        mirror: true
                    }
                },
                videoElems = '';

            $(ui.modal.income_call).modal('hide');

            document.getElementById(ui.sounds.rington).pause();

            app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) {
                  var errorMsg = '';

                  if(err && err.message) {
                    errorMsg += 'Error: ' + err.message;
                  } else {
                    errorMsg += 'device_not_found';
                  }

                  showErrorAccessPermission(err);

                  qbApp.MsgBoard.update(errorMsg, {name: app.caller.full_name}, true);
                  isDeviceAccess = false;
                  app.currentSession.stop({});
                } else {
                    var opponents = [app.currentSession.initiatorID],
                        compiled = _.template( $('#callee_video').html() );

                    ui.hideCallBtn();

                    /** get all opponents */
                    app.currentSession.opponentsIDs.forEach( function(userID, i, arr) {
                        if(userID != app.currentSession.currentUserID){
                            opponents.push(userID);
                        }
                    });

                    /** create callees (video elemets) */
                    opponents.forEach(function(userID, i, arr) {
                        var peerState = app.currentSession.connectionStateForUser(userID),
                            userInfo = _.findWhere(QBUsers, {id: userID});

                        if( (document.getElementById('remote_video_' + userID) === null) ) {
                            videoElems += compiled({userID: userID, name: userInfo.full_name});

                            if(peerState === QB.webrtc.PeerConnectionState.CLOSED){
                              ui.toggleRemoteVideoView(userID, 'clear');
                            }
                        }
                    });

                    ui.$callees.append(videoElems);
                    qbApp.MsgBoard.update('during_call', {name: app.caller.full_name});
                    ui.setPositionFooter();

                    app.currentSession.accept({});
                }
            });
        });

        /** Reject */
        $(document).on('click', '.j-decline', function() {
            if (!_.isEmpty(app.currentSession)) {
                app.currentSession.reject({});

                $(ui.modal.income_call).modal('hide');
                document.getElementById(ui.sounds.rington).pause();
            }
        });

        /** Mute / Unmute cam / mic */
        $(document).on('click', '.j-caller__ctrl', function() {
            var $btn = $(this),
                isActive = $btn.hasClass('active');

            if( _.isEmpty( app.currentSession)) {
                return false;
            } else {
                if(isActive) {
                    $btn.removeClass('active');
                    app.currentSession.unmute( $btn.data('target') );
                } else {
                    $btn.addClass('active');
                    app.currentSession.mute( $btn.data('target') );
                }
            }
        });

        /** set main video */
        $(document).on('click', '.j-callees__callee_video', function() {
            var $that = $(this),
                userID = +($(this).data('user')),
                classesName = [],
                activeClass = [];

            if( app.currentSession.peerConnections[userID].stream && !_.isEmpty( $that.attr('src')) ) {
                if( $that.hasClass('active') ) {
                    $that.removeClass('active');

                    app.currentSession.detachMediaStream('main_video');
                    ui.changeFilter('#main_video', 'no');
                    app.mainVideo = 0;
                } else {
                    $('.j-callees__callee_video').removeClass('active');
                    $that.addClass('active');

                    ui.changeFilter('#main_video', 'no');

                    activeClass = _.intersection($that.attr('class').split(/\s+/), ui.classesNameFilter.split(/\s+/) );

                    /** set filter to main video if exist */
                    if(activeClass.length) {
                        ui.changeFilter('#main_video', activeClass[0]);
                    }
                    app.currentSession.attachMediaStream('main_video', app.currentSession.peerConnections[userID].stream);
                    app.mainVideo = userID;
                }
            }
        });

        /** Change filter for filter */
        $(document).on('change', ui.filterClassName, function() {
            var val = $.trim( $(this).val() );

            ui.changeFilter('#localVideo', val);

            if(!_.isEmpty( app.currentSession)) {
                app.currentSession.update({filter: val});
            }
        });

        $(window).on('resize', function() {
            ui.setPositionFooter();
        });

        /**
         * QB Event listener.
         *
         * [Recommendation]
         * We recomend use Function Declaration
         * that SDK could identify what function(listener) has error
         *
         * Chat:
         * - onDisconnectedListener
         * WebRTC:
         * - onSessionCloseListener
         * - onUserNotAnswerListener
         * - onUpdateCallListener
         * - onCallListener
         * - onAcceptCallListener
         * - onRejectCallListener
         * - onStopCallListener
         * - onRemoteStreamListener
         * - onSessionConnectionStateChangedListener
         */
        QB.chat.onDisconnectedListener = function() {
          console.log('onDisconnectedListener.');
          var initUIParams = authorizationing ? {withoutUpdMsg: false, msg: 'no_internet'} : {withoutUpdMsg: false, msg: 'login'};

          app.caller = {};
          app.callees = [];
          app.mainVideo = 0;
          remoteStreamCounter = 0;

          ui.togglePreloadMain('hide');
          initializeUI(initUIParams);
          ui.$panel.addClass('hidden');

          /** delete callee video elements */
          $('.j-callee').remove();

          ui.setPositionFooter();
          authorizationing = false;
        };

        QB.webrtc.onSessionCloseListener = function onSessionCloseListener(session){
          console.log('onSessionCloseListener: ' + session);

          /** pause play call sound */
          document.getElementById(ui.sounds.call).pause();
          document.getElementById(ui.sounds.end).play();

          ui.showCallBtn();

           if(!isDeviceAccess) {
              isDeviceAccess = true;
          } else {
              if(session.opponentsIDs.length > 1) {
                  qbApp.MsgBoard.update('call_stop', {name: app.caller.full_name});
              }
          }


            /** delete blob from myself video */
            document.getElementById('localVideo').src = '';

            /** disable controls (mute cam/min) */
            ui.$ctrlBtn.removeClass('active');

            /** delete callee video elements */
            $('.j-callee').remove();
            /** clear main video */
            app.currentSession.detachMediaStream('main_video');
            app.mainVideo = 0;
            remoteStreamCounter = 0;
        };

        QB.webrtc.onUserNotAnswerListener = function onUserNotAnswerListener(session, userId) {
          console.group('onUserNotAnswerListener.');
              console.log('UserId: ' + userId);
              console.log('Session: ' + session);
          console.groupEnd();

          var userInfo = _.findWhere(QBUsers, {id: +userId}),
              currentUserInfo = _.findWhere(QBUsers, {id: app.currentSession.currentUserID});

            /** It's for p2p call */
          if(session.opponentsIDs.length === 1) {
              qbApp.MsgBoard.update(
                'p2p_call_stop',
                {
                  name: userInfo.full_name,
                  currentName: currentUserInfo.full_name,
                  reason: 'not answered'
                }
              );
          }

          $('.j-callee_status_' + userId).text('No Answer');
        };

        QB.webrtc.onUpdateCallListener = function onUpdateCallListener(session, userId, extension) {
          console.group('onUpdateCallListener.');
              console.log('UserId: ' + userId);
              console.log('Session: ' + session);
              console.log('Extension: ' + JSON.stringify(extension));
          console.groupEnd();

          ui.changeFilter('#remote_video_' + userId, extension.filter);
          if (+(app.mainVideo) === userId) {
              ui.changeFilter('#main_video', extension.filter);
          }
        };

        QB.webrtc.onCallListener = function onCallListener(session, extension) {
          console.group('onCallListener.');
              console.log('Session: ' + session);
              console.log('Extension: ' + JSON.stringify(extension));
          console.groupEnd();

          /** close previous modal if his is exist */
          $(ui.modal.income_call).modal('hide');

          var userInfo = _.findWhere(QBUsers, {id: session.initiatorID});

          app.currentSession = session;

          /** set name of caller */
          $('.j-ic_initiator').text( userInfo.full_name );

          $(ui.modal.income_call).modal('show');

          document.getElementById(ui.sounds.rington).play();
        };

        QB.webrtc.onAcceptCallListener = function onAcceptCallListener(session, userId, extension) {
          console.group('onAcceptCallListener.');
              console.log('UserId: ' + userId);
              console.log('Session: ' + session);
              console.log('Extension: ' + JSON.stringify(extension));
          console.groupEnd();

          var userInfo = _.findWhere(QBUsers, {id: userId}),
              filterName = $.trim( $(ui.filterClassName).val() );

          document.getElementById(ui.sounds.call).pause();

          app.currentSession.update({filter: filterName});

          /** update list of callee who take call */
          takedCallCallee.push(userInfo);

          if(app.currentSession.currentUserID === app.currentSession.initiatorID) {
              qbApp.MsgBoard.update('accept_call', {users: takedCallCallee});
          }
        };

        QB.webrtc.onRejectCallListener = function onRejectCallListener(session, userId, extension) {
          console.group('onRejectCallListener.');
              console.log('UserId: ' + userId);
              console.log('Session: ' + session);
              console.log('Extension: ' + JSON.stringify(extension));
          console.groupEnd();

          var userInfo = _.findWhere(QBUsers, {id: userId}),
              currentUserInfo = _.findWhere(QBUsers, {id: app.currentSession.currentUserID});

          /** It's for p2p call */
          if(session.opponentsIDs.length === 1) {
              qbApp.MsgBoard.update(
                'p2p_call_stop',
                {
                  name: userInfo.full_name,
                  currentName: currentUserInfo.full_name,
                  reason: 'rejected the call'
                }
              );
          }

          /** It's for groups call */
          $('.j-callee_status_' + userId).text('Rejected');
        };

        QB.webrtc.onStopCallListener = function onStopCallListener(session, userId, extension) {
          console.group('onStopCallListener.');
              console.log('UserId: ' + userId);
              console.log('Session: ' + session);
              console.log('Extension: ' + JSON.stringify(extension));
          console.groupEnd();

          /** It's for p2p call */
          var userInfo = _.findWhere(QBUsers, {id: userId}),
              currentUserInfo = _.findWhere(QBUsers, {id: app.currentSession.currentUserID});

          /** It's for p2p call */
          if(session.opponentsIDs.length === 1) {
              qbApp.MsgBoard.update(
                'p2p_call_stop',
                {
                  name: userInfo.full_name,
                  currentName: currentUserInfo.full_name,
                  reason: 'hung up the call'
                }
              );
          }

          /** It's for groups call */
          $('.j-callee_status_' + userId).text('Hung Up');
        };

        QB.webrtc.onRemoteStreamListener = function onRemoteStreamListener(session, userID, stream) {
          console.group('onRemoteStreamListener.');
              console.log('userID: ' + userID);
              console.log('Session: ' + session);
          console.groupEnd();
          app.currentSession.peerConnections[userID].stream = stream;

          app.currentSession.attachMediaStream('remote_video_' + userID, stream);

          if( remoteStreamCounter === 0) {
              $('#remote_video_' + userID).click();

              app.mainVideo = userID;
              ++remoteStreamCounter;
          }

          if(!callTimer) {
              callTimer = setInterval( function(){ ui.updTimer.call(ui) }, 1000);
          }
        };

        QB.webrtc.onSessionConnectionStateChangedListener = function onSessionConnectionStateChangedListener(session, userID, connectionState) {
          console.group('onSessionConnectionStateChangedListener.');
              console.log('UserID: ' + userID);
              console.log('Session: ' + session);
              console.log('Сonnection state: ' + connectionState);
          console.groupEnd();

          var connectionStateName = _.invert(QB.webrtc.SessionConnectionState)[connectionState],
              $calleeStatus = $('.j-callee_status_' + userID),
              isCallEnded = false;

          if(connectionState === QB.webrtc.SessionConnectionState.CONNECTING) {
              $calleeStatus.text(connectionStateName);
          }

          if(connectionState === QB.webrtc.SessionConnectionState.CONNECTED) {
              ui.toggleRemoteVideoView(userID, 'show');
              $calleeStatus.text(connectionStateName);
          }

          if(connectionState === QB.webrtc.SessionConnectionState.COMPLETED) {
              ui.toggleRemoteVideoView(userID, 'show');
              $calleeStatus.text('connected');
          }

          if(connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED){
              ui.toggleRemoteVideoView(userID, 'hide');
              $calleeStatus.text('disconnected');
          }

          if(connectionState === QB.webrtc.SessionConnectionState.CLOSED){
              ui.toggleRemoteVideoView(userID, 'clear');
              document.getElementById(ui.sounds.rington).pause();

              if(app.mainVideo === userID) {
                  $('#remote_video_' + userID).removeClass('active');

                  ui.changeFilter('#main_video', 'no');
                  app.currentSession.detachMediaStream('main_video');
                  app.mainVideo = 0;
              }

              if( !_.isEmpty(app.currentSession) ) {
                  if ( Object.keys(app.currentSession.peerConnections).length === 1 || userID === app.currentSession.initiatorID) {
                      $(ui.modal.income_call).modal('hide');
                  }
              }

              isCallEnded = _.every(app.currentSession.peerConnections, function(i) {
                  return i.iceConnectionState === 'closed';
              });

              /** remove filters */
              if( isCallEnded ) {
                  ui.changeFilter('#localVideo', 'no');
                  ui.changeFilter('#main_video', 'no');
                  $(ui.filterClassName).val('no');

                  takedCallCallee = [];
              }

              if (app.currentSession.currentUserID === app.currentSession.initiatorID && !isCallEnded) {
                  /** get array if users without user who ends call */
                  takedCallCallee = _.reject(takedCallCallee, function(num){ return num.id === +userID; });

                  qbApp.MsgBoard.update('accept_call', {users: takedCallCallee});
              }

              if( _.isEmpty(app.currentSession) || isCallEnded ) {
                  if(callTimer) {
                      $('#timer').addClass('hidden');

                      clearInterval(callTimer);
                      callTimer = null;
                      ui.callTime = 0;
                  }
              }
          }
        };
    });
}(window, jQuery));
