/**
 * Require:
 *  - jQuery;
 *  - Underscore;
 *  - MESSAGES (window.MESSAGES) - global const object with custom messages (from config.js);
 */
;(function(window, $, _) {
    'use strict';

    var msgBoard = (function() {
        var msgBoardEl = document.getElementById('msg_board');

        /**
         * [updateMsg]
         * @param  {[String]} msg_title [key for MESSAGES object / id of template]
         * @param  {[Object]} params    [custom params for compiled template]
         * @param  {[boolean]} isError  [flag is Error - add className to html]
         */
        var updateMsg = function(msg_title, params, isError) {
            var msg = '',
                msgFrag = document.createElement('div'),
                className = 'fw-inner';

            if(isError) {
              className += ' error';
            }

            msgFrag.className = className;

            /**
             * In first we trying found msg in MESSAGES object
             * then tpl with id like msg_title
             */
            try {
              msg = _.template( document.querySelector('#' + msg_title).innerHTML )(params);
            } catch(e) {
              if(MESSAGES[msg_title]) {
                  msg = MESSAGES[msg_title];
              } else {
                msg = msg_title;
              }
            }

            msgBoardEl.innerHTML = '';

            msgFrag.innerHTML = msg;
            msgBoardEl.appendChild(msgFrag);
        };

        return {
            update: updateMsg
        };
    }());

    /**
     * Check global variable
     * and add constructor MsgBoard
     */
    window.qbApp = window.qbApp || {};
    window.qbApp.MsgBoard = msgBoard;
}(window, jQuery, _));
