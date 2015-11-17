;(function(window, $) {
    'use strict';
    /** when DOM is ready */
    $(function() {
        var ui = {
                $usersTitle: $('.j-users__title'),
                $usersList: $('.j-users__list'),
                $cl: $('.j-console'),

                $panel: $('.j-pl'),
                $callees: $('.j-callees'),

                $btnCall: $('.j-call'),
                $btnHangup: $('.j-hangup'),

                $ctrlBtn: $('.j-caller__ctrl'),

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
                /**
                 * [updateMsg update massage for user]
                 * @param  {[string]} msg_name [key for MESSAGES object / name(id) of template]
                 * @param  {[object]} obj      [additional paramets for compiled template]
                 */
                updateMsg: function(params) {
                    var msg = '';

                    if(MESSAGES[params.msg]) {
                        msg = MESSAGES[params.msg];
                    } else {
                        msg = _.template( $('#' + params.msg).html() )(params.obj);
                    }

                    this.$cl
                        .empty()
                        .append(msg);
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
                }
            },
            app = {
                caller: {},
                callees: {},
                currentSession: {},
                mainVideo: 0
            },
            remoteStreamCounter = 0;

        function initializeUI() {
            ui.createUsers(QBUsers, ui.$usersList);

            ui.updateMsg({msg: 'login'});
            ui.$usersTitle.text(MESSAGES.title_login);
        }

        /**
         * INITIALIZE
         */
        ui.setPositionFooter();

        initializeUI();

        QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, CONFIG);

        /**
         * EVENTS
         */
        /** Choose caller */
        $(document).on('click', '.j-user', function() {
            var $el = $(this),
                usersWithoutCaller = [],
                user = {},
                classNameCheckedUser = 'users__user-active';

            /** if app.caller is not exist create caller, if no - add callees */
            if( _.isEmpty(app.caller) ) {
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

                ui.updateMsg( {msg: 'create_session'} );
                ui.updateMsg( {msg: 'connect'} );

                QB.chat.connect({
                    jid: QB.chat.helpers.getUserJid( app.caller.id, QBApp.appId ),
                    password: app.caller.password
                }, function(err, res) {
                    if(err !== null) {
                        ui.updateMsg( {msg: 'connect_error'} );
                    } else {
                        ui.createUsers(usersWithoutCaller, ui.$usersList);

                        ui.$usersTitle.text(MESSAGES.title_callee);
                        ui.updateMsg( {msg: 'login_tpl', obj: {name: app.caller.full_name}} );

                        ui.$panel.removeClass('hidden');
                        ui.setPositionFooter();
                        ui.togglePreloadMain('hide');
                    }
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

            if ( _.isEmpty(app.callees) ) {
                $('#error_no_calles').modal();
            } else {
                app.currentSession = QB.webrtc.createNewSession(Object.keys(app.callees), QB.webrtc.CallType.VIDEO);

                app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                    if (err) {
                        ui.updateMsg({msg: 'device_not_found', obj: {name: app.caller.full_name}});
                    } else {
                        var compiled = _.template( $('#callee_video').html() );

                        ui.updateMsg({msg: 'calling'});
                        document.getElementById(ui.sounds.call).play();

                        /** create video elements for callees */
                        Object.keys(app.callees).forEach(function(userID, i, arr) {
                            videoElems += compiled({userID: userID, name: app.callees[userID] });
                        });

                        ui.$callees.append(videoElems);

                        ui.hideCallBtn();

                        app.currentSession.call({});
                    }
                });
            }
        });

        /** Hangup */
        $(document).on('click', '.j-hangup', function() {
            if(!_.isEmpty(app.currentSession)) {
                app.currentSession.stop({});
                app.currentSession = {};
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

            ui.hideCallBtn();

            document.getElementById(ui.sounds.rington).pause();

            app.currentSession.getUserMedia(mediaParams, function(err, stream) {
                if (err) {
                    ui.updateMsg({msg: 'device_not_found', obj: {name: app.caller.full_name}});
                } else {
                    var opponents = [app.currentSession.initiatorID],
                        compiled = _.template( $('#callee_video').html() );

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

                    app.currentSession.accept({});
                }
            });
        });

        /** Reject */
        $(document).on('click', '.j-decline', function() {
            $(ui.modal.income_call).modal('hide');
            document.getElementById(ui.sounds.rington).pause();

            if (!_.isEmpty(app.currentSession)) {
                app.currentSession.reject({});
                app.currentSession = {};
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
                userID = +($(this).data('user'));

            if( app.currentSession.peerConnections[userID].stream ) {
                if( $that.hasClass('active') ) {
                    $that.removeClass('active');
                
                    app.currentSession.detachMediaStream('main_video');
                    app.mainVideo = 0;
                } else {
                    $('.j-callees__callee_video').removeClass('active');
                    $that.addClass('active');

                    app.currentSession.attachMediaStream('main_video', app.currentSession.peerConnections[userID].stream);
                    app.mainVideo = userID;
                }
            }
        });

        /** Change filter for filter */
        $(document).on('change', '.j-filter', function() {
            var val = $.trim( $(this).val() ),
                $video = $('.fw-video');

            $video.removeClass('aden reyes perpetua inkwell toaster walden hudson gingham mayfair lofi xpro2 _1977 brooklyn');

            if(val !== 'no') {
                $video.addClass( val );
            }
        });

        $(window).on('resize', function() {
            ui.setPositionFooter();
        });

        /** Before use WebRTC checking is WebRTC is avaible */
        if (!QB.webrtc) {
            ui.updateMsg( {msg: 'webrtc_not_avaible'} );
        } else {
            /**
             * QB Event listener:
             * chat:
             * - onDisconnectedListener
             * webrtc:
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

                app.caller = {};
                app.callees = [];
                app.mainVideo = 0;
                remoteStreamCounter = 0;

                initializeUI();
                ui.$panel.addClass('hidden');

                /** delete callee video elements */
                $('.j-callee').remove();

                ui.setPositionFooter();
            };

            QB.webrtc.onSessionCloseListener = function(session){
                console.log('onSessionCloseListener: ' + session);

                /** pause play call sound */
                document.getElementById(ui.sounds.call).pause();
                document.getElementById(ui.sounds.end).play();

                ui.showCallBtn();

                ui.updateMsg({msg: 'call_stop', obj: {name: app.caller.full_name}});

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

            QB.webrtc.onUserNotAnswerListener = function(session, userId) {
                console.group('onUserNotAnswerListener.');
                    console.log('UserId: ' + userId);
                    console.log('Session: ' + session);
                console.groupEnd();

                $('.j-callee_status_' + userId).text('User not answer');
            };

            QB.webrtc.onUpdateCallListener = function(session, userId, extension) {
                console.group('onUpdateCallListener.');
                    console.log('UserId: ' + userId);
                    console.log('Session: ' + session);
                    console.log('Extension: ' + extension);
                console.groupEnd();
            };

            QB.webrtc.onCallListener = function(session, extension) {
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

                $(ui.modal.income_call).modal({
                    backdrop: 'static',
                    keyboard: false
                });

                document.getElementById(ui.sounds.rington).play();
            };

            QB.webrtc.onAcceptCallListener = function(session, userId, extension) {
                console.group('onAcceptCallListener.');
                    console.log('UserId: ' + userId);
                    console.log('Session: ' + session);
                    console.log('Extension: ' + JSON.stringify(extension));
                console.groupEnd();

              document.getElementById(ui.sounds.call).pause();
              ui.updateMsg({msg: 'accept_call'});
            };

            QB.webrtc.onRejectCallListener = function(session, userId, extension) {
                console.group('onRejectCallListener.');
                    console.log('UserId: ' + userId);
                    console.log('Session: ' + session);
                    console.log('Extension: ' + JSON.stringify(extension));
                console.groupEnd();

                $('.j-callee_status_' + userId).text('Reject');
            };

            QB.webrtc.onStopCallListener = function(session, userId, extension) {
                console.group('onStopCallListener.');
                    console.log('UserId: ' + userId);
                    console.log('Session: ' + session);
                    console.log('Extension: ' + JSON.stringify(extension));
                console.groupEnd();

                $('.j-callee_status_' + userId).text('Hang up');
            };

            QB.webrtc.onRemoteStreamListener = function(session, userID, stream) {
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
            };

            QB.webrtc.onSessionConnectionStateChangedListener = function(session, userID, connectionState) {
                console.group('onSessionConnectionStateChangedListener.');
                    console.log('UserID: ' + userID);
                    console.log('Session: ' + session);
                    console.log('Extension: ' + JSON.stringify(connectionState));
                console.groupEnd();

                var connectionStateName = _.invert(QB.webrtc.SessionConnectionState)[connectionState],
                    $calleeStatus = $('.j-callee_status_' + userID);

                if(connectionState === QB.webrtc.SessionConnectionState.CONNECTING) {
                    $calleeStatus.text(connectionStateName);
                }

                if(connectionState === QB.webrtc.SessionConnectionState.CONNECTED) {
                    ui.toggleRemoteVideoView(userID, 'show');
                    $calleeStatus.text(connectionStateName);
                }

                if(connectionState === QB.webrtc.SessionConnectionState.COMPLETED) {
                    ui.toggleRemoteVideoView(userID, 'show');
                    $calleeStatus.text(connectionStateName);
                }

                if(connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED){
                    ui.toggleRemoteVideoView(userID, 'hide');
                }

                if(connectionState === QB.webrtc.SessionConnectionState.CLOSED){
                    if(app.mainVideo === userID) {
                        $('#remote_video_' + userID).removeClass('active');
                    }
                    ui.toggleRemoteVideoView(userID, 'clear');
                    $(ui.modal.income_call).modal('hide');
                    document.getElementById(ui.sounds.rington).pause();
                }
            };
        }
    });
}(window, jQuery));
