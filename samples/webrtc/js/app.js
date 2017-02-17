;(function(window, QB, app, CONFIG, $, Backbone) {
    'use strict';

    $(function() {
        var sounds = {
            'call': 'callingSignal',
            'end': 'endCallSignal',
            'rington': 'ringtoneSignal'
        };

        var recorder = null;
        var recorderOpts = {
                callbacks: {
                    onStart: function onStartRecord() {
                        console.log('[QB Recorder] onStartRecording');
                        $('.j-record').addClass('active');
                    },
                    onStop: function(blob) {
                        console.log('[QB Recorder] onStopRecording');
                        $('.j-record').removeClass('active');

                        var down = confirm('Do you want to download video?');

                        if(down) {
                            recorder.download('QB_WEBrtc_sample' + Date.now(), blob);
                        }

                        recorder = null;
                    },
                    onError: function(error) {
                        console.error('Recorder error', error);
                    }
                }
            };
        var isAudio = false;
        var ui = {
            'income_call': '#income_call',
            'filterSelect': '.j-filter',
            'sourceFilter': '.j-source',
            'insertOccupants': function() {
                var $occupantsCont = $('.j-users');

                function cb($cont, res) {
                    $cont.empty()
                        .append(res)
                        .removeClass('wait');
                }

                return new Promise(function(resolve, reject) {
                    $occupantsCont.addClass('wait');

                    app.helpers.renderUsers().then(function(res) {
                        cb($occupantsCont, res.usersHTML);
                        resolve(res.users);
                    }, function(error) {
                        cb($occupantsCont, error.message);
                        reject('Not found users by tag');
                    });
                });
            }
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

        var remoteStreamCounter = 0;

        function closeConn(userId) {
            if(recorder) {
                recorder.stop()
            }

            app.helpers.notifyIfUserLeaveCall(app.currentSession, userId, 'disconnected', 'Disconnected');
            app.currentSession.closeConnection(userId);
        }

        var ffHack = {
            waitingReconnectTimer: null,
            waitingReconnectTimeoutCallback: function(userId, cb) {
                clearTimeout(this.waitingReconnectTimer);
                cb(userId);
            },
            isFirefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        };

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

                if (!_.isEmpty(app.caller)) {
                    app.router.navigate('dashboard');
                    return false;
                }

                this.container
                    .removeClass('page-dashboard')
                    .addClass('page-join');

                app.helpers.setFooterPosition();

                app.caller = {};
                app.callees = {};
                app.calleesAnwered = [];
                app.calleesRejected = [];
                app.users = [];
            },
            'dashboard': function() {
                if(_.isEmpty(app.caller)) {
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
                ui.insertOccupants().then(function(users) {
                    app.users = users;
                }, function(err) {
                    console.warn(err);
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
        var CREDS = app.helpers.getQueryVar('creds') === 'test' ? CONFIG.CREDENTIALS.test : CONFIG.CREDENTIALS.prod;

        QB.init(
            CREDS.appId,
            CREDS.authKey,
            CREDS.authSecret,
            CONFIG.APP_CONFIG
        );

        /* Insert version + versiobBuild to sample for QA */
        $('.j-version').text('v.' + QB.version + '.' + QB.buildNumber);

        var statesPeerConn = _.invert(QB.webrtc.PeerConnectionState);

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

            if(localStorage.getItem('isAuth')) {
                $('#already_auth').modal();
                return false;
            }

            $form.addClass('join-wait');

            app.helpers.join(data).then(function (user) {
                app.caller = user;

                QB.chat.connect({
                    jid: QB.chat.helpers.getUserJid( app.caller.id, CREDS.appId ),
                    password: 'webAppPass'
                }, function(err, res) {
                    if(err) {
                        if(!_.isEmpty(app.currentSession)) {
                            app.currentSession.stop({});
                            app.currentSession = {};
                        }

                        app.helpers.changeFilter('#localVideo', 'no');
                        app.helpers.changeFilter('#main_video', 'no');
                        app.mainVideo = 0;

                        $(ui.filterSelect).val('no');
                        app.calleesAnwered = [];
                        app.calleesRejected = [];
                        if(call.callTimer) {
                            $('#timer').addClass('invisible');
                            clearInterval(call.callTimer);
                            call.callTimer = null;
                            call.callTime = 0;
                            app.helpers.network = {};
                        }
                    } else {
                        $form.removeClass('join-wait');
                        $form.trigger('reset');
                        localStorage.setItem('isAuth', true);
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
            var $btn = $(this);

            app.callees = {};
            $btn.prop('disabled', true);

            ui.insertOccupants().then(function(users) {
                app.users = users;

                $btn.prop('disabled', false);
                app.helpers.setFooterPosition();
            }, function() {
                $btn.prop('disabled', false);
                app.helpers.setFooterPosition();
            });
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

                    if(recorder) {
                        recorder.stop();
                    }

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

                isAudio = $btn.data('call') === 'audio';

                app.currentSession = QB.webrtc.createNewSession(Object.keys(app.callees), isAudio ? QB.webrtc.CallType.AUDIO : QB.webrtc.CallType.VIDEO);

                if(isAudio) {
                    mediaParams = {
                        audio: true,
                        video: false
                    };
                    document.querySelector('.j-actions[data-call="video"]').setAttribute('hidden', true);
                    document.querySelector('.j-caller__ctrl').setAttribute('hidden', true);
                } else {
                    document.querySelector('.j-actions[data-call="audio"]').setAttribute('hidden', true);
                }

                app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                    if (err || !stream.getAudioTracks().length || (isAudio ? false : !stream.getVideoTracks().length)) {
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
                        var callParameters = {};

                        if(isAudio){
                            callParameters.callType = 2
                        }

                        // Call to users
                        //
                        var pushRecipients = [];
                        app.currentSession.call({}, function(error) {
                            if(error) {
                                console.warn(error.detail);
                            } else {
                                var compiled = _.template( $('#callee_video').html() );

                                app.helpers.stateBoard.update({'title': 'calling'});

                                document.getElementById(sounds.call).play();

                                Object.keys(app.callees).forEach(function(id, i, arr) {
                                    videoElems += compiled({
                                        'userID': id,
                                        'name': app.callees[id],
                                        'state': 'connecting'
                                    });
                                    pushRecipients.push(id);
                                });

                                $('.j-callees').append(videoElems);

                                $videoSourceFilter.attr('disabled', true);
                                $btn.addClass('hangup');
                                app.helpers.setFooterPosition();
                            }
                        });

                        // and also send push notification about incoming call
                        // (corrently only iOS/Android users will receive it)
                        //
                        var params = {
                          notification_type: 'push',
                          user: {ids: pushRecipients},
                          environment: 'development', // environment, can be 'production' as well.
                          message: QB.pushnotifications.base64Encode(app.caller.full_name + ' is calling you')
                        };
                        //
                        QB.pushnotifications.events.create(params, function(err, response) {
                          if (err) {
                            console.log(err);
                          } else {
                            // success
                            console.log("Push Notification is sent.");
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
            isAudio = app.currentSession.callType === QB.webrtc.CallType.AUDIO;

            var $videoSourceFilter = $(ui.sourceFilter),
                mediaParams;

            if(isAudio){
                mediaParams = {
                    audio: true,
                    video: false
                };
                document.querySelector('.j-actions[data-call="video"]').setAttribute('hidden', true);
                document.querySelector('.j-caller__ctrl').setAttribute('hidden', true);
            } else {
                mediaParams = {
                    audio: true,
                    video: {
                        deviceId: $videoSourceFilter.val() ? $videoSourceFilter.val() : undefined
                    },
                    elemId: 'localVideo',
                    options: {
                        muted: true,
                        mirror: true
                    }
                };

                document.querySelector('.j-actions[data-call="audio"]').setAttribute('hidden', true);
            }

            var videoElems = '';

            $(ui.income_call).modal('hide');
            document.getElementById(sounds.rington).pause();

            app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                if (err || !stream.getAudioTracks().length || (isAudio ? false : !stream.getVideoTracks().length)) {
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
                            videoElems += compiled({
                                'userID': userID,
                                'name': userInfo ? userInfo.full_name : 'userID ' + userID,
                                'state': app.helpers.getConStateName(peerState)
                            });

                            if(peerState === QB.webrtc.PeerConnectionState.CLOSED){
                                app.helpers.toggleRemoteVideoView(userID, 'clear');
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

        /** Video recording */
        $(document).on('click', '.j-record', function() {
            var $btn = $(this),
                isActive = $btn.hasClass('active');

            if(_.isEmpty(app.currentSession)) {
                return false;
            } else if(qbMediaRecorder.isAvailable()) {
                if(!isActive){
                    var connections = app.currentSession.peerConnections,
                        connection = connections[app.mainVideo],
                        connectionsCount = Object.keys(connections).length;

                    if (!connection || connectionsCount !== 1){
                        return false;
                    }

                    recorder = new qbMediaRecorder(connection.stream, recorderOpts);
                    recorder.start();
                } else {
                    recorder.stop();
                }
            }
        });

        /** LOGOUT */
        $(document).on('click', '.j-logout', function() {
            QB.users.delete(app.caller.id, function(err, user){
                if (!user) {
                    console.error('Can\'t delete user by id: '+app.caller.id+' ', err);
                }

                app.caller = {};
                app.users = [];

                QB.chat.disconnect();
                localStorage.removeItem('isAuth');
                app.router.navigate('join', {'trigger': true});
                app.helpers.setFooterPosition();
            });
        });

        /** Close tab or browser */
        $( window ).unload(function() {
            localStorage.removeItem('isAuth');
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
         * - onCallListener
         * - onCallStatsReport
         * - onUpdateCallListener
         *
         * - onAcceptCallListener
         * - onRejectCallListener
         * - onUserNotAnswerListener
         *
         * - onRemoteStreamListener
         *
         * - onStopCallListener
         * - onSessionCloseListener
         * - onSessionConnectionStateChangedListener
         */

        QB.chat.onDisconnectedListener = function() {
            console.log('onDisconnectedListener.');
        };

        QB.webrtc.onCallStatsReport = function onCallStatsReport(session, userId, stats, error) {
            console.group('onCallStatsReport');
                console.log('userId: ', userId);
                console.log('session: ', session);
                console.log('stats: ', stats);
            console.groupEnd();

            /**
             * Hack for Firefox
             * (https://bugzilla.mozilla.org/show_bug.cgi?id=852665)
             */
            if(ffHack.isFirefox) {
                var inboundrtp = _.findWhere(stats, {'type': 'inboundrtp'}),
                    webrtcConf = CONFIG.APP_CONFIG.webrtc,
                    timeout = (webrtcConf.disconnectTimeInterval - webrtcConf.statsReportTimeInterval) * 1000;

                if(!app.helpers.isBytesReceivedChanges(userId, inboundrtp)) {
                    console.warn('This is Firefox and user ' + userId + ' has lost his connection.');

                    if(recorder) {
                        recorder.pause();
                    }

                    app.helpers.toggleRemoteVideoView(userId, 'hide');
                    $('.j-callee_status_' + userId).text('disconnected');

                    if(!_.isEmpty(app.currentSession) && !ffHack.waitingReconnectTimer) {
                        ffHack.waitingReconnectTimer = setTimeout(ffHack.waitingReconnectTimeoutCallback, timeout, userId, closeConn);
                    }
                } else {
                    if(recorder) {
                        recorder.resume();
                    }

                    if(ffHack.waitingReconnectTimer) {
                        clearTimeout(ffHack.waitingReconnectTimer);
                        ffHack.waitingReconnectTimer = null;
                    }

                    app.helpers.toggleRemoteVideoView(userId, 'show');
                    $('.j-callee_status_' + userId).text('connected');
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

            if(!ffHack.isFirefox && recorder) {
                recorder.stop();
            }

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
            } else {
                app.helpers.stateBoard.update({
                    title: 'tpl_default',
                    property: {
                        'tag': app.caller.user_tags,
                        'name':  app.caller.full_name,
                    }
                });
            }

            if(ffHack.isFirefox) {
                if(call.callTimer) {
                    $('#timer').addClass('invisible');
                    clearInterval(call.callTimer);
                    call.callTimer = null;
                    call.callTime = 0;
                    app.helpers.network = {};
                }
            }

            if(document.querySelector('.j-actions[hidden]')){
                document.querySelector('.j-actions[hidden]').removeAttribute('hidden');
            }
            if(document.querySelector('.j-caller__ctrl')){
                document.querySelector('.j-caller__ctrl').removeAttribute('hidden');
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

            app.currentSession = session;

            ui.insertOccupants().then(function(users) {
                app.users = users;
                var initiator = _.findWhere(app.users, {id: session.initiatorID});
                app.callees = {};
                /** close previous modal */
                $(ui.income_call).modal('hide');

                $('.j-ic_initiator').text(initiator.full_name);

                // check the current session state
                if(app.currentSession.state !== QB.webrtc.SessionConnectionState.CLOSED){
                    $(ui.income_call).modal('show');
                    document.getElementById(sounds.rington).play();

                }
            });
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
                var userInfo = _.findWhere(app.users, {'id': +userId});
                app.calleesRejected.push(userInfo);
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

            if(recorder) {
                recorder.stop();
            }
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
                    'title': 'tpl_call_status',
                    'property': {
                        'users': app.helpers.getUsersStatus()
                    }
                });
            }
        };

        QB.webrtc.onRemoteStreamListener = function onRemoteStreamListener(session, userId, stream) {
            console.group('onRemoteStreamListener.');
                console.log('userId: ', userId);
                console.log('Session: ', session);
                console.log('Stream: ', stream);
            console.groupEnd();

            var state = app.currentSession.connectionStateForUser(userId),
                peerConnList = QB.webrtc.PeerConnectionState;

            if(state === peerConnList.DISCONNECTED || state === peerConnList.FAILED || state === peerConnList.CLOSED) {
                return false;
            }

            app.currentSession.peerConnections[userId].stream = stream;

            console.info('onRemoteStreamListener add video to the video element', stream);

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
                console.log('UserID:', userId);
                console.log('Session:', session);
                console.log('Сonnection state:', connectionState, statesPeerConn[connectionState]);
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

            if(connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED) {
                app.helpers.toggleRemoteVideoView(userId, 'hide');
                $calleeStatus.text('disconnected');
            }

            if(connectionState === QB.webrtc.SessionConnectionState.CLOSED){
                app.helpers.toggleRemoteVideoView(userId, 'clear');

                if(app.mainVideo === userId) {
                    $('#remote_video_' + userId).removeClass('active');

                    app.helpers.changeFilter('#main_video', 'no');
                    app.mainVideo = 0;
                }

                if( !_.isEmpty(app.currentSession) ) {
                    if ( Object.keys(app.currentSession.peerConnections).length === 1 || userId === app.currentSession.initiatorID) {
                        $(ui.income_call).modal('hide');
                        document.getElementById(sounds.rington).pause();
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
                    app.calleesRejected = [];
                    app.network[userId] = null;
                }

                if (app.currentSession.currentUserID === app.currentSession.initiatorID && !isCallEnded) {
                    var userInfo = _.findWhere(app.users, {'id': +userId});

                    /** get array if users without user who ends call */
                    app.calleesAnwered = _.reject(app.calleesAnwered, function(num){ return num.id === +userId; });
                    app.calleesRejected.push(userInfo);

                    app.helpers.stateBoard.update({
                       'title': 'tpl_call_status',
                       'property': {
                           'users': app.helpers.getUsersStatus()
                        }
                    });
                }

                if( _.isEmpty(app.currentSession) || isCallEnded ) {
                    if(call.callTimer) {
                        $('#timer').addClass('invisible');
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
