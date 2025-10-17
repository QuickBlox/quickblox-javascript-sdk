/**
 * Require:
 *  - jQuery;
 *  - Underscore;
 *  - MESSAGES (window.MESSAGES) - global const object with custom messages (from config.js);
 */
;(function(window, MESSAGES, $, _) {
    'use strict';

    function StateBoard(elSelector, params) {
        this.$el = $(elSelector);

        if(!this.$el.length) {
            throw new Error('The element not founded');
        }

        if(params && !_.isEmpty(params)) {
            this.update(params);
        }
    }

    /**
     * [update]
     * @param  {[Object]} params [all params]
     * Params:
     *  * params.title    [key for MESSAGES object / id of template]
     *  * params.property [custom property for compiled template]
     *  * params.isError  [flag is Error - add className to html]
     */
    StateBoard.prototype.update = function (params) {
        var msg = '',
            msgFrag = document.createElement('div'),
            className = 'inner';

        this.$el.empty();

        if(params.isError) {
          className += ' ' + params.isError;
        }

        msgFrag.className = className;

        /**
         * In first we trying found msg in MESSAGES object
         * then tpl with id like params.title
         */
        try {
            msg = _.template( $('#' + params.title).html() )(params.property);
        } catch(e) {
            if(MESSAGES[params.title]) {
                msg = MESSAGES[params.title];
            } else {
                msg = params.title;
            }
        }

        msgFrag.innerHTML = msg;
        this.$el.append(msgFrag);
    };

    /**
     * Check global variable
     * and add constructor MsgBoard
     */
    window.app.helpers.StateBoard = StateBoard;
}(window, window.CONFIG.MESSAGES, jQuery, _));
