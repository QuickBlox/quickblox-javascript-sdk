;(function(window, app, QB) {
    'use strict';

    /** GLOBAL */
    app.helpers = {};
    app.ui = {};
    app.user = null;
    app.users = [];

    app.ui.setFooterPosition = function() {
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

    /**
     * JOIN
     */
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
                                console.log('APP [get user] Error:', egError);
                                console.log('APP [get user] User:', egUser);

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
                usersHTML = '';

            QB.users.get({'tags': [app.user.user_tags]}, function(err, result){
                if (err) {
                    reject(err);
                } else {
                    _.each(result.items, function(item) {
                        if( item.user.id !== app.user.id ) {
                            app.users.push(item.user);
                            usersHTML += tpl(item.user);
                        }
                    });

                    resolve(usersHTML);
                }
            });
        });
    };
}(window, window.app, window.QB));
