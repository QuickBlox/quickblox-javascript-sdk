'use strict';

var DialogProxy = require('../src/modules/chat/qbDialog');
var Utils = require('../src/qbUtils');

describe('QB.chat.dialog admin role REST API', function() {
    var dialogProxy;
    var service;
    var dialogsUrl;
    var dialogId;
    var dialogUrl;

    beforeEach(function() {
        service = {
            ajax: jasmine.createSpy('ajax')
        };
        dialogProxy = new DialogProxy(service);
        dialogsUrl = Utils.getUrl('chat/Dialog');
        dialogId = '66f2a030bba14b4c2e000001';
        dialogUrl = Utils.getUrl('chat/Dialog', dialogId);
    });

    it('should call create with admin_ids array joined like occupants_ids', function() {
        var callback = jasmine.createSpy('callback');

        dialogProxy.create({
            type: 2,
            name: 'group',
            occupants_ids: [10, 20, 30],
            admin_ids: [10, 20]
        }, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogsUrl,
            type: 'POST',
            data: {
                type: 2,
                name: 'group',
                occupants_ids: '10, 20, 30',
                admin_ids: '10, 20'
            }
        }, callback);
    });

    it('should pass create admin_ids string without changes', function() {
        var callback = jasmine.createSpy('callback');

        dialogProxy.create({
            type: 2,
            occupants_ids: '10,20',
            admin_ids: '10,20'
        }, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogsUrl,
            type: 'POST',
            data: {
                type: 2,
                occupants_ids: '10,20',
                admin_ids: '10,20'
            }
        }, callback);
    });

    it('should not add admin_ids to create payload when omitted', function() {
        var callback = jasmine.createSpy('callback');

        dialogProxy.create({
            type: 2,
            occupants_ids: [10, 20]
        }, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogsUrl,
            type: 'POST',
            data: {
                type: 2,
                occupants_ids: '10, 20'
            }
        }, callback);
    });

    it('should pass private dialog admin_ids to backend without SDK-side blocking', function() {
        var callback = jasmine.createSpy('callback');

        dialogProxy.create({
            type: 3,
            occupants_ids: [20],
            admin_ids: [20]
        }, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogsUrl,
            type: 'POST',
            data: {
                type: 3,
                occupants_ids: '20',
                admin_ids: '20'
            }
        }, callback);
    });

    it('should call update with direct admin_ids JSON payload', function() {
        var callback = jasmine.createSpy('callback');
        var data = {
            admin_ids: [10, 20]
        };

        dialogProxy.update(dialogId, data, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogUrl,
            type: 'PUT',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            data: data
        }, callback);
    });

    it('should call update with push_all admin_ids JSON payload', function() {
        var callback = jasmine.createSpy('callback');
        var data = {
            push_all: {
                admin_ids: [30]
            }
        };

        dialogProxy.update(dialogId, data, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogUrl,
            type: 'PUT',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            data: data
        }, callback);
    });

    it('should call update with pull_all admin_ids JSON payload', function() {
        var callback = jasmine.createSpy('callback');
        var data = {
            pull_all: {
                admin_ids: [30]
            }
        };

        dialogProxy.update(dialogId, data, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogUrl,
            type: 'PUT',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            data: data
        }, callback);
    });

    it('should call update with mixed occupants_ids and admin_ids in push_all', function() {
        var callback = jasmine.createSpy('callback');
        var data = {
            push_all: {
                occupants_ids: [30, 40],
                admin_ids: [40]
            }
        };

        dialogProxy.update(dialogId, data, callback);

        expect(service.ajax).toHaveBeenCalledWith({
            url: dialogUrl,
            type: 'PUT',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            data: data
        }, callback);
    });

    it('should pass through 400 admin_ids format error', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 400,
            detail: 'Incorrect format for parameter "admin_ids".'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        dialogProxy.create({
            type: 2,
            occupants_ids: [10],
            admin_ids: ['bad']
        }, callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should pass through 403 admin_ids permission error', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 403,
            detail: 'You don\'t have appropriate permissions to modify or delete "admin_ids".'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        dialogProxy.update(dialogId, {
            push_all: {
                admin_ids: [30]
            }
        }, callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });

    it('should pass through 404 admin_ids users error', function() {
        var callback = jasmine.createSpy('callback');
        var expectedError = {
            status: 404,
            detail: 'Users with these IDs for "admin_ids" do not exist.'
        };

        service.ajax.and.callFake(function(params, cb) {
            cb(expectedError);
        });

        dialogProxy.create({
            type: 2,
            occupants_ids: [10],
            admin_ids: [999999]
        }, callback);

        expect(callback).toHaveBeenCalledWith(expectedError);
    });
});
