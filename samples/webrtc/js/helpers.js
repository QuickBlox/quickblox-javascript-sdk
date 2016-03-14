;(function(window, QB) {
    'use strict';

    /** GLOBAL */
    window.app = {};
    app.helpers = {};

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
                usersHTML = '',
                usersCount = 0;

            QB.users.get({'tags': [app.caller.user_tags]}, function(err, result){
                if (err) {
                    reject(err);
                } else {
                    _.each(result.items, function(item) {
                        if( item.user.id !== app.caller.id ) {
                            usersHTML += tpl(item.user);
                            ++usersCount;
                        }
                    });

                    if(!usersCount) {
                        reject({
                            'title': 'not found',
                            'message': 'Not found users by tag'
                        });
                    } else {
                        resolve(usersHTML);
                    }
                }
            });
        });
    };
}(window, window.QB));
