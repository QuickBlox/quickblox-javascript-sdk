'use strict';

var Utils = require('../qbUtils');
var config = require('../qbConfig');

/**
 * Address Book
 * @namespace QB.addressbook
 */
function AddressBook(service) {
  this.service = service;
}

AddressBook.prototype = {
  /**
   * Method cud is create, update and delete contacts in address book. <br />
   * An operation choosens by state: if contacts (to identify uses phone number) doesn't exist in address book it will save,
   * if contact founds it will update, if passed a property `destroy` with 1 the contact will remove. <br />
   * {@link https://quickblox.com/developers/AddressBook Found more here}. <br />
   * The methods accepts 2 or 3 parameters. 
   * @memberof QB.addressbook
   * @param {Object[]} list - A list of contacts to create / update / delete.
   * @param {Object} [options] - Search records with field which contains exactly specified value or by array of records' ids to retrieve
   * @param {string} [options.udid] - User's device identifier. If specified all operations will be in this context. Max length 64 symbols.
   * If not - it means a user has one global address book across all his devices.
   * @param {number} [options.force] - Defines force rewrite mode.
   * If set 1 then all previous contacts for device context will be replaced by new ones.
   * @param {Function} callback - The savedAddressBookCallback function
   * 
   * @example
   *  var people = [{
   *    'name':'Frederic Cartwright',
   *    'phone': '8879108395'
   *  },
   *  {
   *    'phone': '8759108396',
   *    'destroy': 1
   *  }];
   * 
   *  var options = {
   *    force: 1,
   *    udid: 'A337E8A4-80AD-8ABA-9F5D-579EFF6BACAB'
   *  };
   * 
   *  function addressBookSaved(err, responce) {
   *    if(err) {
   *      
   *    } else {
   *      console.log('All constacts saved');
   *    }
   *  }
   * 
   *  QB.addressbook.cud(addressBookList, savedAddressBookCallback);
   *  // or second parameters can be options
   *  QB.addressbook.cud(addressBookList, options, savedAddressBookCallback);
   * 
   */
  cud: function(list, optionsOrcallback, callback) {
    if (!Array.isArray(list)) {
      new Error('First parameter must be an Array.');
      return;
    }

    var opts, cb;

    if(isFunction(optionsOrcallback)) {
      cb = optionsOrcallback;
    } else {
      opts = optionsOrcallback;
      cb = callback;
    }

    var data = { contacts: list };

    if(opts) {
      if(opts.force && opts.force) {
        data.force = opts.force;
      }

      if(opts.udid) {
        data.udid = opts.udid;
      }
    }

    this.service.ajax({
      'type': 'POST',
      'dataType': 'json',
      'url': Utils.getUrl(config.urls.addressbook),
      'data': JSON.stringify(data),
      'contentType': 'application/json; charset=utf-8'
    },function(err, res) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, res);
      }
    });
  },

  /**
   * This callback is called `getContactsCallback` and passed 2 arguments: err and responce.
   * @callback getContactsCallback
   * @param {Object} err 
   * @param {Object[]} responce
   */

  /**
   * Retrive all contacts from address book.
   * The methods accepts 1 or 2 parameters.
   * @memberof QB.addressbook
   * @param {string|function} udidOrCallback - You could pass udid of address book or
   * callback function if you want to get contacts from global address book.
   * @param {getContactsCallback} [callback] - Callback function uses as 2nd parameter if you pass udid as 1st parameters.
   * This callback 2 arguments: error and responce.
   *
   * @example
   * var UDID = 'D337E8A4-80AD-8ABA-9F5D-579EFF6BACAB';
   * 
   * function gotContacts(err, contacts) {
   *  contacts.forEach( (contact) => { alert(contact); })
   * }
   * 
   * QB.addressbook.get(gotContacts);
   * // or you could specify what address book you need by udid 
   * QB.addressbook.get(UDID, gotContacts);
   */
  get: function(udidOrCallback, callback) {
    var udid, cb;

    if(isFunction(udidOrCallback)) {
      cb = udidOrCallback;
    } else {
      udid = udidOrCallback;
      cb = callback;
    }

    if(!isFunction(cb)) {
      throw new Error('The QB.addressbook.get accept callback function is required.');
    }

    var ajaxParams = {
      'type': 'GET',
      'url': Utils.getUrl(config.urls.addressbook),
      'contentType': 'application/json; charset=utf-8'
    };

    if(udid) {
      ajaxParams.data = {'udid': udid};
    }

    this.service.ajax(ajaxParams, function(err, res) {
      if (err) {
        // Don't ask me why.
        // Thanks to backend developers for this
        // sooo sad IF 
        var errDetails = JSON.parse(err.detail);
  
        if(err.code === 404 && errDetails.errors[0] === 'Empty address book') {
          cb(null, []);
        } else {
          cb(err, null);
        }
      } else {
        cb(null, res);
      }
    });
  },

  /**
   * This callback is called `gotExistedContacts` and passed 2 arguments: err and responce.
   * @callback gotExistedContacts
   * @param {Object} err 
   * @param {Object[]} responce
   */

  /**
   * Retrive all user that has phone number from your address book.
   * The methods accepts 1 or 2 parameters.
   * @memberof QB.addressbook
   * @param {boolean|function} udidOrCallback - You could pass `isCompact` format of returnd users of address book or callback
   * @param {gotExistedContacts} [callback] - Callback function uses as 2nd parameter if you pass `isCompact` as 1st parameters.
   */
  getAll: function(isCompactOrCallback, callback) {
    var isCompact, cb;

    if(isFunction(isCompactOrCallback)) {
      cb = isCompactOrCallback;
    } else {
      isCompact = isCompactOrCallback;
      cb = callback;
    }

    if(!isFunction(cb)) {
      throw new Error('The QB.addressbook.get accept callback function is required.');
    }

    var ajaxParams = {
      'type': 'GET',
      'url': Utils.getUrl(config.urls.addressbookRegistered),
      'contentType': 'application/json; charset=utf-8'
    };

    if(isCompact) {
      ajaxParams.data = {'compact': 1};
    }

    this.service.ajax(ajaxParams, function(err, res) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, res);
      }
    });
  }
};

module.exports = AddressBook;

function isFunction(func) {
  return !!(func && func.constructor && func.call && func.apply);
}
