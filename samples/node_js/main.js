/**
 * Sample for Node env.
 * Start example from root folder by command `node samples/node_js/main.js`
 *
 */

/**
 * Declaring variables
 */
const fs = require('fs');
const url = require('url');
const util = require('util');
const http = require('http');
const request = require('request');

const QB = require('../../src/qbMain.js');

/** See http://quickblox.com/developers/Javascript#Configuration */
const CONFIG = {
    'debug': {
        'mode': 2, //  [1, 2] logs to console and file ON
        'file': 'sample_debug.log'
    }
};

const CREDS = {
    'appId': 92,
    'authKey': 'wJHdOcQSxXQGWx5',
    'authSecret': 'BTFsj7Rtt27DAmT'
};

const QBUser = {
    'login': 'nodeuser',
    'password': 'nodeuser'
};

/**
 * Start FUN
 */
QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);

QB.createSession(QBUser, function(err, result) {
    if (err) {
        console.log('[QB - createSession]Error:', err);
    } else {
        /** An image for demonstrate a method 'QB.content.createAndUpload' */
        var srcIMG = __dirname + '/wolf.jpg';

        fs.stat(srcIMG, function (err, stats) {
            fs.readFile(srcIMG, function (err, data) {
                if (err) {
                    throw err;
                } else {
                    var imgInfo = {
                        'file': data,
                        'name': 'image.jpg',
                        'type': 'image/jpeg',
                        'size': stats.size
                    };

                    QB.content.createAndUpload(imgInfo, function(err, response){
                        if (err) {
                            console.log('[QB - createAndUpload]Error:', err);
                        } else {
                            console.log('[QB - createAndUpload]Success:', response);
                        }
                    });
                }
            });
        });
    }
});
