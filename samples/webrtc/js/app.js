;(function(window, QB, app, CONFIG, $, Backbone) {
    'use strict';

    /** INIT QB */
    $(function() {
        var sounds = {
            'call': 'callingSignal',
            'end': 'endCallSignal',
            'rington': 'ringtoneSignal'
        };

        var ui = {
            'income_call': '#income_call',
            'filterSelect': '.j-filter',
            'sourceFilter': '.j-source'
        };

        var call = {
            callTime: 0,
            callTimer: null,
            updTimer: function() {
                this.callTime += 1000;

                $('#timer').removeClass('invisible')
                    .text( new Date(this.callTime).toUTCString().split(/ /)[4] );
              }
        };

        var remoteStreamCounter = 0,
            is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

        var Router = Backbone.Router.extend({
            'routes': {
                'join': 'join',
                'dashboard': 'dashboard',
                '*query': 'relocated'
            },
            'container': $('.page'),
            'relocated': function() {
                var path = app.caller ? 'dashboard' : 'join';

                app.router.navigate(path, {'trigger': true});
            },
            'join': function() {
                /** Before use WebRTC checking WebRTC is avaible */
                if (!QB.webrtc) {
                    alert('Error: ' + CONFIG.MESSAGES.webrtc_not_avaible);
                    return;
                }

                this.container
                    .removeClass('page-dashboard')
                    .addClass('page-join');

                app.helpers.setFooterPosition();

                app.caller = {};
                app.callees = {};
                app.calleesAnwered = [];
                app.users = [];
                app.videoMain = 0;
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

                /** render stateBoard */
                app.helpers.stateBoard = new app.helpers.StateBoard('.j-state_board', {
                    title: 'tpl_default',
                    property: {
                        'tag': app.caller.user_tags,
                        'name':  app.caller.full_name,
                    }
                });

                /** render users wrapper */
                $('.j-users_wrap').append( $('#users_tpl').html() );

                /** render users */
                app.helpers.renderUsers().then(function(res) {
                    $('.j-users').empty()
                        .append(res.usersHTML)
                        .removeClass('wait');

                    app.users = res.users;
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

                QB.webrtc.getMediaDevices('videoinput').then(function(devices) {
                    if(devices.length > 1) {
                        var $select = $(ui.sourceFilter);

                        for (var i = 0; i !== devices.length; ++i) {
                            var deviceInfo = devices[i],
                                option = document.createElement('option');

                            option.value = deviceInfo.deviceId;

                            if (deviceInfo.kind === 'videoinput') {
                                option.text = deviceInfo.label || 'Camera ' + (i + 1);
                                $select.append(option);
                            }
                        }

                        $select.removeClass('invisible');
                    }
                }).catch(function(error) {
                    console.warn('getMediaDevices', error);
                });

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
            CONFIG.APP_CONFIG
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
                        // $('#connect_err').modal();
                        // console.info(app.currentSession);
                        // QB.chat.disconnect();
                        //
                        // app.helpers.stateBoard.update({
                        //     'title': 'tpl_default',
                        //     'property': {
                        //         'tag': app.caller.user_tags,
                        //         'name':  app.caller.full_name,
                        //     }
                        // });
                        // console.info('STAT');
                        // app.currentSession.stop({});
                        // app.currentSession = {};

                        // app.helpers.setFooterPosition();
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

            app.helpers.renderUsers().then(function(res) {
                $usersCont.empty()
                    .append(res.usersHTML)
                    .removeClass('wait');

                app.users = res.users;

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

            app.helpers.setFooterPosition();
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
                $videoSourceFilter = $(ui.sourceFilter),
                videoElems = '',
                mediaParams = {
                    'audio': true,
                    'video': {
                        deviceId: $videoSourceFilter.val() ? $videoSourceFilter.val() : undefined
                    },
                    'options': {
                        'muted': true,
                        'mirror': true
                    },
                    'elemId': 'localVideo'
                };

            /** Hangup */
            if ($btn.hasClass('hangup')) {
                if(!_.isEmpty(app.currentSession)) {

                    app.currentSession.stop({});
                    app.currentSession = {};

                    app.helpers.stateBoard.update({
                        'title': 'tpl_default',
                        'property': {
                            'tag': app.caller.user_tags,
                            'name':  app.caller.full_name,
                        }
                    });

                    app.helpers.setFooterPosition();

                    return false;
                }
            } else {
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

                app.helpers.stateBoard.update({'title': 'create_session'});
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

                                $videoSourceFilter.attr('disabled', true);
                                $btn.addClass('hangup');
                                app.helpers.setFooterPosition();
                            }
                        });
                    }
                });
            }
        });

        /** DECLINE */
        $(document).on('click', '.j-decline', function() {
            if (!_.isEmpty(app.currentSession)) {
                app.currentSession.reject({});

                $(ui.income_call).modal('hide');
                document.getElementById(sounds.rington).pause();
            }
        });

        /** ACCEPT */
        $(document).on('click', '.j-accept', function() {
            var $videoSourceFilter = $(ui.sourceFilter),
                mediaParams = {
                    audio: true,
                    video: {
                        optional: [
                            {sourceId: $videoSourceFilter.val() ? $videoSourceFilter.val() : undefined}
                        ]
                    },
                    elemId: 'localVideo',
                    options: {
                        muted: true,
                        mirror: true
                    }
                },
                videoElems = '';

            $(ui.income_call).modal('hide');
            document.getElementById(sounds.rington).pause();

            app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) {
                    var errorMsg = '';

                    app.currentSession.stop({});

                    if(err && err.message) {
                        errorMsg += 'Error: ' + err.message;
                    } else {
                        errorMsg += 'tpl_device_not_found';
                    }

                    app.helpers.stateBoard.update({
                        'title': errorMsg,
                        'isError': 'qb-error'
                    });
                } else {
                    var opponents = [app.currentSession.initiatorID],
                        compiled = _.template( $('#callee_video').html() );

                    $('.j-actions').addClass('hangup');
                    $(ui.sourceFilter).attr('disabled', true);

                    /** get all opponents */
                    app.currentSession.opponentsIDs.forEach(function(userID, i, arr) {
                        if(userID != app.currentSession.currentUserID){
                            opponents.push(userID);
                        }
                    });

                    opponents.forEach(function(userID, i, arr) {
                        var peerState = app.currentSession.connectionStateForUser(userID),
                            userInfo = _.findWhere(app.users, {'id': +userID});

                        if( (document.getElementById('remote_video_' + userID) === null) ) {
                            videoElems += compiled({userID: userID, name: userInfo.full_name});

                            if(peerState === QB.webrtc.PeerConnectionState.CLOSED){
                                app.helpers.toggleRemoteVideoView( userID, 'clear');
                            }
                        }
                    });

                    $('.j-callees').append(videoElems);
                    app.helpers.stateBoard.update({
                        'title': 'tpl_during_call',
                        'property': {
                            'name': app.caller.full_name
                        }
                    });
                    app.helpers.setFooterPosition();
                    app.currentSession.accept({});
                }
            });
        });

        /** CHANGE FILTER */
        $(document).on('change', ui.filterSelect, function() {
            var filterName = $.trim( $(this).val() );

            app.helpers.changeFilter('#localVideo', filterName);

            if(!_.isEmpty(app.currentSession)) {
                app.currentSession.update({'filter': filterName});
            }
        });

        $(document).on('click', '.j-callees__callee__video', function() {
            var $that = $(this),
                userId = +($(this).data('user')),
                classesName = [],
                activeClass = [];

            if( app.currentSession.peerConnections[userId].stream && !_.isEmpty( $that.attr('src')) ) {
                if( $that.hasClass('active') ) {
                    $that.removeClass('active');

                    app.currentSession.detachMediaStream('main_video');
                    app.helpers.changeFilter('#main_video', 'no');
                    app.mainVideo = 0;
                    remoteStreamCounter = 0;
                } else {
                    $('.j-callees__callee_video').removeClass('active');
                    $that.addClass('active');

                    app.helpers.changeFilter('#main_video', 'no');

                    activeClass = _.intersection($that.attr('class').split(/\s+/), app.filter.names.split(/\s+/) );

                    /** set filter to main video if exist */
                    if(activeClass.length) {
                        app.helpers.changeFilter('#main_video', activeClass[0]);
                    }
                    app.currentSession.attachMediaStream('main_video', app.currentSession.peerConnections[userId].stream);
                    app.mainVideo = userId;
                }
            }
        });

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

        /** LOGOUT */
        $(document).on('click', '.j-logout', function() {
            QB.users.delete(app.caller.id, function(err, user){
                if (user) {
                    app.caller = {};
                    app.users = [];

                    QB.chat.disconnect();
                    app.router.navigate('join', {'trigger': true});
                    app.helpers.setFooterPosition();
                } else  {
                    console.error('Logout failed:', err);
                }
            });
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

        QB.webrtc.onCallStatsReport = function onCallStatsReport(session, userId, stats) {
            console.group('onCallStatsReport');
                console.log('userId: ', userId);
                // console.log('Stats: ', stats);
            console.groupEnd();

            /**
             * Hack for Firefox
             * (https://bugzilla.mozilla.org/show_bug.cgi?id=852665)
             */
            if(is_firefox) {
                var inboundrtp = _.findWhere(stats, {type: 'inboundrtp'});

                if(!inboundrtp || !app.helpers.isBytesReceivedChanges(userId, inboundrtp)) {
                    console.warn('This is Firefox and user ' + userId + ' has lost his connection.');

                    if(!_.isEmpty(app.currentSession)) {
                        app.currentSession.closeConnection(userId);
                        app.helpers.notifyIfUserLeaveCall(session, userId, 'disconnected', 'Disconnected');
                    }
                }
            }
        };

        QB.webrtc.onSessionCloseListener = function onSessionCloseListener(session){
            console.log('onSessionCloseListener: ', session);

            document.getElementById(sounds.call).pause();
            document.getElementById(sounds.end).play();

            $('.j-actions').removeClass('hangup');
            $('.j-caller__ctrl').removeClass('active');
            $(ui.sourceFilter).attr('disabled', false);
            $('.j-callees').empty();

            app.currentSession.detachMediaStream('main_video');
            app.currentSession.detachMediaStream('localVideo');
            remoteStreamCounter = 0;

            if(session.opponentsIDs.length > 1) {
                app.helpers.stateBoard.update({
                    'title': 'tpl_call_stop',
                    'property': {
                        'name': app.caller.full_name
                    }
                });
            }
        };

        QB.webrtc.onUserNotAnswerListener = function onUserNotAnswerListener(session, userId) {
            console.group('onUserNotAnswerListener.');
                console.log('UserId: ', userId);
                console.log('Session: ', session);
            console.groupEnd();

            var opponent = _.findWhere(app.users, {'id': +userId});

            /** It's for p2p call */
            if(session.opponentsIDs.length === 1) {
                app.helpers.stateBoard.update({
                    'title': 'p2p_call_stop',
                    'property': {
                        'name': opponent.full_name,
                        'currentName': app.caller.full_name,
                        'reason': 'not answered'
                    }
                });
            } else {
                $('.j-callee_status_' + userId).text('No Answer');
            }
        };

        QB.webrtc.onCallListener = function onCallListener(session, extension) {
            console.group('onCallListener.');
                console.log('Session: ', session);
                console.log('Extension: ', extension);
            console.groupEnd();

            var initiator = _.findWhere(app.users, {id: session.initiatorID});
            app.currentSession = session;

            /** close previous modal */
            $(ui.income_call).modal('hide');
            /**
             * set name of caller
             * TODO: what if user doesn't sync all users
             */
            $('.j-ic_initiator').text( initiator.full_name ? initiator.full_name : 'Unknown' );
            $(ui.income_call).modal('show');
            document.getElementById(sounds.rington).play();
        };

        QB.webrtc.onRejectCallListener = function onRejectCallListener(session, userId, extension) {
            console.group('onRejectCallListener.');
                console.log('UserId: ' + userId);
                console.log('Session: ' + session);
                console.log('Extension: ' + JSON.stringify(extension));
            console.groupEnd();

            var user = _.findWhere(app.users, {'id': +userId}),
                userCurrent = _.findWhere(app.users, {'id': +session.currentUserID});

            /** It's for p2p call */
            if(session.opponentsIDs.length === 1) {
                app.helpers.stateBoard.update({
                    'title': 'p2p_call_stop',
                    'property': {
                        'name': user.full_name,
                        'currentName': userCurrent.full_name,
                        'reason': 'rejected the call'
                    }
                });
            } else {
                $('.j-callee_status_' + userId).text('Rejected');
            }
        };

        QB.webrtc.onStopCallListener = function onStopCallListener(session, userId, extension) {
            console.group('onStopCallListener.');
                console.log('UserId: ', userId);
                console.log('Session: ', session);
                console.log('Extension: ', extension);
            console.groupEnd();

            app.helpers.notifyIfUserLeaveCall(session, userId, 'hung up the call', 'Hung Up');
        };

        QB.webrtc.onAcceptCallListener = function onAcceptCallListener(session, userId, extension) {
            console.group('onAcceptCallListener.');
                console.log('UserId: ', userId);
                console.log('Session: ', session);
                console.log('Extension: ', extension);
            console.groupEnd();

            var userInfo = _.findWhere(app.users, {'id': +userId}),
                filterName = $.trim( $(ui.filterSelect).val() );

            document.getElementById(sounds.call).pause();
            app.currentSession.update({'filter': filterName});

            /** update list of callee who take call */
            app.calleesAnwered.push(userInfo);

            if(app.currentSession.currentUserID === app.currentSession.initiatorID) {
                app.helpers.stateBoard.update({
                    'title': 'tpl_accept_call',
                    'property': {
                        'users': app.calleesAnwered
                    }
                });
            }
        };

        QB.webrtc.onRemoteStreamListener = function onRemoteStreamListener(session, userId, stream) {
            console.group('onRemoteStreamListener.');
                console.log('userId: ', userId);
                console.log('Session: ', session);
            console.groupEnd();

            app.currentSession.peerConnections[userId].stream = stream;
            app.currentSession.attachMediaStream('remote_video_' + userId, stream);

            if( remoteStreamCounter === 0) {
                $('#remote_video_' + userId).click();

                app.mainVideo = userId;
                ++remoteStreamCounter;
            }

            if(!call.callTimer) {
                call.callTimer = setInterval( function(){ call.updTimer.call(call); }, 1000);
            }
        };

        QB.webrtc.onUpdateCallListener = function onUpdateCallListener(session, userId, extension) {
            console.group('onUpdateCallListener.');
                console.log('UserId: ' + userId);
                console.log('Session: ' + session);
                console.log('Extension: ' + JSON.stringify(extension));
            console.groupEnd();

            app.helpers.changeFilter('#remote_video_' + userId, extension.filter);

            if (+(app.mainVideo) === userId) {
                app.helpers.changeFilter('#main_video', extension.filter);
            }
        };

        QB.webrtc.onSessionConnectionStateChangedListener = function onSessionConnectionStateChangedListener(session, userId, connectionState) {
            console.group('onSessionConnectionStateChangedListener.');
                console.log('UserID: ', userId);
                console.log('Session: ', session);
                console.log('Сonnection state: ', connectionState);
            console.groupEnd();

           var connectionStateName = _.invert(QB.webrtc.SessionConnectionState)[connectionState],
               $calleeStatus = $('.j-callee_status_' + userId),
               isCallEnded = false;

           if(connectionState === QB.webrtc.SessionConnectionState.CONNECTING) {
               $calleeStatus.text(connectionStateName);
           }

           if(connectionState === QB.webrtc.SessionConnectionState.CONNECTED) {
               app.helpers.toggleRemoteVideoView(userId, 'show');
               $calleeStatus.text(connectionStateName);
           }

           if(connectionState === QB.webrtc.SessionConnectionState.COMPLETED) {
               app.helpers.toggleRemoteVideoView(userId, 'show');
               $calleeStatus.text('connected');
           }

           if(connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED){
               app.helpers.toggleRemoteVideoView(userId, 'hide');
               $calleeStatus.text('disconnected');
           }

           if(connectionState === QB.webrtc.SessionConnectionState.CLOSED){
               app.helpers.toggleRemoteVideoView(userId, 'clear');
               document.getElementById(sounds.rington).pause();

               if(app.mainVideo === userId) {
                   $('#remote_video_' + userId).removeClass('active');

                   app.helpers.changeFilter('#main_video', 'no');
                   app.mainVideo = 0;
               }

               if( !_.isEmpty(app.currentSession) ) {
                   if ( Object.keys(app.currentSession.peerConnections).length === 1 || userId === app.currentSession.initiatorID) {
                       $(ui.income_call).modal('hide');
                   }
               }

               isCallEnded = _.every(app.currentSession.peerConnections, function(i) {
                   return i.iceConnectionState === 'closed';
               });

               /** remove filters */
               if( isCallEnded ) {
                   app.helpers.changeFilter('#localVideo', 'no');
                   app.helpers.changeFilter('#main_video', 'no');
                   $(ui.filterSelect).val('no');

                   app.calleesAnwered = [];
               }

               if (app.currentSession.currentUserID === app.currentSession.initiatorID && !isCallEnded) {
                   /** get array if users without user who ends call */
                   app.calleesAnwered = _.reject(app.calleesAnwered, function(num){ return num.id === +userId; });

                   app.helpers.stateBoard.update({
                       'title': 'tpl_accept_call',
                       'property': {
                           'users': app.calleesAnwered
                       }
                   });
               }

                if( _.isEmpty(app.currentSession) || isCallEnded ) {
                    if(call.callTimer) {
                        $('#timer').addClass('hidden');
                        clearInterval(call.callTimer);
                        call.callTimer = null;
                        call.callTime = 0;
                        app.helpers.network = {};
                    }
                }
           }
         };
    });
}(window, window.QB, window.app, window.CONFIG,  jQuery, Backbone));
