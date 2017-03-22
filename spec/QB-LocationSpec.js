describe('Location API', function() {
    'use strict';

    var REST_REQUESTS_TIMEOUT = 5000;

    var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

    var QB = isNodeEnv ? require('../src/qbMain') : window.QB;
    var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
    var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
    var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

    beforeAll(function(done){
        QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret);

        QB.createSession(QBUser1, function(err, session) {
            if (err) {
                done.fail('Create session error:', err);
            } else {
                expect(session).not.toBeNull();

                done();
            }
        });
    }, REST_REQUESTS_TIMEOUT);

    it('can create geodata', function(done){
        /**
         * coordinates of Big Ben
         * from http://www.openstreetmap.org/?way=123557148#map=18/51.50065/-0.12525
         */
        var params = {
            'latitude': 51.50065,
            'longitude':-0.12525,
            'status': 'Under the clocktower'
        };

        QB.location.geodata.create(params, function(err, res){
            if (err) {
                done.fail('Create geodata error: ' + JSON.stringify(err));
            } else {
                expect(res).not.toBeNull();
                expect(res.id).toBeGreaterThan(0);

                done();
            }
        });
    }, REST_REQUESTS_TIMEOUT);

    it('can get existing geodata', function(done){
        var params = {
            'latitude': 51.50332,
            'longitude':-0.12805,
            'status': 'Keeping \'em in line'
        };

        QB.location.geodata.create(params, function(err, res){
            if (err) {
                done.fail('Create geodata error: ' + JSON.stringify(err));
            } else {
                QB.location.geodata.get(res.id, function(err, result){
                    if (err) {
                        done.fail('Get existing geodata error: ' + JSON.stringify(err));
                    } else {
                        expect(result).not.toBeNull();
                        expect(result.status).toBe('Keeping \'em in line');

                        done();
                    }
                });
            }
        });
    }, REST_REQUESTS_TIMEOUT);

    it('can update existing geodata', function(done){
        var params = {
            'latitude': 51.50332,
            'longitude':-0.12805,
            'status': 'Waiting outside'
        };

        QB.location.geodata.create(params, function(err, res){
            if (err) {
                done.fail('Create geodata error: ' + JSON.stringify(err));
            } else {
                res.status='Still waiting';

                QB.location.geodata.update(res, function(err, result){
                    if (err) {
                        done.fail('Update existing geodata error: ', err);
                    } else {
                        expect(result).not.toBeNull();
                        expect(result.status).toBe('Still waiting');

                        done();
                    }
                });
            }
        });
    }, REST_REQUESTS_TIMEOUT);

    it('can delete existing geodata', function(done){
        var params = {
            'latitude': 51.50332,
            'longitude':-0.12805,
            'status': 'Go 50 meters left'
        };

        QB.location.geodata.create(params, function(err, res){
            if (err) {
                done.fail('Create geodata error: ' + JSON.stringify(err));
            } else {
                QB.location.geodata.delete(res.id, function(err, result){
                    if (err) {
                        done.fail('Delete existing geodata error: ' + JSON.stringify(err));
                    } else {
                        expect(result).not.toBeNull();
                        expect(result).toBe(true);

                        done();
                    }
                });
            }
        });
    }, REST_REQUESTS_TIMEOUT);

    it('can list geodata', function(done){
        QB.location.geodata.list(function(err, res) {
            if (err) {
                done.fail('List geodata error: ' + JSON.stringify(err));
            } else {
                expect(res).not.toBeNull();
                expect(res.items.length).toBeGreaterThan(0);

                done();
            }
        });
    }, REST_REQUESTS_TIMEOUT);

    it('can purge geodata', function(done){
        QB.location.geodata.purge(7, function(err, result){
            if (err) {
                done.fail('Purge geodata error: ' + JSON.stringify(err));
            } else {
                expect(result).not.toBeNull();
                expect(result).toBe(true);

                done();
            }
        });
    }, REST_REQUESTS_TIMEOUT);
});
