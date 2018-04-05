'use strict';

function Places() {
    this.className = 'Place';

    this.items = [];
}

Places.prototype.sync = function(skip) {
    var self = this;

    var maxLimit = 100;

    var filter = {
        'limit': maxLimit,
        'sort_desc': 'updated_at'
    };

    filter.skip = skip || 0;

    return new Promise(function(resolve, reject) {
        QB.data.list(self.className, filter, function(err, res){
            if (err) {
                reject(err);
            } else {
                res.items.forEach(function(el) {
                    // Slice media to 20 items max
                    if(el.media && el.media.length > APP_CONFIG.maxMediaItemsCount) {
                        el.media.length =  APP_CONFIG.maxMediaItemsCount;
                    }

                    self.items.push(el);

                    if (res.length === maxLimit) {
                        self.sync(res.length);
                    }
                });

                resolve();
            }
        });
    });
};

Places.prototype.create = function(params) {
    var self = this;

    return new Promise(function(resolve, reject) {
        QB.data.create(self.className, params, function(err, place){
            if (err) {
                reject(err);
            } else {
                self.items.unshift(place);
                resolve(place);
            }
        });
    });
};

Places.prototype.getPlace = function(id) {
    return this.items.find(function(place) {
        return place._id === id;
    });
};

Places.prototype.setAmountExistedCheckins = function(id, amount) {
    var place = this.getPlace(id);
    place.checkinsAmount = amount;
};

Places.prototype.update = function(params) {
    var self = this;

    return new Promise(function(resolve, reject) {
        QB.data.update(self.className, params, function(err, place){
            if (err) {
                reject(err);
            } else {
                resolve(place);
            }
        });
    });
};

Places.prototype.updateLocal = function(newPlace) {
    var place = this.getPlace(newPlace._id);

    if(newPlace.media && newPlace.media.length > APP_CONFIG.maxMediaItemsCount) {
        newPlace.media.length = APP_CONFIG.maxMediaItemsCount;
    }

    Object.assign(place, newPlace);

    function sortByUpdate(a, b) {
        return b.updated_at - a.updated_at;
    }

    this.items.sort(sortByUpdate);
};
