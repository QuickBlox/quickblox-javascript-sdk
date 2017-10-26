'use strict';

var Utils = require('../qbUtils');
var config = require('../qbConfig');

/**
 * Address Book
 * @namespace QB.addressBook
 */
function AddressBook(service) {
  this.service = service;
}

  /**
   * Save constacts in address book.
   * @memberof QB.data
   * @param {Array} list - A list of contacts to save
   * @param {savedAddressBookCallback} callback - The savedAddressBookCallback function
   * @param {Object[]} [options] - Search records with field which contains exactly specified value or by array of records' ids to retrieve
   * @param {string} [options.udid] - User's device identifier. If specified all operations will be in this context. Max length 64 symbols.
   * If not - it means a user has one global address book across all his devices.
   * @param {number} [options.force=0] - Defines force rewrite mode.
   * If set 1 then all previous contacts for device context will be replaced by new ones.
   * 
   * @example
   *  var people = [{
   *    'name':'Frederic Cartwright',
   *    'phone': '8879108395'
   *  },
   *  {
   *    'name':'Nessi McLaughlin',
   *    'phone': '8759108396'
   *  }];
   * 
   *  function addressBookSaved(err, responce) {
   *    if(err) {
   *      
   *    } else {
   *      console.log('All constacts saved');
   *    }
   *  }
   * 
   *  QB.addressBook.save(addressBookList, addressBookSaved);
   * 
   */
  AddressBook.prototype.save = function(list, callback, options) {
    if (!Array.isArray(list)) {
      new Error('First parameter must be an Array.');
      return;
    }

    if (!isFunction(callback)) {
      new Error('Callback is required.');
      return;
    }

    var data = {contacts: list, force: 1};


    if(options && options) {
      if(options.force && options.force) {
        data.force = options.force;
      }

      if(options.udid) {
        data.udid = options.udid;
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
        callback(err, null);
      } else {
        callback(null, res);
      }
    });
  };

  AddressBook.prototype.get = function(udid, callback) {
    if (!isFunction(callback)) {
      new Error('Callback is required.');
      return;
    }
  
    this.service.ajax({
      type: 'GET',
      url: Utils.getUrl(config.urls.addressbook)
    }, function(err, res) {
      if (err) {
        // Don't ask me why.
        // Thanks to backend developers for this
        // sooo sad IF 
        var errDetails = JSON.parse(err.detail);
  
        if(err.code === 404 && errDetails.errors[0] === 'Empty address book') {
          callback(null, []);
        } else {
          callback(err, null);
        }
      } else {
        callback(null, res);
      }
    });
  };

module.exports = AddressBook;

function isFunction(func) {
  return !!(func && func.constructor && func.call && func.apply);
}
