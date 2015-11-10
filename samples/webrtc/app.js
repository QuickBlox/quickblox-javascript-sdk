;(function(window, $) {
    'use strict';
    /** when DOM is ready */
    $(function() {
        var ui = {
                wrapper: $('.j-wrapper'),
                footer: $('.j-footer'),
                usersList: $('.j-users_list'),
                cl: $('.j-console'),
                title: $('.j-main_title'),
                main: $('.j-main'),
                panel: $('.j-pl'),
                setPositionFooter: function() {
                    var that = this,
                        invisibleClassName = 'invisible',
                        footerFixedClassName = 'footer-fixed';
                    
                    if( $(window).outerHeight() > that.wrapper.outerHeight()) {
                        that.footer.addClass(footerFixedClassName);
                    } else {
                        that.footer.removeClass(footerFixedClassName);
                    }

                    that.footer.removeClass(invisibleClassName);
                },
                createUsers: function(users, $node) {
                    var tpl = _.template($('#user_tpl').html()),
                        usersHTML = '',
                        width = 0;

                    $node.empty();

                    _.each(users, function(user, i, list) {
                        if( (list.length - i) < 10){
                            user.width = 100 / list.length;
                        }
                        usersHTML += tpl(user);
                    });

                    $node.append(usersHTML);
                },
                /**
                 * [updateMsg update massage for user]
                 * @param  {[type]} msg_name [key for MESSAGES object / name of template]
                 * @param  {[type]} obj      [additional paramets for compiled template]
                 * @param  {[type]} target   [target node (this.cl or this.title )]
                 */
                updateMsg: function(params) {
                    var $el = (!params.target) ? this.cl : this.title,
                        msg = '';
                    
                    $el.empty();

                    if( MESSAGES[params.msg] ) {
                        msg =  MESSAGES[params.msg];
                    } else {
                        var tpl = _.template( $('#' + params.msg).html() );
                        msg = tpl(params.obj);
                    }

                    $el.append( msg );
                },
                showPreload: function() {
                    this.main.addClass('main-preload');
                },
                hidePreload: function() {
                    this.main.removeClass('main-preload');
                }
            },
            app = {
                caller: {},
                callees: {},
            };

        function initializeUI() {
            ui.createUsers(QBUsers, ui.usersList);
            ui.updateMsg({msg: 'login'});
            ui.updateMsg({msg: 'title_login', target: 1});
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
                classNameCheckedUser = 'users_user-active';

            /** if app.caller is not exist create caller, if no - add callees */
            if( _.isEmpty(app.caller) ) {
                ui.showPreload();
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

                ui.usersList.empty();

                ui.updateMsg( {msg: 'create_session'} );
                ui.updateMsg( {msg: 'connect'} );

                QB.chat.connect({
                    jid: QB.chat.helpers.getUserJid( app.caller.id, QBApp.appId ),
                    password: app.caller.password
                }, function(err, res) {
                    if(err !== null) {
                        ui.updateMsg( {msg: 'connect_error'} );
                    } else {
                        ui.createUsers(usersWithoutCaller, ui.usersList);

                        ui.updateMsg({msg: 'title_callee', target: 1});
                        ui.updateMsg( {msg: 'login_tpl', obj: {name: app.caller.full_name}} );

                        ui.panel.removeClass('hidden');
                        ui.setPositionFooter();
                        ui.hidePreload();
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

        $(window).on('resize', function() {
            ui.setPositionFooter();
        });

        /**
         * QB Event listener
         */
        QB.chat.onDisconnectedListener = function() {
            app.caller = {};
            app.callees = [];

            initializeUI();
        };
    });
}(window, jQuery));