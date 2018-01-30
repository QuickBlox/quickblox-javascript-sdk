/* globals describe, beforeAll, expect, it */
'use strict';

describe('AddressBook', function() {
    var REST_REQUESTS_TIMEOUT = 5000;

    var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

    var QB = isNodeEnv ? require('../src/qbMain') : window.QB;

    var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
    var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
    var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

    var CONTACTS = [
        {
            'name':'Gordie Kann',
            'phone': '1879108395',
        },
        {
            'name':'Wildon Gilleon',
            'phone': '2759108396'
        },
        {
            'name':'Gaston Center',
            'phone': '3759108396'
        }
    ];

    var UDID = 'A337E8A4-80AD-8ABA-9F5D-579EFF6BACAB';
    var CONTACTS_BY_UDID = [
        {
            'name':'Romona Ledes',
            'phone': '4879108395'
        },
        {
            'name':'Chico Yoodall',
            'phone': '5759108396'
        }
    ];

    beforeAll(function(done) {
        QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);

        QB.createSession(QBUser1, function(err, res) {
            if (err) {
                done.fail('Create session error: ' + JSON.stringify(err));
            } else {
                expect(res).not.toBeNull();

                done();
            }
        });
    }, REST_REQUESTS_TIMEOUT);

    describe('Add contacts', function() {
        it('in global address book / without UDID', function(done) {
            function addressBookSaved(err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res.created).toEqual(CONTACTS.length);

                done();
            }

            var options = {
                'force': 1
            };

            QB.addressbook.uploadAddressBook(CONTACTS, options, addressBookSaved);
        }, REST_REQUESTS_TIMEOUT);

        it('in specific address book / with UDID', function(done) {
            function addressBookSaved(err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res.created).toEqual(CONTACTS_BY_UDID.length);

                done();
            }

            var options = {
                'udid': UDID
            };

            QB.addressbook.uploadAddressBook(CONTACTS_BY_UDID, options, addressBookSaved);
        }, REST_REQUESTS_TIMEOUT);
    });

    describe('Get all existed contacts', function() {
        xit('GET get', function(done) {
            function addressBookGot(err, res) {
                expect(err).toBeNull();
                expect(res.items.length).toBeGreaterThan(0);

                done();
            }

            QB.addressbook.getRegisteredUsers(addressBookGot);
        }, REST_REQUESTS_TIMEOUT);
    });

    describe('Get contacts', function() {
        it('call without required callback function', function () {
            expect(function() {
                QB.addressbook.get();
            }).toThrowError('The QB.addressbook.get accept callback function is required.');
        });

        it('in global address book / without UDID', function(done) {
            function addressBookSaved(err, res) {
                expect(err).toBeNull();
                expect(res).toEqual(CONTACTS);

                done();
            }

            QB.addressbook.get(addressBookSaved);
        }, REST_REQUESTS_TIMEOUT);

        xit('in specific address book / with UDID', function(done) {
            function addressBookSaved(err, res) {
                expect(err).toBeNull();
                expect(res).toEqual(CONTACTS_BY_UDID);
                done();
            }

            QB.addressbook.get(UDID, addressBookSaved);
        }, REST_REQUESTS_TIMEOUT);
    });

    describe('Update contacts', function() {
        function prepareForUpdate(contacts) {
            return contacts.map( function(contact, index) {

                contact.name += ' Updated';

                return contact;
            });
        }

        it('in global address book / without UDID', function(done) {
            var contactsUpdated = prepareForUpdate(CONTACTS);

            function addressBookUpdated(err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res.updated).toEqual(contactsUpdated.length);

                done();
            }

            QB.addressbook.uploadAddressBook(contactsUpdated, addressBookUpdated);
        }, REST_REQUESTS_TIMEOUT);

        it('in specific address book / with UDID', function(done) {
            var contactsUpdated = prepareForUpdate(CONTACTS_BY_UDID);

            function addressBookUpdated(err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res.updated).toEqual(contactsUpdated.length);

                done();
            }

            var options = {
                'udid': UDID
            };

            QB.addressbook.uploadAddressBook(contactsUpdated, options, addressBookUpdated);
        }, REST_REQUESTS_TIMEOUT);
    });

    describe('Remove contacts', function() {
        function prepareForDestroy(contacts) {
            return contacts.map( function(contact, index) {
                if(index%2 !== 0) {
                    delete contact.name;
                }

                contact.destroy = 1;

                return contact;
            });
        }

        it('in global address book / without UDID', function(done) {
            var contactsDestroy = prepareForDestroy(CONTACTS);

            function removedContacts(err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res.deleted).toEqual(contactsDestroy.length);

                done();
            }

            QB.addressbook.uploadAddressBook(contactsDestroy, removedContacts);
        });

        it('in specific address book / with UDID', function(done) {
            var contactsDestroy = prepareForDestroy(CONTACTS_BY_UDID);

            function removedContacts(err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res.deleted).toEqual(contactsDestroy.length);

                done();
            }

            var options = {
                'udid': UDID
            };

            QB.addressbook.uploadAddressBook(contactsDestroy, options, removedContacts);
        });
    });
});
