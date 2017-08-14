'use strict';

var Checkin = {
    className: 'Checkin',

    create: function(params) {
        var self = this;

        return new Promise(function(resolve, reject) {
            QB.data.create(self.className, params, function(err, checkin) {
                if (err) {
                    reject(err);
                } else {
                    resolve(checkin);
                }
            });
        });
    },
    
    get: function(params) {
        var self = this;

        return new Promise(function(resolve, reject) {
            QB.data.list(self.className, params, function(err, checkins) {
                if (err) {
                    reject(err);
                } else {
                    resolve(checkins.items);
                }
            });
        });
    }
};

