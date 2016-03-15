;(function(window, QB, app, CONFIG, $, Backbone) {
    'use strict';

    /** INIT QB */
    $(function() {
        var sounds = {
            'call': 'callingSignal',
            'end': 'endCallSignal',
            'rington': 'ringtoneSignal'
        };

        var Router = Backbone.Router.extend({
            'routes': {
                'join': 'join',
                'dashboard': 'dashboard',
                '*query': 'relocated'
            },
            'container': $('.page'),
            'relocated': function() {
                var path = app.user ? 'dashboard' : 'join';

                app.router.navigate(path, {'trigger': true});
            },
            'join': function() {
                this.container
                    .removeClass('page-dashboard')
                    .addClass('page-join');

                app.helpers.setFooterPosition();

                app.caller = {};
                app.callees = {};
            },
            'dashboard': function() {
                if (_.isEmpty(app.caller)) {
                    app.router.navigate('join', { 'trigger': true });
                    return false;
                }

                /** render page */
                this.container
                    .removeClass('page-join')
                    .addClass('page-dashboard')
                    .find('.j-dashboard').empty();

                /** render skelet */
                $('.j-dashboard').append( $('#dashboard_tpl').html() );

                /** Before use WebRTC checking WebRTC is avaible */
                if (!QB.webrtc) {
                    app.helpers.stateBoard = new app.helpers.StateBoard('.j-state_board', {
                        title: 'webrtc_not_avaible',
                        isError: 'qb-error'
                    });

                    alert('Error: ' + CONFIG.MESSAGES.webrtc_not_avaible);
                    return;
                }

                /** render stateBoard */
                app.helpers.stateBoard = new app.helpers.StateBoard('.j-state_board', {
                    title: 'tpl_default',
                    property: {
                        name:  app.caller.full_name
                    }
                });

                /** render users wrapper */
                $('.j-users_wrap').append( $('#users_tpl').html() );

                /** render users */
                app.helpers.renderUsers().then(function(usersHtml) {
                    $('.j-users').empty()
                        .append(usersHtml)
                        .removeClass('wait');
                }, function(error) {
                    if(error.title === 'not found') {
                        $('.j-users').empty()
                            .append(error.message)
                            .removeClass('wait');
                    }
                });

                /** render frames */
                var framesTpl =  _.template( $('#frames_tpl').html() );
                $('.j-board').append( framesTpl({'nameUser': app.caller.full_name}));

                app.helpers.setFooterPosition();
            }
        });

        /**
         * INIT
         */
        QB.init(
            CONFIG.CREDENTIALS.appId,
            CONFIG.CREDENTIALS.authKey,
            CONFIG.CREDENTIALS.authSecret,
            CONFIG.CONFIG
        );

        app.router = new Router();
        Backbone.history.start();

        /**
         * JOIN
         */
        $(document).on('submit','.j-join', function() {
            var $form = $(this),
                data = _.object( _.map( $form.serializeArray(), function(item) {
                    return [item.name, item.value.trim()];
                }));

            $form.addClass('join-wait');

            app.helpers.join(data).then(function (user) {
                app.caller = user;

                QB.chat.connect({
                    jid: QB.chat.helpers.getUserJid( app.caller.id, CONFIG.CREDENTIALS.appId ),
                    password: 'webAppPass'
                }, function(err, res) {
                    if(err) {
                        QB.chat.disconnect();
                        app.router.navigate('join', { trigger: true });
                    } else {
                        $form.removeClass('join-wait');
                        $form.trigger('reset');
                        app.router.navigate('dashboard', { trigger: true });
                    }
                });
            }).catch(function(error) {
                console.error(error);
            });

            return false;
        });

        /**
         * DASHBOARD
         */
        /** REFRESH USERS */
        $(document).on('click', '.j-users__refresh', function() {
            var $btn = $(this),
                $usersCont = $('.j-users');

            $btn.prop('disabled', true);
            $usersCont.addClass('wait');

            app.helpers.renderUsers().then(function(usersHtml) {
                $usersCont.empty()
                    .append(usersHtml)
                    .removeClass('wait');

                $btn.prop('disabled', false);
            }, function(error) {
                if(error.title === 'not found') {
                    $('.j-users').empty()
                        .append(error.message)
                        .removeClass('wait');
                }

                $btn.prop('disabled', false);
            });

            app.callees = {};
        });

        /** Check / uncheck user (callee) */
        $(document).on('click', '.j-user', function() {
            var $user = $(this),
                user = {
                    id: +$.trim( $user.data('id') ),
                    name: $.trim( $user.data('name') )
                };

            if( $user.hasClass('active') ) {
                delete app.callees[user.id];
                $user.removeClass('active');
            } else {
                app.callees[user.id] = user.name;
                $user.addClass('active');
            }
        });

        /** Call / End of call */
        $(document).on('click', '.j-actions', function() {
            var $btn = $(this),
                videoElems = '',
                mediaParams = {
                    audio: true,
                    video: true,
                    options: {
                        muted: true,
                        mirror: true
                    },
                    elemId: 'localVideo'
                };
            /** Hangup */
            if ($btn.hasClass('hangup')) {
                if(!_.isEmpty(app.currentSession)) {
                    app.currentSession.stop({});
                    app.currentSession = {};

                    app.helpers.stateBoard.update({
                        title: 'tpl_default',
                        property: {
                            name:  app.caller.full_name
                        }
                    });

                    return false;
                }
            }

            /** Check internet connection */
            if(!window.navigator.onLine) {
                app.helpers.stateBoard.update({'title': 'no_internet', 'isError': 'qb-error'});
                return false;
            }
            /** Check callee */
            if(_.isEmpty(app.callees)) {
                $('#error_no_calles').modal();
                return false;
            }

            app.helpers.stateBoard.update('create_session');

            app.currentSession = QB.webrtc.createNewSession(Object.keys(app.callees), QB.webrtc.CallType.VIDEO);

            app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) {
                    var errorMsg = '';

                    app.currentSession.stop({});

                    app.helpers.stateBoard.update({
                        'title': 'tpl_device_not_found',
                        'isError': 'qb-error',
                        'property': {
                            'name': app.caller.full_name
                        }
                    });
                } else {

                    app.currentSession.call({}, function(error) {
                        if(error) {
                            console.warn(error.detail);
                        } else {
                            var compiled = _.template( $('#callee_video').html() );

                            app.helpers.stateBoard.update({'title': 'calling'});

                            document.getElementById(sounds.call).play();

                            Object.keys(app.callees).forEach(function(id, i, arr) {
                                videoElems += compiled({userID: id, name: app.callees[id] });
                            });

                            $('.j-callees').append(videoElems);

                            $btn.addClass('hangup');
                            app.helpers.setFooterPosition();
                        }
                  });
                }
            });
        });

        /** LOGOUT */
        $(document).on('click', '.j-logout', function() {
            app.user = null;
            app.users = [];

            QB.chat.disconnect();
            app.router.navigate('join', {'trigger': true});
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
         * - onCallStatsReport
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
        };

        QB.webrtc.onSessionCloseListener = function onSessionCloseListener(session){
            console.log('onSessionCloseListener: ' + session);

            document.getElementById(sounds.call).pause();
            document.getElementById(sounds.end).play();

            $('.j-actions').removeClass('hangup');
            $('.j-caller__ctrl').removeClass('active');
            $('.j-callees').empty();

            app.currentSession.detachMediaStream('main_video');
            app.currentSession.detachMediaStream('localVideo');
        };

        // QB.webrtc.onUserNotAnswerListener = function onUserNotAnswerListener(session, userId) {
        //     console.group('onUserNotAnswerListener.');
        //         console.log('UserId: ' + userId);
        //         console.log('Session: ' + session);
        //     console.groupEnd();
        //
        //     var userInfo = _.findWhere(QBUsers, {id: +userId}),
        //         currentUserInfo = _.findWhere(QBUsers, {id: app.currentSession.currentUserID});
        //
        //     /** It's for p2p call */
        //     if(session.opponentsIDs.length === 1) {
        //         app.helpers.stateBoard.update({
        //             'title': 'p2p_call_stop',
        //             property: {
        //                 name: app.caller
        //             }
        //         }
        //         ,
        //         {
        //           name: userInfo.full_name,
        //           currentName: currentUserInfo.full_name,
        //           reason: 'not answered'
        //         }
        //       );
        //   }
        //
        //   $('.j-callee_status_' + userId).text('No Answer');
        // };






    });


    //
    //     QB.webrtc.onUpdateCallListener = function onUpdateCallListener(session, userId, extension) {
    //       console.group('onUpdateCallListener.');
    //           console.log('UserId: ' + userId);
    //           console.log('Session: ' + session);
    //           console.log('Extension: ' + JSON.stringify(extension));
    //       console.groupEnd();
    //
    //       ui.changeFilter('#remote_video_' + userId, extension.filter);
    //       if (+(app.mainVideo) === userId) {
    //           ui.changeFilter('#main_video', extension.filter);
    //       }
    //     };
    //
    //     QB.webrtc.onCallListener = function onCallListener(session, extension) {
    //       console.group('onCallListener.');
    //           console.log('Session: ' + session);
    //           console.log('Extension: ' + JSON.stringify(extension));
    //       console.groupEnd();
    //
    //       /** close previous modal if his is exist */
    //       $(ui.modal.income_call).modal('hide');
    //
    //       var userInfo = _.findWhere(QBUsers, {id: session.initiatorID});
    //
    //       app.currentSession = session;
    //
    //       /** set name of caller */
    //       $('.j-ic_initiator').text( userInfo.full_name );
    //
    //       $(ui.modal.income_call).modal('show');
    //
    //       document.getElementById(ui.sounds.rington).play();
    //     };
    //
    //     QB.webrtc.onAcceptCallListener = function onAcceptCallListener(session, userId, extension) {
    //       console.group('onAcceptCallListener.');
    //           console.log('UserId: ' + userId);
    //           console.log('Session: ' + session);
    //           console.log('Extension: ' + JSON.stringify(extension));
    //       console.groupEnd();
    //
    //       var userInfo = _.findWhere(QBUsers, {id: userId}),
    //           filterName = $.trim( $(ui.filterClassName).val() );
    //
    //       document.getElementById(ui.sounds.call).pause();
    //
    //       app.currentSession.update({filter: filterName});
    //
    //       /** update list of callee who take call */
    //       takedCallCallee.push(userInfo);
    //
    //       if(app.currentSession.currentUserID === app.currentSession.initiatorID) {
    //           qbApp.MsgBoard.update('accept_call', {users: takedCallCallee});
    //       }
    //     };
    //
    //     QB.webrtc.onRejectCallListener = function onRejectCallListener(session, userId, extension) {
    //       console.group('onRejectCallListener.');
    //           console.log('UserId: ' + userId);
    //           console.log('Session: ' + session);
    //           console.log('Extension: ' + JSON.stringify(extension));
    //       console.groupEnd();
    //
    //       var userInfo = _.findWhere(QBUsers, {id: userId}),
    //           currentUserInfo = _.findWhere(QBUsers, {id: app.currentSession.currentUserID});
    //
    //       /** It's for p2p call */
    //       if(session.opponentsIDs.length === 1) {
    //           qbApp.MsgBoard.update(
    //             'p2p_call_stop',
    //             {
    //               name: userInfo.full_name,
    //               currentName: currentUserInfo.full_name,
    //               reason: 'rejected the call'
    //             }
    //           );
    //       }
    //
    //       /** It's for groups call */
    //       $('.j-callee_status_' + userId).text('Rejected');
    //     };
    //
    //     QB.webrtc.onStopCallListener = function onStopCallListener(session, userId, extension) {
    //       console.group('onStopCallListener.');
    //           console.log('UserId: ' + userId);
    //           console.log('Session: ' + session);
    //           console.log('Extension: ' + JSON.stringify(extension));
    //       console.groupEnd();
    //
    //       notifyIfUserLeaveCall(session, userId, 'hung up the call', 'Hung Up');
    //     };
    //
    //     QB.webrtc.onRemoteStreamListener = function onRemoteStreamListener(session, userID, stream) {
    //       console.group('onRemoteStreamListener.');
    //           console.log('userID: ' + userID);
    //           console.log('Session: ' + session);
    //       console.groupEnd();
    //       app.currentSession.peerConnections[userID].stream = stream;
    //
    //       app.currentSession.attachMediaStream('remote_video_' + userID, stream);
    //
    //       if( remoteStreamCounter === 0) {
    //           $('#remote_video_' + userID).click();
    //
    //           app.mainVideo = userID;
    //           ++remoteStreamCounter;
    //       }
    //
    //       if(!callTimer) {
    //           callTimer = setInterval( function(){ ui.updTimer.call(ui); }, 1000);
    //       }
    //     };
    //
    //     QB.webrtc.onSessionConnectionStateChangedListener = function onSessionConnectionStateChangedListener(session, userID, connectionState) {
    //       console.group('onSessionConnectionStateChangedListener.');
    //           console.log('UserID: ' + userID);
    //           console.log('Session: ' + session);
    //           console.log('Сonnection state: ' + connectionState);
    //       console.groupEnd();
    //
    //       var connectionStateName = _.invert(QB.webrtc.SessionConnectionState)[connectionState],
    //           $calleeStatus = $('.j-callee_status_' + userID),
    //           isCallEnded = false;
    //
    //       if(connectionState === QB.webrtc.SessionConnectionState.CONNECTING) {
    //           $calleeStatus.text(connectionStateName);
    //       }
    //
    //       if(connectionState === QB.webrtc.SessionConnectionState.CONNECTED) {
    //           ui.toggleRemoteVideoView(userID, 'show');
    //           $calleeStatus.text(connectionStateName);
    //       }
    //
    //       if(connectionState === QB.webrtc.SessionConnectionState.COMPLETED) {
    //           ui.toggleRemoteVideoView(userID, 'show');
    //           $calleeStatus.text('connected');
    //       }
    //
    //       if(connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED){
    //           ui.toggleRemoteVideoView(userID, 'hide');
    //           $calleeStatus.text('disconnected');
    //       }
    //
    //       if(connectionState === QB.webrtc.SessionConnectionState.CLOSED){
    //           ui.toggleRemoteVideoView(userID, 'clear');
    //           document.getElementById(ui.sounds.rington).pause();
    //
    //           if(app.mainVideo === userID) {
    //               $('#remote_video_' + userID).removeClass('active');
    //
    //               ui.changeFilter('#main_video', 'no');
    //               app.currentSession.detachMediaStream('main_video');
    //               app.mainVideo = 0;
    //           }
    //
    //           if( !_.isEmpty(app.currentSession) ) {
    //               if ( Object.keys(app.currentSession.peerConnections).length === 1 || userID === app.currentSession.initiatorID) {
    //                   $(ui.modal.income_call).modal('hide');
    //               }
    //           }
    //
    //           isCallEnded = _.every(app.currentSession.peerConnections, function(i) {
    //               return i.iceConnectionState === 'closed';
    //           });
    //
    //           /** remove filters */
    //           if( isCallEnded ) {
    //               ui.changeFilter('#localVideo', 'no');
    //               ui.changeFilter('#main_video', 'no');
    //               $(ui.filterClassName).val('no');
    //
    //               takedCallCallee = [];
    //           }
    //
    //           if (app.currentSession.currentUserID === app.currentSession.initiatorID && !isCallEnded) {
    //               /** get array if users without user who ends call */
    //               takedCallCallee = _.reject(takedCallCallee, function(num){ return num.id === +userID; });
    //
    //               qbApp.MsgBoard.update('accept_call', {users: takedCallCallee});
    //           }
    //
    //           if( _.isEmpty(app.currentSession) || isCallEnded ) {
    //               if(callTimer) {
    //                   $('#timer').addClass('hidden');
    //                   clearInterval(callTimer);
    //                   callTimer = null;
    //                   ui.callTime = 0;
    //
    //                   network = {};
    //               }
    //           }
    //       }
    //     };
    // });
}(window, window.QB, window.app, window.CONFIG,  jQuery, Backbone));
