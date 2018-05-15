(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QBVideoConferencingClient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fbemitter = {
  EventEmitter: require('./lib/BaseEventEmitter'),
  EmitterSubscription : require('./lib/EmitterSubscription')
};

module.exports = fbemitter;

},{"./lib/BaseEventEmitter":2,"./lib/EmitterSubscription":3}],2:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BaseEventEmitter
 * @typechecks
 */

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EmitterSubscription = require('./EmitterSubscription');
var EventSubscriptionVendor = require('./EventSubscriptionVendor');

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');

/**
 * @class BaseEventEmitter
 * @description
 * An EventEmitter is responsible for managing a set of listeners and publishing
 * events to them when it is told that such events happened. In addition to the
 * data for the given event it also sends a event control object which allows
 * the listeners/handlers to prevent the default behavior of the given event.
 *
 * The emitter is designed to be generic enough to support all the different
 * contexts in which one might want to emit events. It is a simple multicast
 * mechanism on top of which extra functionality can be composed. For example, a
 * more advanced emitter may use an EventHolder and EventFactory.
 */

var BaseEventEmitter = (function () {
  /**
   * @constructor
   */

  function BaseEventEmitter() {
    _classCallCheck(this, BaseEventEmitter);

    this._subscriber = new EventSubscriptionVendor();
    this._currentSubscription = null;
  }

  /**
   * Adds a listener to be invoked when events of the specified type are
   * emitted. An optional calling context may be provided. The data arguments
   * emitted will be passed to the listener function.
   *
   * TODO: Annotate the listener arg's type. This is tricky because listeners
   *       can be invoked with varargs.
   *
   * @param {string} eventType - Name of the event to listen to
   * @param {function} listener - Function to invoke when the specified event is
   *   emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */

  BaseEventEmitter.prototype.addListener = function addListener(eventType, listener, context) {
    return this._subscriber.addSubscription(eventType, new EmitterSubscription(this._subscriber, listener, context));
  };

  /**
   * Similar to addListener, except that the listener is removed after it is
   * invoked once.
   *
   * @param {string} eventType - Name of the event to listen to
   * @param {function} listener - Function to invoke only once when the
   *   specified event is emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */

  BaseEventEmitter.prototype.once = function once(eventType, listener, context) {
    var emitter = this;
    return this.addListener(eventType, function () {
      emitter.removeCurrentListener();
      listener.apply(context, arguments);
    });
  };

  /**
   * Removes all of the registered listeners, including those registered as
   * listener maps.
   *
   * @param {?string} eventType - Optional name of the event whose registered
   *   listeners to remove
   */

  BaseEventEmitter.prototype.removeAllListeners = function removeAllListeners(eventType) {
    this._subscriber.removeAllSubscriptions(eventType);
  };

  /**
   * Provides an API that can be called during an eventing cycle to remove the
   * last listener that was invoked. This allows a developer to provide an event
   * object that can remove the listener (or listener map) during the
   * invocation.
   *
   * If it is called when not inside of an emitting cycle it will throw.
   *
   * @throws {Error} When called not during an eventing cycle
   *
   * @example
   *   var subscription = emitter.addListenerMap({
   *     someEvent: function(data, event) {
   *       console.log(data);
   *       emitter.removeCurrentListener();
   *     }
   *   });
   *
   *   emitter.emit('someEvent', 'abc'); // logs 'abc'
   *   emitter.emit('someEvent', 'def'); // does not log anything
   */

  BaseEventEmitter.prototype.removeCurrentListener = function removeCurrentListener() {
    !!!this._currentSubscription ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Not in an emitting cycle; there is no current subscription') : invariant(false) : undefined;
    this._subscriber.removeSubscription(this._currentSubscription);
  };

  /**
   * Returns an array of listeners that are currently registered for the given
   * event.
   *
   * @param {string} eventType - Name of the event to query
   * @return {array}
   */

  BaseEventEmitter.prototype.listeners = function listeners(eventType) /* TODO: Array<EventSubscription> */{
    var subscriptions = this._subscriber.getSubscriptionsForType(eventType);
    return subscriptions ? subscriptions.filter(emptyFunction.thatReturnsTrue).map(function (subscription) {
      return subscription.listener;
    }) : [];
  };

  /**
   * Emits an event of the given type with the given data. All handlers of that
   * particular type will be notified.
   *
   * @param {string} eventType - Name of the event to emit
   * @param {*} Arbitrary arguments to be passed to each registered listener
   *
   * @example
   *   emitter.addListener('someEvent', function(message) {
   *     console.log(message);
   *   });
   *
   *   emitter.emit('someEvent', 'abc'); // logs 'abc'
   */

  BaseEventEmitter.prototype.emit = function emit(eventType) {
    var subscriptions = this._subscriber.getSubscriptionsForType(eventType);
    if (subscriptions) {
      var keys = Object.keys(subscriptions);
      for (var ii = 0; ii < keys.length; ii++) {
        var key = keys[ii];
        var subscription = subscriptions[key];
        // The subscription may have been removed during this event loop.
        if (subscription) {
          this._currentSubscription = subscription;
          this.__emitToSubscription.apply(this, [subscription].concat(Array.prototype.slice.call(arguments)));
        }
      }
      this._currentSubscription = null;
    }
  };

  /**
   * Provides a hook to override how the emitter emits an event to a specific
   * subscription. This allows you to set up logging and error boundaries
   * specific to your environment.
   *
   * @param {EmitterSubscription} subscription
   * @param {string} eventType
   * @param {*} Arbitrary arguments to be passed to each registered listener
   */

  BaseEventEmitter.prototype.__emitToSubscription = function __emitToSubscription(subscription, eventType) {
    var args = Array.prototype.slice.call(arguments, 2);
    subscription.listener.apply(subscription.context, args);
  };

  return BaseEventEmitter;
})();

module.exports = BaseEventEmitter;
}).call(this,require('_process'))
},{"./EmitterSubscription":3,"./EventSubscriptionVendor":5,"_process":8,"fbjs/lib/emptyFunction":6,"fbjs/lib/invariant":7}],3:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule EmitterSubscription
 * @typechecks
 */

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventSubscription = require('./EventSubscription');

/**
 * EmitterSubscription represents a subscription with listener and context data.
 */

var EmitterSubscription = (function (_EventSubscription) {
  _inherits(EmitterSubscription, _EventSubscription);

  /**
   * @param {EventSubscriptionVendor} subscriber - The subscriber that controls
   *   this subscription
   * @param {function} listener - Function to invoke when the specified event is
   *   emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */

  function EmitterSubscription(subscriber, listener, context) {
    _classCallCheck(this, EmitterSubscription);

    _EventSubscription.call(this, subscriber);
    this.listener = listener;
    this.context = context;
  }

  return EmitterSubscription;
})(EventSubscription);

module.exports = EmitterSubscription;
},{"./EventSubscription":4}],4:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventSubscription
 * @typechecks
 */

'use strict';

/**
 * EventSubscription represents a subscription to a particular event. It can
 * remove its own subscription.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventSubscription = (function () {

  /**
   * @param {EventSubscriptionVendor} subscriber the subscriber that controls
   *   this subscription.
   */

  function EventSubscription(subscriber) {
    _classCallCheck(this, EventSubscription);

    this.subscriber = subscriber;
  }

  /**
   * Removes this subscription from the subscriber that controls it.
   */

  EventSubscription.prototype.remove = function remove() {
    if (this.subscriber) {
      this.subscriber.removeSubscription(this);
      this.subscriber = null;
    }
  };

  return EventSubscription;
})();

module.exports = EventSubscription;
},{}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule EventSubscriptionVendor
 * @typechecks
 */

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var invariant = require('fbjs/lib/invariant');

/**
 * EventSubscriptionVendor stores a set of EventSubscriptions that are
 * subscribed to a particular event type.
 */

var EventSubscriptionVendor = (function () {
  function EventSubscriptionVendor() {
    _classCallCheck(this, EventSubscriptionVendor);

    this._subscriptionsForType = {};
    this._currentSubscription = null;
  }

  /**
   * Adds a subscription keyed by an event type.
   *
   * @param {string} eventType
   * @param {EventSubscription} subscription
   */

  EventSubscriptionVendor.prototype.addSubscription = function addSubscription(eventType, subscription) {
    !(subscription.subscriber === this) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'The subscriber of the subscription is incorrectly set.') : invariant(false) : undefined;
    if (!this._subscriptionsForType[eventType]) {
      this._subscriptionsForType[eventType] = [];
    }
    var key = this._subscriptionsForType[eventType].length;
    this._subscriptionsForType[eventType].push(subscription);
    subscription.eventType = eventType;
    subscription.key = key;
    return subscription;
  };

  /**
   * Removes a bulk set of the subscriptions.
   *
   * @param {?string} eventType - Optional name of the event type whose
   *   registered supscriptions to remove, if null remove all subscriptions.
   */

  EventSubscriptionVendor.prototype.removeAllSubscriptions = function removeAllSubscriptions(eventType) {
    if (eventType === undefined) {
      this._subscriptionsForType = {};
    } else {
      delete this._subscriptionsForType[eventType];
    }
  };

  /**
   * Removes a specific subscription. Instead of calling this function, call
   * `subscription.remove()` directly.
   *
   * @param {object} subscription
   */

  EventSubscriptionVendor.prototype.removeSubscription = function removeSubscription(subscription) {
    var eventType = subscription.eventType;
    var key = subscription.key;

    var subscriptionsForType = this._subscriptionsForType[eventType];
    if (subscriptionsForType) {
      delete subscriptionsForType[key];
    }
  };

  /**
   * Returns the array of subscriptions that are currently registered for the
   * given event type.
   *
   * Note: This array can be potentially sparse as subscriptions are deleted
   * from it when they are removed.
   *
   * TODO: This returns a nullable array. wat?
   *
   * @param {string} eventType
   * @return {?array}
   */

  EventSubscriptionVendor.prototype.getSubscriptionsForType = function getSubscriptionsForType(eventType) {
    return this._subscriptionsForType[eventType];
  };

  return EventSubscriptionVendor;
})();

module.exports = EventSubscriptionVendor;
}).call(this,require('_process'))
},{"_process":8,"fbjs/lib/invariant":7}],6:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":8}],8:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],9:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Janus = factory());
}(this, (function () {

/* eslint-disable */
/*
 * Module shim for rollup.js to work with.
 * Simply re-export Janus from janus.js, the real 'magic' is in the rollup config.
 *
 * Since this counts as 'autogenerated' code, ESLint is instructed to ignore the contents of this file when linting your project.
 */

/*
	The MIT License (MIT)

	Copyright (c) 2016 Meetecho

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
	THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
 */

// List of sessions
Janus.sessions = {};

// Screensharing Chrome Extension ID
Janus.extensionId = "hapfgfdkleiggjjpfpenajgdnfckjpaj";
Janus.isExtensionEnabled = function() {
	if(window.navigator.userAgent.match('Chrome')) {
		var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
		var maxver = 33;
		if(window.navigator.userAgent.match('Linux'))
			maxver = 35;	// "known" crash in chrome 34 and 35 on linux
		if(chromever >= 26 && chromever <= maxver) {
			// Older versions of Chrome don't support this extension-based approach, so lie
			return true;
		}
		return Janus.checkJanusExtension();
	} else {
		// Firefox of others, no need for the extension (but this doesn't mean it will work)
		return true;
	}
};

Janus.useDefaultDependencies = function (deps) {
	var f = (deps && deps.fetch) || fetch;
	var p = (deps && deps.Promise) || Promise;
	var socketCls = (deps && deps.WebSocket) || WebSocket;
	return {
		newWebSocket: function(server, proto) { return new socketCls(server, proto); },
		isArray: function(arr) { return Array.isArray(arr); },
		checkJanusExtension: function() { return document.querySelector('#janus-extension-installed') !== null; },
		webRTCAdapter: (deps && deps.adapter) || adapter,
		httpAPICall: function(url, options) {
			var fetchOptions = {method: options.verb, cache: 'no-cache'};
			if(options.withCredentials !== undefined) {
				fetchOptions.credentials = options.withCredentials === true ? 'include' : (options.withCredentials ? options.withCredentials : 'omit');
			}
			if(options.body !== undefined) {
				fetchOptions.body = JSON.stringify(options.body);
			}

			var fetching = f(url, fetchOptions).catch(function(error) {
				return p.reject({message: 'Probably a network error, is the gateway down?', error: error});
			});

			/*
			 * fetch() does not natively support timeouts.
			 * Work around this by starting a timeout manually, and racing it agains the fetch() to see which thing resolves first.
			 */

			if(options.timeout !== undefined) {
				var timeout = new p(function(resolve, reject) {
					var timerId = setTimeout(function() {
						clearTimeout(timerId);
						return reject({message: 'Request timed out', timeout: options.timeout});
					}, options.timeout);
				});
				fetching = p.race([fetching,timeout]);
			}

			fetching.then(function(response) {
				if(response.ok) {
					if(typeof(options.success) === typeof(Janus.noop)) {
						return response.json().then(function(parsed) {
							options.success(parsed);
						}).catch(function(error) {
							return p.reject({message: 'Failed to parse response body', error: error, response: response});
						});
					}
				}
				else {
					return p.reject({message: 'API call failed', response: response});
				}
			}).catch(function(error) {
				if(typeof(options.error) === typeof(Janus.noop)) {
					options.error(error.message || '<< internal error >>', error);
				}
			});

			return fetching;
		}
	}
};

Janus.useOldDependencies = function (deps) {
	var jq = (deps && deps.jQuery) || jQuery;
	var socketCls = (deps && deps.WebSocket) || WebSocket;
	return {
		newWebSocket: function(server, proto) { return new socketCls(server, proto); },
		isArray: function(arr) { return jq.isArray(arr); },
		checkJanusExtension: function() { return jq('#janus-extension-installed').length > 0; },
		webRTCAdapter: (deps && deps.adapter) || adapter,
		httpAPICall: function(url, options) {
			var payload = options.body !== undefined ? {
				contentType: 'application/json',
				data: JSON.stringify(options.body)
			} : {};
			var credentials = options.withCredentials !== undefined ? {xhrFields: {withCredentials: options.withCredentials}} : {};

			return jq.ajax(jq.extend(payload, credentials, {
				url: url,
				type: options.verb,
				cache: false,
				dataType: 'json',
				async: options.async,
				timeout: options.timeout,
				success: function(result) {
					if(typeof(options.success) === typeof(Janus.noop)) {
						options.success(result);
					}
				},
				error: function(xhr, status, err) {
					if(typeof(options.error) === typeof(Janus.noop)) {
						options.error(status, err);
					}
				}
			}));
		},
	};
};

Janus.noop = function() {};

// Initialization
Janus.init = function(options) {
	options = options || {};
	options.callback = (typeof options.callback == "function") ? options.callback : Janus.noop;
	if(Janus.initDone === true) {
		// Already initialized
		options.callback();
	} else {
		if(typeof console == "undefined" || typeof console.log == "undefined")
			console = { log: function() {} };
		// Console logging (all debugging disabled by default)
		Janus.trace = Janus.noop;
		Janus.debug = Janus.noop;
		Janus.vdebug = Janus.noop;
		Janus.log = Janus.noop;
		Janus.warn = Janus.noop;
		Janus.error = Janus.noop;
		if(options.debug === true || options.debug === "all") {
			// Enable all debugging levels
			Janus.trace = console.trace.bind(console);
			Janus.debug = console.debug.bind(console);
			Janus.vdebug = console.debug.bind(console);
			Janus.log = console.log.bind(console);
			Janus.warn = console.warn.bind(console);
			Janus.error = console.error.bind(console);
		} else if(Array.isArray(options.debug)) {
			for(var i in options.debug) {
				var d = options.debug[i];
				switch(d) {
					case "trace":
						Janus.trace = console.trace.bind(console);
						break;
					case "debug":
						Janus.debug = console.debug.bind(console);
						break;
					case "vdebug":
						Janus.vdebug = console.debug.bind(console);
						break;
					case "log":
						Janus.log = console.log.bind(console);
						break;
					case "warn":
						Janus.warn = console.warn.bind(console);
						break;
					case "error":
						Janus.error = console.error.bind(console);
						break;
					default:
						console.error("Unknown debugging option '" + d + "' (supported: 'trace', 'debug', 'vdebug', 'log', warn', 'error')");
						break;
				}
			}
		}
		Janus.log("Initializing library");

		var usedDependencies = options.dependencies || Janus.useDefaultDependencies();
		Janus.isArray = usedDependencies.isArray;
		Janus.webRTCAdapter = usedDependencies.webRTCAdapter;
		Janus.httpAPICall = usedDependencies.httpAPICall;
		Janus.checkJanusExtension = usedDependencies.checkJanusExtension;
		Janus.newWebSocket = usedDependencies.newWebSocket;

		// Helper method to enumerate devices
		Janus.listDevices = function(callback, config) {
			callback = (typeof callback == "function") ? callback : Janus.noop;
			if (config == null) config = { audio: true, video: true };
			if(navigator.mediaDevices) {
				navigator.mediaDevices.getUserMedia(config)
				.then(function(stream) {
					navigator.mediaDevices.enumerateDevices().then(function(devices) {
						Janus.debug(devices);
						callback(devices);
						// Get rid of the now useless stream
						try {
							var tracks = stream.getTracks();
							for(var i in tracks) {
								var mst = tracks[i];
								if(mst !== null && mst !== undefined)
									mst.stop();
							}
						} catch(e) {}
					});
				})
				.catch(function(err) {
					Janus.error(err);
					callback([]);
				});
			} else {
				Janus.warn("navigator.mediaDevices unavailable");
				callback([]);
			}
		};
		// Helper methods to attach/reattach a stream to a video element (previously part of adapter.js)
		Janus.attachMediaStream = function(element, stream) {
			if(Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
				var chromever = Janus.webRTCAdapter.browserDetails.version;
				if(chromever >= 43) {
					element.srcObject = stream;
				} else if(typeof element.src !== 'undefined') {
					element.src = URL.createObjectURL(stream);
				} else {
					Janus.error("Error attaching stream to element");
				}
			} else {
				element.srcObject = stream;
			}
		};
		Janus.reattachMediaStream = function(to, from) {
			if(Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
				var chromever = Janus.webRTCAdapter.browserDetails.version;
				if(chromever >= 43) {
					to.srcObject = from.srcObject;
				} else if(typeof to.src !== 'undefined') {
					to.src = from.src;
				} else {
					Janus.error("Error reattaching stream to element");
				}
			} else {
				to.srcObject = from.srcObject;
			}
		};
		// Detect tab close: make sure we don't loose existing onbeforeunload handlers
		var oldOBF = window.onbeforeunload;
		window.onbeforeunload = function() {
			Janus.log("Closing window");
			for(var s in Janus.sessions) {
				if(Janus.sessions[s] !== null && Janus.sessions[s] !== undefined &&
						Janus.sessions[s].destroyOnUnload) {
					Janus.log("Destroying session " + s);
					Janus.sessions[s].destroy({asyncRequest: false});
				}
			}
			if(oldOBF && typeof oldOBF == "function")
				oldOBF();
		};
		Janus.initDone = true;
		options.callback();
	}
};

// Helper method to check whether WebRTC is supported by this browser
Janus.isWebrtcSupported = function() {
	return window.RTCPeerConnection !== undefined && window.RTCPeerConnection !== null &&
		navigator.getUserMedia !== undefined && navigator.getUserMedia !== null;
};

// Helper method to create random identifiers (e.g., transaction)
Janus.randomString = function(len) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}
	return randomString;
};


function Janus(gatewayCallbacks) {
	if(Janus.initDone === undefined) {
		gatewayCallbacks.error("Library not initialized");
		return {};
	}
	if(!Janus.isWebrtcSupported()) {
		gatewayCallbacks.error("WebRTC not supported by this browser");
		return {};
	}
	Janus.log("Library initialized: " + Janus.initDone);
	gatewayCallbacks = gatewayCallbacks || {};
	gatewayCallbacks.success = (typeof gatewayCallbacks.success == "function") ? gatewayCallbacks.success : Janus.noop;
	gatewayCallbacks.error = (typeof gatewayCallbacks.error == "function") ? gatewayCallbacks.error : Janus.noop;
	gatewayCallbacks.destroyed = (typeof gatewayCallbacks.destroyed == "function") ? gatewayCallbacks.destroyed : Janus.noop;
	if(gatewayCallbacks.server === null || gatewayCallbacks.server === undefined) {
		gatewayCallbacks.error("Invalid gateway url");
		return {};
	}
	var websockets = false;
	var ws = null;
	var wsHandlers = {};
	var wsKeepaliveTimeoutId = null;

	var servers = null, serversIndex = 0;
	var server = gatewayCallbacks.server;
	if(Janus.isArray(server)) {
		Janus.log("Multiple servers provided (" + server.length + "), will use the first that works");
		server = null;
		servers = gatewayCallbacks.server;
		Janus.debug(servers);
	} else {
		if(server.indexOf("ws") === 0) {
			websockets = true;
			Janus.log("Using WebSockets to contact Janus: " + server);
		} else {
			websockets = false;
			Janus.log("Using REST API to contact Janus: " + server);
		}
	}
	var iceServers = gatewayCallbacks.iceServers;
	if(iceServers === undefined || iceServers === null)
		iceServers = [{urls: "stun:stun.l.google.com:19302"}];
	var iceTransportPolicy = gatewayCallbacks.iceTransportPolicy;
	var bundlePolicy = gatewayCallbacks.bundlePolicy;
	// Whether IPv6 candidates should be gathered
	var ipv6Support = gatewayCallbacks.ipv6;
	if(ipv6Support === undefined || ipv6Support === null)
		ipv6Support = false;
	// Whether we should enable the withCredentials flag for XHR requests
	var withCredentials = false;
	if(gatewayCallbacks.withCredentials !== undefined && gatewayCallbacks.withCredentials !== null)
		withCredentials = gatewayCallbacks.withCredentials === true;
	// Optional max events
	var maxev = null;
	if(gatewayCallbacks.max_poll_events !== undefined && gatewayCallbacks.max_poll_events !== null)
		maxev = gatewayCallbacks.max_poll_events;
	if(maxev < 1)
		maxev = 1;
	// Token to use (only if the token based authentication mechanism is enabled)
	var token = null;
	if(gatewayCallbacks.token !== undefined && gatewayCallbacks.token !== null)
		token = gatewayCallbacks.token;
	// API secret to use (only if the shared API secret is enabled)
	var apisecret = null;
	if(gatewayCallbacks.apisecret !== undefined && gatewayCallbacks.apisecret !== null)
		apisecret = gatewayCallbacks.apisecret;
	// Whether we should destroy this session when onbeforeunload is called
	this.destroyOnUnload = true;
	if(gatewayCallbacks.destroyOnUnload !== undefined && gatewayCallbacks.destroyOnUnload !== null)
		this.destroyOnUnload = (gatewayCallbacks.destroyOnUnload === true);

	var connected = false;
	// var reconnected = false;
	// var reconnecting = false;
	var sessionId = null;
	var pluginHandles = {};
	var that = this;
	var retries = 0;
	var transactions = {};
	createSession(gatewayCallbacks);

	// Public methods
	this.getServer = function() { return server; };
	this.isConnected = function() { return connected; };
	this.getSessionId = function() { return sessionId; };
	this.destroy = function(callbacks) { destroySession(callbacks); };
	this.attach = function(callbacks) { createHandle(callbacks); };
	this.timeoutSessionCallback = (typeof gatewayCallbacks.timeoutSessionCallback == "function") ? gatewayCallbacks.timeoutSessionCallback : Janus.noop;

	function eventHandler() {
		if(sessionId == null)
			return;
		Janus.debug('Long poll...');
		if(!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			return;
		}
		var longpoll = server + "/" + sessionId + "?rid=" + new Date().getTime();
		if(maxev !== undefined && maxev !== null)
			longpoll = longpoll + "&maxev=" + maxev;
		if(token !== null && token !== undefined)
			longpoll = longpoll + "&token=" + token;
		if(apisecret !== null && apisecret !== undefined)
			longpoll = longpoll + "&apisecret=" + apisecret;
		Janus.httpAPICall(longpoll, {
			verb: 'GET',
			withCredentials: withCredentials,
			success: handleEvent,
			timeout: 60000,	// FIXME
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ": " + errorThrown);
				retries++;
				if(retries > 3) {
					// Did we just lose the gateway? :-(
					connected = false;
					gatewayCallbacks.error("Lost connection to the gateway (is it down?)");
					return;
				}
				eventHandler();
			}
		});
	}

	// Private event handler: this will trigger plugin callbacks, if set
	function handleEvent(json, skipTimeout) {
		retries = 0;
		if(!websockets && sessionId !== undefined && sessionId !== null && skipTimeout !== true)
			setTimeout(eventHandler, 200);
		if(!websockets && Janus.isArray(json)) {
			// We got an array: it means we passed a maxev > 1, iterate on all objects
			for(var i=0; i<json.length; i++) {
				handleEvent(json[i], true);
			}
			return;
		}
		if(json["janus"] === "keepalive") {
			// Nothing happened
			Janus.vdebug("Got a keepalive on session " + sessionId);
			return;
		} else if(json["janus"] === "ack") {
			// Just an ack, we can probably ignore
			Janus.debug("Got an ack on session " + sessionId);
			Janus.debug(json);
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["janus"] === "success") {
			// Success!
			Janus.debug("Got a success on session " + sessionId);
			Janus.debug(json);
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["janus"] === "webrtcup") {
			// The PeerConnection with the gateway is up! Notify this
			Janus.debug("Got a webrtcup event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.webrtcState(true);
			return;
		} else if(json["janus"] === "hangup") {
			// A plugin asked the core to hangup a PeerConnection on one of our handles
			Janus.debug("Got a hangup event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.webrtcState(false, json["reason"]);
			pluginHandle.hangup();
		} else if(json["janus"] === "detached") {
			// A plugin asked the core to detach one of our handles
			Janus.debug("Got a detached event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				// Don't warn here because destroyHandle causes this situation.
				return;
			}
			pluginHandle.detached = true;
			pluginHandle.ondetached();
			pluginHandle.detach();
		} else if(json["janus"] === "media") {
			// Media started/stopped flowing
			Janus.debug("Got a media event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.mediaState(json["type"], json["receiving"]);
		} else if(json["janus"] === "slowlink") {
			Janus.debug("Got a slowlink event on session " + sessionId);
			Janus.debug(json);
			// Trouble uplink or downlink
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.slowLink(json["uplink"], json["nacks"]);
		} else if(json["janus"] === "error") {
			// Oops, something wrong happened
			Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
			Janus.debug(json);
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["janus"] === "event") {
			Janus.debug("Got a plugin event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var plugindata = json["plugindata"];
			if(plugindata === undefined || plugindata === null) {
				Janus.warn("Missing plugindata...");
				return;
			}
			Janus.debug("  -- Event is coming from " + sender + " (" + plugindata["plugin"] + ")");
			var data = plugindata["data"];
			Janus.debug(data);
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.warn("This handle is not attached to this session");
				return;
			}
			var jsep = json["jsep"];
			if(jsep !== undefined && jsep !== null) {
				Janus.debug("Handling SDP as well...");
				Janus.debug(jsep);
			}
			var callback = pluginHandle.onmessage;
			if(callback !== null && callback !== undefined) {
				Janus.debug("Notifying application...");
				// Send to callback specified when attaching plugin handle
				callback(data, jsep);
			} else {
				// Send to generic callback (?)
				Janus.debug("No provided notification callback");
			}
		} else if(json["janus"] === "timeout") {
			var sessionId = json["session_id"];
			var session = Janus.sessions[sessionId];
			if(session){
				session.timeoutSessionCallback();
			}
		} else {
			Janus.warn("Unkown message/event  '" + json["janus"] + "' on session " + sessionId);
			Janus.debug(json);
		}
	}

	// Private helper to send keep-alive messages on WebSockets
	function keepAlive() {
		if(server === null || !websockets || !connected)
			return;
		wsKeepaliveTimeoutId = setTimeout(keepAlive, 30000);
		var request = { "janus": "keepalive", "session_id": sessionId, "transaction": Janus.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		ws.send(JSON.stringify(request));
	}

	// Private method to create a session
	function createSession(callbacks) {
		var transaction = Janus.randomString(12);
		var request = { "janus": "create", "transaction": transaction };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(server === null && Janus.isArray(servers)) {
			// We still need to find a working server from the list we were given
			server = servers[serversIndex];
			if(server.indexOf("ws") === 0) {
				websockets = true;
				Janus.log("Server #" + (serversIndex+1) + ": trying WebSockets to contact Janus (" + server + ")");
			} else {
				websockets = false;
				Janus.log("Server #" + (serversIndex+1) + ": trying REST API to contact Janus (" + server + ")");
			}
		}
		if(websockets) {
			ws = Janus.newWebSocket(server, 'janus-protocol');
			wsHandlers = {
				'error': function() {
					console.warn("WS error");

					Janus.error("Error connecting to the Janus WebSockets server... " + server);
					if (Janus.isArray(servers)) {
						serversIndex++;
						if (serversIndex == servers.length) {
							// We tried all the servers the user gave us and they all failed
							callbacks.error("Error connecting to any of the provided Janus servers: Is the gateway down?");
							return;
						}
						// Let's try the next server
						server = null;
						setTimeout(function() {
							createSession(callbacks);
						}, 200);
						return;
					}
					callbacks.error("Error connecting to the Janus WebSockets server: Is the gateway down?");
				},

				'open': function() {
					console.warn("WS connected");

					// if(reconnecting){
					// 	reconnecting = false;
					// 	reconnected = true;
					// 	console.warn("WS reconnected");
					// }

					// if(!reconnected){
						// We need to be notified about the success
						transactions[transaction] = function(json) {
							Janus.debug(json);
							if (json["janus"] !== "success") {
								Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
								callbacks.error(json["error"].reason);
								return;
							}
							wsKeepaliveTimeoutId = setTimeout(keepAlive, 30000);
							connected = true;
							sessionId = json.data["id"];
							Janus.log("Created session: " + sessionId);
							Janus.sessions[sessionId] = that;
							callbacks.success();
						};
						ws.send(JSON.stringify(request));
					// }else{
					// 	connected = true;
					// }
				},

				'message': function(event) {
					handleEvent(JSON.parse(event.data));
				},

				'close': function() {
					if (server === null || !connected) {
						return;
					}
					// if(connected){
					// 	reconnecting = false;
					// }
					connected = false;
					// reconnected = false;

					console.warn("WS close");
					// // reconnection
					// //
					// // Try to reconnect in 5 seconds
					// setTimeout(function(){
					// 	reconnecting = true;
					// 	console.warn("WS reconnection");
					// 	createSession(callbacks);
					// }, 2000);


					// FIXME What if this is called when the page is closed?
					gatewayCallbacks.error("Lost connection to the gateway (is it down?)");
				}
			};

			for(var eventName in wsHandlers) {
				ws.addEventListener(eventName, wsHandlers[eventName]);
			}

			return;
		}
		Janus.httpAPICall(server, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					callbacks.error(json["error"].reason);
					return;
				}
				connected = true;
				sessionId = json.data["id"];
				Janus.log("Created session: " + sessionId);
				Janus.sessions[sessionId] = that;
				eventHandler();
				callbacks.success();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ": " + errorThrown);	// FIXME
				if(Janus.isArray(servers)) {
					serversIndex++;
					if(serversIndex == servers.length) {
						// We tried all the servers the user gave us and they all failed
						callbacks.error("Error connecting to any of the provided Janus servers: Is the gateway down?");
						return;
					}
					// Let's try the next server
					server = null;
					setTimeout(function() { createSession(callbacks); }, 200);
					return;
				}
				if(errorThrown === "")
					callbacks.error(textStatus + ": Is the gateway down?");
				else
					callbacks.error(textStatus + ": " + errorThrown);
			}
		});
	}

	// Private method to destroy a session
	function destroySession(callbacks) {
		callbacks = callbacks || {};
		// FIXME This method triggers a success even when we fail
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		var asyncRequest = true;
		if(callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null)
			asyncRequest = (callbacks.asyncRequest === true);
		Janus.log("Destroying session " + sessionId + " (async=" + asyncRequest + ")");
		if(!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.success();
			return;
		}
		if(sessionId === undefined || sessionId === null) {
			Janus.warn("No session to destroy");
			callbacks.success();
			gatewayCallbacks.destroyed();
			return;
		}
		delete Janus.sessions[sessionId];
		// No need to destroy all handles first, Janus will do that itself
		var request = { "janus": "destroy", "transaction": Janus.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(websockets) {
			request["session_id"] = sessionId;

			var unbindWebSocket = function() {
				for(var eventName in wsHandlers) {
					ws.removeEventListener(eventName, wsHandlers[eventName]);
				}
				ws.removeEventListener('message', onUnbindMessage);
				ws.removeEventListener('error', onUnbindError);
				if(wsKeepaliveTimeoutId) {
					clearTimeout(wsKeepaliveTimeoutId);
				}
				ws.close();
			};

			var onUnbindMessage = function(event){
				var data = JSON.parse(event.data);
				if(data.session_id == request.session_id && data.transaction == request.transaction) {
					unbindWebSocket();
					callbacks.success();
					gatewayCallbacks.destroyed();
				}
			};
			var onUnbindError = function(event) {
				unbindWebSocket();
				callbacks.error("Failed to destroy the gateway: Is the gateway down?");
				gatewayCallbacks.destroyed();
			};

			ws.addEventListener('message', onUnbindMessage);
			ws.addEventListener('error', onUnbindError);

			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId, {
			verb: 'POST',
			async: asyncRequest,	// Sometimes we need false here, or destroying in onbeforeunload won't work
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.log("Destroyed session:");
				Janus.debug(json);
				sessionId = null;
				connected = false;
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
				}
				callbacks.success();
				gatewayCallbacks.destroyed();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ": " + errorThrown);	// FIXME
				// Reset everything anyway
				sessionId = null;
				connected = false;
				callbacks.success();
				gatewayCallbacks.destroyed();
			}
		});
	}

	// Private method to create a plugin handle
	function createHandle(callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		callbacks.consentDialog = (typeof callbacks.consentDialog == "function") ? callbacks.consentDialog : Janus.noop;
		callbacks.iceState = (typeof callbacks.iceState == "function") ? callbacks.iceState : Janus.noop;
		callbacks.mediaState = (typeof callbacks.mediaState == "function") ? callbacks.mediaState : Janus.noop;
		callbacks.webrtcState = (typeof callbacks.webrtcState == "function") ? callbacks.webrtcState : Janus.noop;
		callbacks.slowLink = (typeof callbacks.slowLink == "function") ? callbacks.slowLink : Janus.noop;
		callbacks.onmessage = (typeof callbacks.onmessage == "function") ? callbacks.onmessage : Janus.noop;
		callbacks.onlocalstream = (typeof callbacks.onlocalstream == "function") ? callbacks.onlocalstream : Janus.noop;
		callbacks.onremotestream = (typeof callbacks.onremotestream == "function") ? callbacks.onremotestream : Janus.noop;
		callbacks.ondata = (typeof callbacks.ondata == "function") ? callbacks.ondata : Janus.noop;
		callbacks.ondataopen = (typeof callbacks.ondataopen == "function") ? callbacks.ondataopen : Janus.noop;
		callbacks.oncleanup = (typeof callbacks.oncleanup == "function") ? callbacks.oncleanup : Janus.noop;
		callbacks.ondetached = (typeof callbacks.ondetached == "function") ? callbacks.ondetached : Janus.noop;
		if(!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.error("Is the gateway down? (connected=false)");
			return;
		}
		var plugin = callbacks.plugin;
		if(plugin === undefined || plugin === null) {
			Janus.error("Invalid plugin");
			callbacks.error("Invalid plugin");
			return;
		}
		var opaqueId = callbacks.opaqueId;
		var transaction = Janus.randomString(12);
		var request = { "janus": "attach", "plugin": plugin, "opaque_id": opaqueId, "transaction": transaction };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		// If we know the browser supports BUNDLE and/or rtcp-mux, let's advertise those right away
		if(Janus.webRTCAdapter.browserDetails.browser == "chrome" || Janus.webRTCAdapter.browserDetails.browser == "firefox" ||
				Janus.webRTCAdapter.browserDetails.browser == "safari") {
			request["force-bundle"] = true;
			request["force-rtcp-mux"] = true;
		}
		if(websockets) {
			transactions[transaction] = function(json) {
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
					return;
				}
				var handleId = json.data["id"];
				Janus.log("Created handle: " + handleId);
				var pluginHandle =
					{
						session : that,
						plugin : plugin,
						id : handleId,
						detached : false,
						webrtcStuff : {
							started : false,
							myStream : null,
							streamExternal : false,
							remoteStream : null,
							mySdp : null,
							mediaConstraints : null,
							pc : null,
							dataChannel : null,
							dtmfSender : null,
							trickle : true,
							iceDone : false,
							volume : {
								value : null,
								timer : null
							},
							bitrate : {
								value : null,
								bsnow : null,
								bsbefore : null,
								tsnow : null,
								tsbefore : null,
								timer : null
							}
						},
						getId : function() { return handleId; },
						getPlugin : function() { return plugin; },
						getVolume : function() { return getVolume(handleId); },
						isAudioMuted : function() { return isMuted(handleId, false); },
						muteAudio : function() { return mute(handleId, false, true); },
						unmuteAudio : function() { return mute(handleId, false, false); },
						isVideoMuted : function() { return isMuted(handleId, true); },
						muteVideo : function() { return mute(handleId, true, true); },
						unmuteVideo : function() { return mute(handleId, true, false); },
						getBitrate : function() { return getBitrate(handleId); },
						send : function(callbacks) { sendMessage(handleId, callbacks); },
						data : function(callbacks) { sendData(handleId, callbacks); },
						dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
						consentDialog : callbacks.consentDialog,
						iceState : callbacks.iceState,
						mediaState : callbacks.mediaState,
						webrtcState : callbacks.webrtcState,
						slowLink : callbacks.slowLink,
						onmessage : callbacks.onmessage,
						createOffer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
						createAnswer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
						handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
						onlocalstream : callbacks.onlocalstream,
						onremotestream : callbacks.onremotestream,
						ondata : callbacks.ondata,
						ondataopen : callbacks.ondataopen,
						oncleanup : callbacks.oncleanup,
						ondetached : callbacks.ondetached,
						hangup : function(sendRequest) { cleanupWebrtc(handleId, sendRequest === true); },
						detach : function(callbacks) { destroyHandle(handleId, callbacks); }
					};
				pluginHandles[handleId] = pluginHandle;
				callbacks.success(pluginHandle);
			};
			request["session_id"] = sessionId;
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
					return;
				}
				var handleId = json.data["id"];
				Janus.log("Created handle: " + handleId);
				var pluginHandle =
					{
						session : that,
						plugin : plugin,
						id : handleId,
						detached : false,
						webrtcStuff : {
							started : false,
							myStream : null,
							streamExternal : false,
							remoteStream : null,
							mySdp : null,
							mediaConstraints : null,
							pc : null,
							dataChannel : null,
							dtmfSender : null,
							trickle : true,
							iceDone : false,
							volume : {
								value : null,
								timer : null
							},
							bitrate : {
								value : null,
								bsnow : null,
								bsbefore : null,
								tsnow : null,
								tsbefore : null,
								timer : null
							}
						},
						getId : function() { return handleId; },
						getPlugin : function() { return plugin; },
						getVolume : function() { return getVolume(handleId); },
						isAudioMuted : function() { return isMuted(handleId, false); },
						muteAudio : function() { return mute(handleId, false, true); },
						unmuteAudio : function() { return mute(handleId, false, false); },
						isVideoMuted : function() { return isMuted(handleId, true); },
						muteVideo : function() { return mute(handleId, true, true); },
						unmuteVideo : function() { return mute(handleId, true, false); },
						getBitrate : function() { return getBitrate(handleId); },
						send : function(callbacks) { sendMessage(handleId, callbacks); },
						data : function(callbacks) { sendData(handleId, callbacks); },
						dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
						consentDialog : callbacks.consentDialog,
						iceState : callbacks.iceState,
						mediaState : callbacks.mediaState,
						webrtcState : callbacks.webrtcState,
						slowLink : callbacks.slowLink,
						onmessage : callbacks.onmessage,
						createOffer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
						createAnswer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
						handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
						onlocalstream : callbacks.onlocalstream,
						onremotestream : callbacks.onremotestream,
						ondata : callbacks.ondata,
						ondataopen : callbacks.ondataopen,
						oncleanup : callbacks.oncleanup,
						ondetached : callbacks.ondetached,
						hangup : function(sendRequest) { cleanupWebrtc(handleId, sendRequest === true); },
						detach : function(callbacks) { destroyHandle(handleId, callbacks); }
					};
				pluginHandles[handleId] = pluginHandle;
				callbacks.success(pluginHandle);
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ": " + errorThrown);	// FIXME
			}
		});
	}

	// Private method to send a message
	function sendMessage(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		if(!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.error("Is the gateway down? (connected=false)");
			return;
		}
		var message = callbacks.message;
		var jsep = callbacks.jsep;
		var transaction = Janus.randomString(12);
		var request = { "janus": "message", "body": message, "transaction": transaction };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(jsep !== null && jsep !== undefined)
			request.jsep = jsep;
		Janus.debug("Sending message to plugin (handle=" + handleId + "):");
		Janus.debug(request);
		if(websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			transactions[transaction] = function(json) {
				Janus.debug("Message sent!");
				Janus.debug(json);
				if(json["janus"] === "success") {
					// We got a success, must have been a synchronous transaction
					var plugindata = json["plugindata"];
					if(plugindata === undefined || plugindata === null) {
						Janus.warn("Request succeeded, but missing plugindata...");
						callbacks.success();
						return;
					}
					Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
					var data = plugindata["data"];
					Janus.debug(data);
					callbacks.success(data);
					return;
				} else if(json["janus"] !== "ack") {
					// Not a success and not an ack, must be an error
					if(json["error"] !== undefined && json["error"] !== null) {
						Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
						callbacks.error(json["error"].code + " " + json["error"].reason);
					} else {
						Janus.error("Unknown error");	// FIXME
						callbacks.error("Unknown error");
					}
					return;
				}
				// If we got here, the plugin decided to handle the request asynchronously
				callbacks.success();
			};
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.debug("Message sent!");
				Janus.debug(json);
				if(json["janus"] === "success") {
					// We got a success, must have been a synchronous transaction
					var plugindata = json["plugindata"];
					if(plugindata === undefined || plugindata === null) {
						Janus.warn("Request succeeded, but missing plugindata...");
						callbacks.success();
						return;
					}
					Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
					var data = plugindata["data"];
					Janus.debug(data);
					callbacks.success(data);
					return;
				} else if(json["janus"] !== "ack") {
					// Not a success and not an ack, must be an error
					if(json["error"] !== undefined && json["error"] !== null) {
						Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
						callbacks.error(json["error"].code + " " + json["error"].reason);
					} else {
						Janus.error("Unknown error");	// FIXME
						callbacks.error("Unknown error");
					}
					return;
				}
				// If we got here, the plugin decided to handle the request asynchronously
				callbacks.success();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ": " + errorThrown);	// FIXME
				callbacks.error(textStatus + ": " + errorThrown);
			}
		});
	}

	// Private method to send a trickle candidate
	function sendTrickleCandidate(handleId, candidate) {
		if(!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			return;
		}
		var request = { "janus": "trickle", "candidate": candidate, "transaction": Janus.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		Janus.vdebug("Sending trickle candidate (handle=" + handleId + "):");
		Janus.vdebug(request);
		if(websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.vdebug("Candidate sent!");
				Janus.vdebug(json);
				if(json["janus"] !== "ack") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					return;
				}
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ": " + errorThrown);	// FIXME
			}
		});
	}

	// Private method to send a data channel message
	function sendData(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var text = callbacks.text;
		if(text === null || text === undefined) {
			Janus.warn("Invalid text");
			callbacks.error("Invalid text");
			return;
		}
		Janus.log("Sending string on data channel: " + text);
		config.dataChannel.send(text);
		callbacks.success();
	}

	// Private method to send a DTMF tone
	function sendDtmf(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if(config.dtmfSender === null || config.dtmfSender === undefined) {
			// Create the DTMF sender, if possible
			if(config.myStream !== undefined && config.myStream !== null) {
				var tracks = config.myStream.getAudioTracks();
				if(tracks !== null && tracks !== undefined && tracks.length > 0) {
					var local_audio_track = tracks[0];
					config.dtmfSender = config.pc.createDTMFSender(local_audio_track);
					Janus.log("Created DTMF Sender");
					config.dtmfSender.ontonechange = function(tone) { Janus.debug("Sent DTMF tone: " + tone.tone); };
				}
			}
			if(config.dtmfSender === null || config.dtmfSender === undefined) {
				Janus.warn("Invalid DTMF configuration");
				callbacks.error("Invalid DTMF configuration");
				return;
			}
		}
		var dtmf = callbacks.dtmf;
		if(dtmf === null || dtmf === undefined) {
			Janus.warn("Invalid DTMF parameters");
			callbacks.error("Invalid DTMF parameters");
			return;
		}
		var tones = dtmf.tones;
		if(tones === null || tones === undefined) {
			Janus.warn("Invalid DTMF string");
			callbacks.error("Invalid DTMF string");
			return;
		}
		var duration = dtmf.duration;
		if(duration === null || duration === undefined)
			duration = 500;	// We choose 500ms as the default duration for a tone
		var gap = dtmf.gap;
		if(gap === null || gap === undefined)
			gap = 50;	// We choose 50ms as the default gap between tones
		Janus.debug("Sending DTMF string " + tones + " (duration " + duration + "ms, gap " + gap + "ms)");
		config.dtmfSender.insertDTMF(tones, duration, gap);
	}

	// Private method to destroy a plugin handle
	function destroyHandle(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var asyncRequest = true;
		if(callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null)
			asyncRequest = (callbacks.asyncRequest === true);
		Janus.log("Destroying handle " + handleId + " (async=" + asyncRequest + ")");
		cleanupWebrtc(handleId);
		if (pluginHandles[handleId].detached) {
			// Plugin was already detached by Janus, calling detach again will return a handle not found error, so just exit here
			delete pluginHandles[handleId];
			callbacks.success();
			return;
		}
		if(!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.error("Is the gateway down? (connected=false)");
			return;
		}
		var request = { "janus": "detach", "transaction": Janus.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			ws.send(JSON.stringify(request));
			delete pluginHandles[handleId];
			callbacks.success();
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			async: asyncRequest,	// Sometimes we need false here, or destroying in onbeforeunload won't work
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.log("Destroyed handle:");
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
				}
				delete pluginHandles[handleId];
				callbacks.success();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ": " + errorThrown);	// FIXME
				// We cleanup anyway
				delete pluginHandles[handleId];
				callbacks.success();
			}
		});
	}

	// WebRTC stuff
	function streamsDone(handleId, jsep, media, callbacks, stream) {
		console.warn("streamsDone", media);
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		Janus.debug("streamsDone:", stream);
		if(stream) {
			Janus.debug("  -- Audio tracks:", stream.getAudioTracks());
			Janus.debug("  -- Video tracks:", stream.getVideoTracks());
		}
		// If we're updating, check if we need to remove/replace one of the tracks
		if(media.update && !config.streamExternal) {
			if(media.removeAudio || media.replaceAudio) {
				if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
					Janus.log("Removing audio track:", config.myStream.getAudioTracks()[0]);
					config.myStream.removeTrack(config.myStream.getAudioTracks()[0]);
				}
				if(config.pc.getSenders() && config.pc.getSenders().length) {
					for(var index in config.pc.getSenders()) {
						var s = config.pc.getSenders()[index];
						if(s && s.track && s.track.kind === "audio") {
							Janus.log("Removing audio sender:", s);
							config.pc.removeTrack(s);
						}
					}
				}
			}
			if(media.removeVideo || media.replaceVideo) {
				if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
					Janus.log("Removing video track:", config.myStream.getVideoTracks()[0]);
					config.myStream.removeTrack(config.myStream.getVideoTracks()[0]);
				}
				if(config.pc.getSenders() && config.pc.getSenders().length) {
					for(var index in config.pc.getSenders()) {
						var s = config.pc.getSenders()[index];
						if(s && s.track && s.track.kind === "video") {
							Janus.log("Removing video sender:", s);
							config.pc.removeTrack(s);
						}
					}
				}
			}
		}
		// We're now capturing the new stream: check if we're updating or if it's a new thing
		var addTracks = false;
		if(!config.myStream || !media.update || config.streamExternal) {
			config.myStream = stream;
			addTracks = true;
		} else {
			// We only need to update the existing stream
			if(((!media.update && isAudioSendEnabled(media)) || (media.update && (media.addAudio || media.replaceAudio))) &&
					stream.getAudioTracks() && stream.getAudioTracks().length) {
				Janus.log("Adding audio track:", stream.getAudioTracks()[0]);
				config.myStream.addTrack(stream.getAudioTracks()[0]);
				config.pc.addTrack(stream.getAudioTracks()[0], stream);
			}
			if(((!media.update && isVideoSendEnabled(media)) || (media.update && (media.addVideo || media.replaceVideo))) &&
					stream.getVideoTracks() && stream.getVideoTracks().length) {
				Janus.log("Adding video track:", stream.getVideoTracks()[0]);
				config.myStream.addTrack(stream.getVideoTracks()[0]);
				config.pc.addTrack(stream.getVideoTracks()[0], stream);
			}
		}
		// If we still need to create a PeerConnection, let's do that
		if(!config.pc) {
			var pc_config = {"iceServers": iceServers, "iceTransportPolicy": iceTransportPolicy, "bundlePolicy": bundlePolicy};
			//~ var pc_constraints = {'mandatory': {'MozDontOfferDataChannel':true}};
			var pc_constraints = {
				"optional": [{"DtlsSrtpKeyAgreement": true}]
			};
			if(ipv6Support === true) {
				// FIXME This is only supported in Chrome right now
				// For support in Firefox track this: https://bugzilla.mozilla.org/show_bug.cgi?id=797262
				pc_constraints.optional.push({"googIPv6":true});
			}
			// Any custom constraint to add?
			if(callbacks.rtcConstraints && typeof callbacks.rtcConstraints === 'object') {
				Janus.debug("Adding custom PeerConnection constraints:", callbacks.rtcConstraints);
				for(var i in callbacks.rtcConstraints) {
					pc_constraints.optional.push(callbacks.rtcConstraints[i]);
				}
			}
			if(Janus.webRTCAdapter.browserDetails.browser === "edge") {
				// This is Edge, enable BUNDLE explicitly
				pc_config.bundlePolicy = "max-bundle";
			}
			Janus.log("Creating PeerConnection");
			Janus.debug(pc_constraints);
			config.pc = new RTCPeerConnection(pc_config, pc_constraints);
			Janus.debug(config.pc);
			if(config.pc.getStats) {	// FIXME
				config.volume.value = 0;
				config.bitrate.value = "0 kbits/sec";
			}
			Janus.log("Preparing local SDP and gathering candidates (trickle=" + config.trickle + ")");
			config.pc.oniceconnectionstatechange = function(e) {
				if(config.pc)
					pluginHandle.iceState(config.pc.iceConnectionState);
			};
			config.pc.onicecandidate = function(event) {
				if (event.candidate == null ||
						(Janus.webRTCAdapter.browserDetails.browser === 'edge' && event.candidate.candidate.indexOf('endOfCandidates') > 0)) {
					Janus.log("End of candidates.");
					config.iceDone = true;
					if(config.trickle === true) {
						// Notify end of candidates
						sendTrickleCandidate(handleId, {"completed": true});
					} else {
						// No trickle, time to send the complete SDP (including all candidates)
						sendSDP(handleId, callbacks);
					}
				} else {
					// JSON.stringify doesn't work on some WebRTC objects anymore
					// See https://code.google.com/p/chromium/issues/detail?id=467366
					var candidate = {
						"candidate": event.candidate.candidate,
						"sdpMid": event.candidate.sdpMid,
						"sdpMLineIndex": event.candidate.sdpMLineIndex
					};
					if(config.trickle === true) {
						// Send candidate
						sendTrickleCandidate(handleId, candidate);
					}
				}
			};
			config.pc.ontrack = function(event) {
				Janus.log("Handling Remote Track");
				Janus.debug(event);
				if(!event.streams)
					return;
				config.remoteStream = event.streams[0];
				pluginHandle.onremotestream(config.remoteStream);
				if(event.track && !event.track.onended) {
					Janus.log("Adding onended callback to track:", event.track);
					event.track.onended = function(ev) {
						Janus.log("Remote track removed:", ev);
						if(config.remoteStream) {
							config.remoteStream.removeTrack(ev.target);
							pluginHandle.onremotestream(config.remoteStream);
						}
					};
				}
			};
		}
		if(addTracks && stream !== null && stream !== undefined) {
			Janus.log('Adding local stream');
			stream.getTracks().forEach(function(track) { config.pc.addTrack(track, stream); });
		}
		// Any data channel to create?
		if(isDataEnabled(media) && !config.dataChannel) {
			Janus.log("Creating data channel");
			var onDataChannelMessage = function(event) {
				Janus.log('Received message on data channel: ' + event.data);
				pluginHandle.ondata(event.data);	// FIXME
			};
			var onDataChannelStateChange = function() {
				var dcState = config.dataChannel !== null ? config.dataChannel.readyState : "null";
				Janus.log('State change on data channel: ' + dcState);
				if(dcState === 'open') {
					pluginHandle.ondataopen();	// FIXME
				}
			};
			var onDataChannelError = function(error) {
				Janus.error('Got error on data channel:', error);
				// TODO
			};
			// Until we implement the proxying of open requests within the Janus core, we open a channel ourselves whatever the case
			config.dataChannel = config.pc.createDataChannel("JanusDataChannel", {ordered:false});	// FIXME Add options (ordered, maxRetransmits, etc.)
			config.dataChannel.onmessage = onDataChannelMessage;
			config.dataChannel.onopen = onDataChannelStateChange;
			config.dataChannel.onclose = onDataChannelStateChange;
			config.dataChannel.onerror = onDataChannelError;
		}
		// If there's a new local stream, let's notify the application
		if(config.myStream)
			pluginHandle.onlocalstream(config.myStream);
		// Create offer/answer now
		if(jsep === null || jsep === undefined) {
			createOffer(handleId, media, callbacks);
		} else {
			config.pc.setRemoteDescription(
					new RTCSessionDescription(jsep),
					function() {
						Janus.log("Remote description accepted!");
						createAnswer(handleId, media, callbacks);
					}, callbacks.error);
		}
	}

	function prepareWebrtc(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		callbacks.media = callbacks.media || { audio: true, video: true };
		var media = callbacks.media;
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		// Are we updating a session?
		if(config.pc === undefined || config.pc === null) {
			// Nope, new PeerConnection
			media.update = false;
		} else if(config.pc !== undefined && config.pc !== null) {
			Janus.log("Updating existing media session");
			media.update = true;
			// Check if there's anything do add/remove/replace, or if we
			// can go directly to preparing the new SDP offer or answer
			if(callbacks.stream !== null && callbacks.stream !== undefined) {
				// External stream: is this the same as the one we were using before?
				if(callbacks.stream !== config.myStream) {
					Janus.log("Renegotiation involves a new external stream");
				}
			} else {
				// Check if there are changes on audio
				if(media.addAudio) {
					media.replaceAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
					if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
						Janus.error("Can't add audio stream, there already is one");
						callbacks.error("Can't add audio stream, there already is one");
						return;
					}
				} else if(media.removeAudio) {
					media.replaceAudio = false;
					media.addAudio = false;
					media.audioSend = false;
				} else if(media.replaceAudio) {
					media.addAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
				}
				if(config.myStream === null || config.myStream === undefined) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if(media.replaceAudio) {
						media.replaceAudio = false;
						media.addAudio = true;
						media.audioSend = true;
					}
					if(isAudioSendEnabled(media))
						media.addAudio = true;
				} else {
					if(config.myStream.getAudioTracks() === null
							|| config.myStream.getAudioTracks() === undefined
							|| config.myStream.getAudioTracks().length === 0) {
						// No audio track: if we were asked to replace, it's actually an "add"
						if(media.replaceAudio) {
							media.replaceAudio = false;
							media.addAudio = true;
							media.audioSend = true;
						}
						if(isAudioSendEnabled(media))
							media.addAudio = true;
					}
				}
				// Check if there are changes on video
				if(media.addVideo) {
					media.replaceVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
					if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
						Janus.error("Can't add video stream, there already is one");
						callbacks.error("Can't add video stream, there already is one");
						return;
					}
				} else if(media.removeVideo) {
					media.replaceVideo = false;
					media.addVideo = false;
					media.videoSend = false;
				} else if(media.replaceVideo) {
					media.addVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
				}
				if(config.myStream === null || config.myStream === undefined) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if(media.replaceVideo) {
						media.replaceVideo = false;
						media.addVideo = true;
						media.videoSend = true;
					}
					if(isVideoSendEnabled(media))
						media.addVideo = true;
				} else {
					if(config.myStream.getVideoTracks() === null
							|| config.myStream.getVideoTracks() === undefined
							|| config.myStream.getVideoTracks().length === 0) {
						// No video track: if we were asked to replace, it's actually an "add"
						if(media.replaceVideo) {
							media.replaceVideo = false;
							media.addVideo = true;
							media.videoSend = true;
						}
						if(isVideoSendEnabled(media))
							media.addVideo = true;
					}
				}
				// Data channels can only be added
				if(media.addData)
					media.data = true;
			}
		}
		config.trickle = isTrickleEnabled(callbacks.trickle);
		// Was a MediaStream object passed, or do we need to take care of that?
		if(callbacks.stream !== null && callbacks.stream !== undefined) {
			var stream = callbacks.stream;
			Janus.log("MediaStream provided by the application");
			Janus.debug(stream);
			// If this is an update, let's check if we need to release the previous stream
			if(media.update) {
				if(config.myStream && config.myStream !== callbacks.stream && !config.streamExternal) {
					// We're replacing a stream we captured ourselves with an external one
					try {
						// Try a MediaStreamTrack.stop() for each track
						var tracks = config.myStream.getTracks();
						for(var i in tracks) {
							var mst = tracks[i];
							Janus.log(mst);
							if(mst !== null && mst !== undefined)
								mst.stop();
						}
					} catch(e) {
						// Do nothing if this fails
					}
					config.myStream = null;
				}
			}
			// Skip the getUserMedia part
			config.streamExternal = true;
			streamsDone(handleId, jsep, media, callbacks, stream);
			return;
		}
		if(isAudioSendEnabled(media) || isVideoSendEnabled(media)) {
			var constraints = { mandatory: {}, optional: []};
			pluginHandle.consentDialog(true);
			var audioSupport = isAudioSendEnabled(media);
			if(audioSupport === true && media != undefined && media != null) {
				if(typeof media.audio === 'object') {
					audioSupport = media.audio;
				}
			}
			var videoSupport = isVideoSendEnabled(media);
			if(videoSupport === true && media != undefined && media != null) {
				var simulcast = callbacks.simulcast === true ? true : false;
				if(simulcast && !jsep && (media.video === undefined || media.video === false))
					media.video = "hires";
				if(media.video && media.video != 'screen' && media.video != 'window') {
					if(typeof media.video === 'object') {
						videoSupport = media.video;
					} else {
						var width = 0;
						var height = 0, maxHeight = 0;
						if(media.video === 'lowres') {
							// Small resolution, 4:3
							height = 240;
							maxHeight = 240;
							width = 320;
						} else if(media.video === 'lowres-16:9') {
							// Small resolution, 16:9
							height = 180;
							maxHeight = 180;
							width = 320;
						} else if(media.video === 'hires' || media.video === 'hires-16:9' || media.video === 'hdres') {
							// High(HD) resolution is only 16:9
							height = 720;
							maxHeight = 720;
							width = 1280;
						} else if(media.video === 'fhdres') {
							// Full HD resolution is only 16:9
							height = 1080;
							maxHeight = 1080;
							width = 1920;
						} else if(media.video === '4kres') {
							// 4K resolution is only 16:9
							height = 2160;
							maxHeight = 2160;
							width = 3840;
						} else if(media.video === 'stdres') {
							// Normal resolution, 4:3
							height = 480;
							maxHeight = 480;
							width  = 640;
						} else if(media.video === 'stdres-16:9') {
							// Normal resolution, 16:9
							height = 360;
							maxHeight = 360;
							width = 640;
						} else {
							Janus.log("Default video setting is stdres 4:3");
							height = 480;
							maxHeight = 480;
							width = 640;
						}
						Janus.log("Adding media constraint:", media.video);
						videoSupport = {
							'height': {'ideal': height},
							'width':  {'ideal': width}
						};
						if(media.videoFrameRate){
							videoSupport["frameRate"] = media.videoFrameRate;
						}
						Janus.debug("Adding video constraint:", videoSupport);
					}
				} else if(media.video === 'screen' || media.video === 'window') {
					if(!media.screenshareFrameRate) {
						media.screenshareFrameRate = 3;
					}
					// Not a webcam, but screen capture
					if(window.location.protocol !== 'https:') {
						// Screen sharing mandates HTTPS
						Janus.warn("Screen sharing only works on HTTPS, try the https:// version of this page");
						pluginHandle.consentDialog(false);
						callbacks.error("Screen sharing only works on HTTPS, try the https:// version of this page");
						return;
					}
					// We're going to try and use the extension for Chrome 34+, the old approach
					// for older versions of Chrome, or the experimental support in Firefox 33+
					var cache = {};
					function callbackUserMedia (error, stream) {
						pluginHandle.consentDialog(false);
						if(error) {
							callbacks.error({code: error.code, name: error.name, message: error.message});
						} else {
							streamsDone(handleId, jsep, media, callbacks, stream);
						}
					}
					function getScreenMedia(constraints, gsmCallback, useAudio) {
						Janus.log("Adding media constraint (screen capture)");
						Janus.debug(constraints);
						navigator.mediaDevices.getUserMedia(constraints)
							.then(function(stream) {
								if(useAudio){
									navigator.mediaDevices.getUserMedia({ audio: true, video: false })
									.then(function (audioStream) {
										stream.addTrack(audioStream.getAudioTracks()[0]);
										gsmCallback(null, stream);
									});
								} else {
									gsmCallback(null, stream);
								}
							})
							.catch(function(error) { pluginHandle.consentDialog(false); gsmCallback(error); });
					}
					if(Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
						var chromever = Janus.webRTCAdapter.browserDetails.version;
						var maxver = 33;
						if(window.navigator.userAgent.match('Linux'))
							maxver = 35;	// "known" crash in chrome 34 and 35 on linux
						if(chromever >= 26 && chromever <= maxver) {
							// Chrome 26->33 requires some awkward chrome://flags manipulation
							constraints = {
								video: {
									mandatory: {
										googLeakyBucket: true,
										maxWidth: window.screen.width,
										maxHeight: window.screen.height,
										minFrameRate: media.screenshareFrameRate,
										maxFrameRate: media.screenshareFrameRate,
										chromeMediaSource: 'screen'
									}
								},
								audio: isAudioSendEnabled(media)
							};
							getScreenMedia(constraints, callbackUserMedia);
						} else {
							// Chrome 34+ requires an extension
							var pending = window.setTimeout(
								function () {
									error = new Error('NavigatorUserMediaError');
									error.name = 'The required Chrome extension is not installed: click <a href="#">here</a> to install it. (NOTE: this will need you to refresh the page)';
									pluginHandle.consentDialog(false);
									return callbacks.error(error);
								}, 1000);
							cache[pending] = [callbackUserMedia, null];
							window.postMessage({ type: 'janusGetScreen', id: pending }, '*');
						}
					} else if (window.navigator.userAgent.match('Firefox')) {
						var ffver = parseInt(window.navigator.userAgent.match(/Firefox\/(.*)/)[1], 10);
						if(ffver >= 33) {
							// Firefox 33+ has experimental support for screen sharing
							constraints = {
								video: {
									mozMediaSource: media.video,
									mediaSource: media.video
								},
								audio: isAudioSendEnabled(media)
							};
							getScreenMedia(constraints, function (err, stream) {
								callbackUserMedia(err, stream);
								// Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1045810
								if (!err) {
									var lastTime = stream.currentTime;
									var polly = window.setInterval(function () {
										if(!stream)
											window.clearInterval(polly);
										if(stream.currentTime == lastTime) {
											window.clearInterval(polly);
											if(stream.onended) {
												stream.onended();
											}
										}
										lastTime = stream.currentTime;
									}, 500);
								}
							});
						} else {
							var error = new Error('NavigatorUserMediaError');
							error.name = 'Your version of Firefox does not support screen sharing, please install Firefox 33 (or more recent versions)';
							pluginHandle.consentDialog(false);
							callbacks.error(error);
							return;
						}
					}

					// Wait for events from the Chrome Extension
					window.addEventListener('message', function (event) {
						if(event.origin != window.location.origin)
							return;
						if(event.data.type == 'janusGotScreen' && cache[event.data.id]) {
							var data = cache[event.data.id];
							var callback = data[0];
							delete cache[event.data.id];

							if (event.data.sourceId === '') {
								// user canceled
								var error = new Error('NavigatorUserMediaError');
								error.name = 'You cancelled the request for permission, giving up...';
								pluginHandle.consentDialog(false);
								callbacks.error(error);
							} else {
								constraints = {
									audio: false,
									video: {
										mandatory: {
											chromeMediaSource: 'desktop',
											maxWidth: window.screen.width,
											maxHeight: window.screen.height,
											minFrameRate: media.screenshareFrameRate,
											maxFrameRate: media.screenshareFrameRate,
										},
										optional: [
											{googLeakyBucket: true},
											{googTemporalLayeredScreencast: true}
										]
									}
								};
								constraints.video.mandatory.chromeMediaSourceId = event.data.sourceId;
								getScreenMedia(constraints, callback, isAudioSendEnabled(media));
							}
						} else if (event.data.type == 'janusGetScreenPending') {
							window.clearTimeout(event.data.id);
						}
					});
					return;
				}
			}
			// If we got here, we're not screensharing
			if(media === null || media === undefined || media.video !== 'screen') {
				// Check whether all media sources are actually available or not
				navigator.mediaDevices.enumerateDevices().then(function(devices) {
					var audioExist = devices.some(function(device) {
						return device.kind === 'audioinput';
					}),
					videoExist = devices.some(function(device) {
						return device.kind === 'videoinput';
					});

					// Check whether a missing device is really a problem
					var audioSend = isAudioSendEnabled(media);
					var videoSend = isVideoSendEnabled(media);
					var needAudioDevice = isAudioSendRequired(media);
					var needVideoDevice = isVideoSendRequired(media);
					if(audioSend || videoSend || needAudioDevice || needVideoDevice) {
						// We need to send either audio or video
						var haveAudioDevice = audioSend ? audioExist : false;
						var haveVideoDevice = videoSend ? videoExist : false;
						if(!haveAudioDevice && !haveVideoDevice) {
							// FIXME Should we really give up, or just assume recvonly for both?
							pluginHandle.consentDialog(false);
							callbacks.error('No capture device found');
							return false;
						} else if(!haveAudioDevice && needAudioDevice) {
							pluginHandle.consentDialog(false);
							callbacks.error('Audio capture is required, but no capture device found');
							return false;
						} else if(!haveVideoDevice && needVideoDevice) {
							pluginHandle.consentDialog(false);
							callbacks.error('Video capture is required, but no capture device found');
							return false;
						}
					}

					navigator.mediaDevices.getUserMedia({
						audio: audioExist ? audioSupport : false,
						video: videoExist ? videoSupport : false
					})
					.then(function(stream) {
						var videoTrack = stream.getVideoTracks()[0];
						if(videoTrack){
							Janus.debug("Video height: " + videoTrack.getSettings().height);
							Janus.debug("Video width: " + videoTrack.getSettings().width);
							Janus.debug("Video framerate: " + videoTrack.getSettings().frameRate);
						}
						pluginHandle.consentDialog(false); streamsDone(handleId, jsep, media, callbacks, stream); })
					.catch(function(error) { pluginHandle.consentDialog(false); callbacks.error({code: error.code, name: error.name, message: error.message}); });
				})
				.catch(function(error) {
					pluginHandle.consentDialog(false);
					callbacks.error('enumerateDevices error', error);
				});
			}
		} else {
			// No need to do a getUserMedia, create offer/answer right away
			streamsDone(handleId, jsep, media, callbacks);
		}
	}

	function prepareWebrtcPeer(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if(jsep !== undefined && jsep !== null) {
			if(config.pc === null) {
				Janus.warn("Wait, no PeerConnection?? if this is an answer, use createAnswer and not handleRemoteJsep");
				callbacks.error("No PeerConnection: if this is an answer, use createAnswer and not handleRemoteJsep");
				return;
			}
			config.pc.setRemoteDescription(
					new RTCSessionDescription(jsep),
					function() {
						Janus.log("Remote description accepted!");
						callbacks.success();
					}, callbacks.error);
		} else {
			callbacks.error("Invalid JSEP");
		}
	}

	function createOffer(handleId, media, callbacks) {
		console.warn("createOffer:", media);

		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var simulcast = callbacks.simulcast === true ? true : false;
		if(!simulcast) {
			Janus.log("Creating offer (iceDone=" + config.iceDone + ")");
		} else {
			Janus.log("Creating offer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		// https://code.google.com/p/webrtc/issues/detail?id=3508
		var mediaConstraints = {
			'offerToReceiveAudio':isAudioRecvEnabled(media),
			'offerToReceiveVideo':isVideoRecvEnabled(media)
		};
		var iceRestart = callbacks.iceRestart === true ? true : false;
		if(iceRestart) {
			mediaConstraints["iceRestart"] = true;
		}
		Janus.debug(mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if(sendVideo && simulcast && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
			// FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
			Janus.log("Enabling Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders()[1];
			Janus.log(sender);
			var parameters = sender.getParameters();
			Janus.log(parameters);
			sender.setParameters({encodings: [
				{ rid: "high", active: true, priority: "high", maxBitrate: 1000000 },
				{ rid: "medium", active: true, priority: "medium", maxBitrate: 300000 },
				{ rid: "low", active: true, priority: "low", maxBitrate: 100000 }
			]});
		}
		config.pc.createOffer(
			function(offer) {
				Janus.debug(offer);
				Janus.log("Setting local description");
				if(sendVideo && simulcast) {
					// This SDP munging only works with Chrome
					if(Janus.webRTCAdapter.browserDetails.browser === "chrome") {
						Janus.log("Enabling Simulcasting for Chrome (SDP munging)");
						offer.sdp = mungeSdpForSimulcasting(offer.sdp);
					} else if(Janus.webRTCAdapter.browserDetails.browser !== "firefox") {
						Janus.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
					}
				}
				config.mySdp = offer.sdp;
				config.pc.setLocalDescription(offer);
				config.mediaConstraints = mediaConstraints;
				if(!config.iceDone && !config.trickle) {
					// Don't do anything until we have all candidates
					Janus.log("Waiting for all candidates...");
					return;
				}
				Janus.log("Offer ready");
				Janus.debug(callbacks);
				// JSON.stringify doesn't work on some WebRTC objects anymore
				// See https://code.google.com/p/chromium/issues/detail?id=467366
				var jsep = {
					"type": offer.type,
					"sdp": offer.sdp
				};
				callbacks.success(jsep);
			}, callbacks.error, mediaConstraints);
	}

	function createAnswer(handleId, media, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var simulcast = callbacks.simulcast === true ? true : false;
		if(!simulcast) {
			Janus.log("Creating answer (iceDone=" + config.iceDone + ")");
		} else {
			Janus.log("Creating answer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		var mediaConstraints = null;
		if(Janus.webRTCAdapter.browserDetails.browser == "firefox" || Janus.webRTCAdapter.browserDetails.browser == "edge") {
			mediaConstraints = {
				'offerToReceiveAudio':isAudioRecvEnabled(media),
				'offerToReceiveVideo':isVideoRecvEnabled(media)
			};
		} else {
			mediaConstraints = {
				'mandatory': {
					'OfferToReceiveAudio':isAudioRecvEnabled(media),
					'OfferToReceiveVideo':isVideoRecvEnabled(media)
				}
			};
		}
		Janus.debug(mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if(sendVideo && simulcast && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
			// FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
			Janus.log("Enabling Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders()[1];
			Janus.log(sender);
			var parameters = sender.getParameters();
			Janus.log(parameters);
			sender.setParameters({encodings: [
				{ rid: "high", active: true, priority: "high", maxBitrate: 1000000 },
				{ rid: "medium", active: true, priority: "medium", maxBitrate: 300000 },
				{ rid: "low", active: true, priority: "low", maxBitrate: 100000 }
			]});
		}
		config.pc.createAnswer(
			function(answer) {
				Janus.debug(answer);
				Janus.log("Setting local description");
				if(sendVideo && simulcast) {
					// This SDP munging only works with Chrome
					if(Janus.webRTCAdapter.browserDetails.browser === "chrome") {
						// FIXME Apparently trying to simulcast when answering breaks video in Chrome...
						//~ Janus.log("Enabling Simulcasting for Chrome (SDP munging)");
						//~ answer.sdp = mungeSdpForSimulcasting(answer.sdp);
						Janus.warn("simulcast=true, but this is an answer, and video breaks in Chrome if we enable it");
					} else if(Janus.webRTCAdapter.browserDetails.browser !== "firefox") {
						Janus.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
					}
				}
				config.mySdp = answer.sdp;
				config.pc.setLocalDescription(answer);
				config.mediaConstraints = mediaConstraints;
				if(!config.iceDone && !config.trickle) {
					// Don't do anything until we have all candidates
					Janus.log("Waiting for all candidates...");
					return;
				}
				// JSON.stringify doesn't work on some WebRTC objects anymore
				// See https://code.google.com/p/chromium/issues/detail?id=467366
				var jsep = {
					"type": answer.type,
					"sdp": answer.sdp
				};
				callbacks.success(jsep);
			}, callbacks.error, mediaConstraints);
	}

	function sendSDP(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle, not sending anything");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		Janus.log("Sending offer/answer SDP...");
		if(config.mySdp === null || config.mySdp === undefined) {
			Janus.warn("Local SDP instance is invalid, not sending anything...");
			return;
		}
		config.mySdp = {
			"type": config.pc.localDescription.type,
			"sdp": config.pc.localDescription.sdp
		};
		if(config.trickle === false)
			config.mySdp["trickle"] = false;
		Janus.debug(callbacks);
		config.sdpSent = true;
		callbacks.success(config.mySdp);
	}

	function getVolume(handleId) {
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return 0;
		}
		var config = pluginHandle.webrtcStuff;
		// Start getting the volume, if getStats is supported
		if(config.pc.getStats && Janus.webRTCAdapter.browserDetails.browser == "chrome") {	// FIXME
			if(config.remoteStream === null || config.remoteStream === undefined) {
				Janus.warn("Remote stream unavailable");
				return 0;
			}
			// http://webrtc.googlecode.com/svn/trunk/samples/js/demos/html/constraints-and-stats.html
			if(config.volume.timer === null || config.volume.timer === undefined) {
				Janus.log("Starting volume monitor");
				config.volume.timer = setInterval(function() {
					config.pc.getStats(function(stats) {
						var results = stats.result();
						for(var i=0; i<results.length; i++) {
							var res = results[i];
							if(res.type == 'ssrc' && res.stat('audioOutputLevel')) {
								config.volume.value = res.stat('audioOutputLevel');
							}
						}
					});
				}, 200);
				return 0;	// We don't have a volume to return yet
			}
			return config.volume.value;
		} else {
			Janus.log("Getting the remote volume unsupported by browser");
			return 0;
		}
	}

	function isMuted(handleId, video) {
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return true;
		}
		var config = pluginHandle.webrtcStuff;
		if(config.pc === null || config.pc === undefined) {
			Janus.warn("Invalid PeerConnection");
			return true;
		}
		if(config.myStream === undefined || config.myStream === null) {
			Janus.warn("Invalid local MediaStream");
			return true;
		}
		if(video) {
			// Check video track
			if(config.myStream.getVideoTracks() === null
					|| config.myStream.getVideoTracks() === undefined
					|| config.myStream.getVideoTracks().length === 0) {
				Janus.warn("No video track");
				return true;
			}
			return !config.myStream.getVideoTracks()[0].enabled;
		} else {
			// Check audio track
			if(config.myStream.getAudioTracks() === null
					|| config.myStream.getAudioTracks() === undefined
					|| config.myStream.getAudioTracks().length === 0) {
				Janus.warn("No audio track");
				return true;
			}
			return !config.myStream.getAudioTracks()[0].enabled;
		}
	}

	function mute(handleId, video, mute) {
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return false;
		}
		var config = pluginHandle.webrtcStuff;
		if(config.pc === null || config.pc === undefined) {
			Janus.warn("Invalid PeerConnection");
			return false;
		}
		if(config.myStream === undefined || config.myStream === null) {
			Janus.warn("Invalid local MediaStream");
			return false;
		}
		if(video) {
			// Mute/unmute video track
			if(config.myStream.getVideoTracks() === null
					|| config.myStream.getVideoTracks() === undefined
					|| config.myStream.getVideoTracks().length === 0) {
				Janus.warn("No video track");
				return false;
			}
			config.myStream.getVideoTracks()[0].enabled = mute ? false : true;
			return true;
		} else {
			// Mute/unmute audio track
			if(config.myStream.getAudioTracks() === null
					|| config.myStream.getAudioTracks() === undefined
					|| config.myStream.getAudioTracks().length === 0) {
				Janus.warn("No audio track");
				return false;
			}
			config.myStream.getAudioTracks()[0].enabled = mute ? false : true;
			return true;
		}
	}

	function getBitrate(handleId) {
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return "Invalid handle";
		}
		var config = pluginHandle.webrtcStuff;
		if(config.pc === null || config.pc === undefined)
			return "Invalid PeerConnection";
		// Start getting the bitrate, if getStats is supported
		if(config.pc.getStats) {
			if(config.bitrate.timer === null || config.bitrate.timer === undefined) {
				Janus.log("Starting bitrate timer (via getStats)");
				config.bitrate.timer = setInterval(function() {
					config.pc.getStats()
						.then(function(stats) {
							stats.forEach(function (res) {
								if(!res)
									return;
								var inStats = false;
								// Check if these are statistics on incoming media
								if((res.mediaType === "video" || res.id.toLowerCase().indexOf("video") > -1) &&
										res.type === "inbound-rtp" && res.id.indexOf("rtcp") < 0) {
									// New stats
									inStats = true;
								} else if(res.type == 'ssrc' && res.bytesReceived &&
										(res.googCodecName === "VP8" || res.googCodecName === "")) {
									// Older Chromer versions
									inStats = true;
								}
								// Parse stats now
								if(inStats) {
									config.bitrate.bsnow = res.bytesReceived;
									config.bitrate.tsnow = res.timestamp;
									if(config.bitrate.bsbefore === null || config.bitrate.tsbefore === null) {
										// Skip this round
										config.bitrate.bsbefore = config.bitrate.bsnow;
										config.bitrate.tsbefore = config.bitrate.tsnow;
									} else {
										// Calculate bitrate
										var timePassed = config.bitrate.tsnow - config.bitrate.tsbefore;
										if(Janus.webRTCAdapter.browserDetails.browser == "safari")
											timePassed = timePassed/1000;	// Apparently the timestamp is in microseconds, in Safari
										var bitRate = Math.round((config.bitrate.bsnow - config.bitrate.bsbefore) * 8 / timePassed);
										config.bitrate.value = bitRate + ' kbits/sec';
										//~ Janus.log("Estimated bitrate is " + config.bitrate.value);
										config.bitrate.bsbefore = config.bitrate.bsnow;
										config.bitrate.tsbefore = config.bitrate.tsnow;
									}
								}
							});
						});
				}, 1000);
				return "0 kbits/sec";	// We don't have a bitrate value yet
			}
			return config.bitrate.value;
		} else {
			Janus.warn("Getting the video bitrate unsupported by browser");
			return "Feature unsupported by browser";
		}
	}

	function webrtcError(error) {
		Janus.error("WebRTC error:", error);
	}

	function cleanupWebrtc(handleId, hangupRequest) {
		Janus.log("Cleaning WebRTC stuff");
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined) {
			// Nothing to clean
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if(config !== null && config !== undefined) {
			if(hangupRequest === true) {
				// Send a hangup request (we don't really care about the response)
				var request = { "janus": "hangup", "transaction": Janus.randomString(12) };
				if(token !== null && token !== undefined)
					request["token"] = token;
				if(apisecret !== null && apisecret !== undefined)
					request["apisecret"] = apisecret;
				Janus.debug("Sending hangup request (handle=" + handleId + "):");
				Janus.debug(request);
				if(websockets) {
					request["session_id"] = sessionId;
					request["handle_id"] = handleId;
					ws.send(JSON.stringify(request));
				} else {
					Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
						verb: 'POST',
						withCredentials: withCredentials,
						data: request
					});
				}
			}
			// Cleanup stack
			config.remoteStream = null;
			if(config.volume.timer)
				clearInterval(config.volume.timer);
			config.volume.value = null;
			if(config.bitrate.timer)
				clearInterval(config.bitrate.timer);
			config.bitrate.timer = null;
			config.bitrate.bsnow = null;
			config.bitrate.bsbefore = null;
			config.bitrate.tsnow = null;
			config.bitrate.tsbefore = null;
			config.bitrate.value = null;
			try {
				// Try a MediaStreamTrack.stop() for each track
				if(!config.streamExternal && config.myStream !== null && config.myStream !== undefined) {
					Janus.log("Stopping local stream tracks");
					var tracks = config.myStream.getTracks();
					for(var i in tracks) {
						var mst = tracks[i];
						Janus.log(mst);
						if(mst !== null && mst !== undefined)
							mst.stop();
					}
				}
			} catch(e) {
				// Do nothing if this fails
			}
			config.streamExternal = false;
			config.myStream = null;
			// Close PeerConnection
			try {
				config.pc.close();
			} catch(e) {
				// Do nothing
			}
			config.pc = null;
			config.mySdp = null;
			config.iceDone = false;
			config.dataChannel = null;
			config.dtmfSender = null;
		}
		pluginHandle.oncleanup();
	}

	// Helper method to munge an SDP to enable simulcasting (Chrome only)
	function mungeSdpForSimulcasting(sdp) {
		// Let's munge the SDP to add the attributes for enabling simulcasting
		// (based on https://gist.github.com/ggarber/a19b4c33510028b9c657)
		var lines = sdp.split("\r\n");
		var video = false;
		var ssrc = [ -1 ], ssrc_fid = -1;
		var cname = null, msid = null, mslabel = null, label = null;
		var insertAt = -1;
		for(var i=0; i<lines.length; i++) {
			var mline = lines[i].match(/m=(\w+) */);
			if(mline) {
				var medium = mline[1];
				if(medium === "video") {
					// New video m-line: make sure it's the first one
					if(ssrc[0] < 0) {
						video = true;
					} else {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				} else {
					// New non-video m-line: do we have what we were looking for?
					if(ssrc[0] > -1) {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				}
				continue;
			}
			if(!video)
				continue;
			var fid = lines[i].match(/a=ssrc-group:FID (\d+) (\d+)/);
			if(fid) {
				ssrc[0] = fid[1];
				ssrc_fid = fid[2];
				lines.splice(i, 1); i--;
				continue;
			}
			if(ssrc[0]) {
				var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
				if(match) {
					cname = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
				if(match) {
					msid = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
				if(match) {
					mslabel = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc + ' label:(.+)');
				if(match) {
					label = match[1];
				}
				if(lines[i].indexOf('a=ssrc:' + ssrc_fid) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
				if(lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
			}
			if(lines[i].length == 0) {
				lines.splice(i, 1); i--;
				continue;
			}
		}
		if(ssrc[0] < 0) {
			// Couldn't find a FID attribute, let's just take the first video SSRC we find
			insertAt = -1;
			video = false;
			for(var i=0; i<lines.length; i++) {
				var mline = lines[i].match(/m=(\w+) */);
				if(mline) {
					var medium = mline[1];
					if(medium === "video") {
						// New video m-line: make sure it's the first one
						if(ssrc[0] < 0) {
							video = true;
						} else {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					} else {
						// New non-video m-line: do we have what we were looking for?
						if(ssrc[0] > -1) {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					}
					continue;
				}
				if(!video)
					continue;
				if(ssrc[0] < 0) {
					var value = lines[i].match(/a=ssrc:(\d+)/);
					if(value) {
						ssrc[0] = value[1];
						lines.splice(i, 1); i--;
						continue;
					}
				} else {
					var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
					if(match) {
						cname = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
					if(match) {
						msid = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
					if(match) {
						mslabel = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc + ' label:(.+)');
					if(match) {
						label = match[1];
					}
					if(lines[i].indexOf('a=ssrc:' + ssrc_fid) === 0) {
						lines.splice(i, 1); i--;
						continue;
					}
					if(lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
						lines.splice(i, 1); i--;
						continue;
					}
				}
				if(lines[i].length == 0) {
					lines.splice(i, 1); i--;
					continue;
				}
			}
		}
		if(ssrc[0] < 0) {
			// Still nothing, let's just return the SDP we were asked to munge
			Janus.warn("Couldn't find the video SSRC, simulcasting NOT enabled");
			return sdp;
		}
		if(insertAt < 0) {
			// Append at the end
			insertAt = lines.length;
		}
		// Generate a couple of SSRCs
		ssrc[1] = Math.floor(Math.random()*0xFFFFFFFF);
		ssrc[2] = Math.floor(Math.random()*0xFFFFFFFF);
		// Add attributes to the SDP
		for(var i=0; i<ssrc.length; i++) {
			if(cname) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' cname:' + cname);
				insertAt++;
			}
			if(msid) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' msid:' + msid);
				insertAt++;
			}
			if(mslabel) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' mslabel:' + msid);
				insertAt++;
			}
			if(label) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' label:' + msid);
				insertAt++;
			}
		}
		lines.splice(insertAt, 0, 'a=ssrc-group:SIM ' + ssrc[0] + ' ' + ssrc[1] + ' ' + ssrc[2]);
		sdp = lines.join("\r\n");
		if(!sdp.endsWith("\r\n"))
			sdp += "\r\n";
		return sdp;
	}

	// Helper methods to parse a media object
	function isAudioSendEnabled(media) {
		Janus.debug("isAudioSendEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.audio === false)
			return false;	// Generic audio has precedence
		if(media.audioSend === undefined || media.audioSend === null)
			return true;	// Default
		return (media.audioSend === true);
	}

	function isAudioSendRequired(media) {
		Janus.debug("isAudioSendRequired:", media);
		if(media === undefined || media === null)
			return false;	// Default
		if(media.audio === false || media.audioSend === false)
			return false;	// If we're not asking to capture audio, it's not required
		if(media.failIfNoAudio === undefined || media.failIfNoAudio === null)
			return false;	// Default
		return (media.failIfNoAudio === true);
	}

	function isAudioRecvEnabled(media) {
		Janus.debug("isAudioRecvEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.audio === false)
			return false;	// Generic audio has precedence
		if(media.audioRecv === undefined || media.audioRecv === null)
			return true;	// Default
		return (media.audioRecv === true);
	}

	function isVideoSendEnabled(media) {
		Janus.debug("isVideoSendEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.video === false)
			return false;	// Generic video has precedence
		if(media.videoSend === undefined || media.videoSend === null)
			return true;	// Default
		return (media.videoSend === true);
	}

	function isVideoSendRequired(media) {
		Janus.debug("isVideoSendRequired:", media);
		if(media === undefined || media === null)
			return false;	// Default
		if(media.video === false || media.videoSend === false)
			return false;	// If we're not asking to capture video, it's not required
		if(media.failIfNoVideo === undefined || media.failIfNoVideo === null)
			return false;	// Default
		return (media.failIfNoVideo === true);
	}

	function isVideoRecvEnabled(media) {
		Janus.debug("isVideoRecvEnabled:", media);
		if(media === undefined || media === null)
			return true;	// Default
		if(media.video === false)
			return false;	// Generic video has precedence
		if(media.videoRecv === undefined || media.videoRecv === null)
			return true;	// Default
		return (media.videoRecv === true);
	}

	function isDataEnabled(media) {
		Janus.debug("isDataEnabled:", media);
		if(Janus.webRTCAdapter.browserDetails.browser == "edge") {
			Janus.warn("Edge doesn't support data channels yet");
			return false;
		}
		if(media === undefined || media === null)
			return false;	// Default
		return (media.data === true);
	}

	function isTrickleEnabled(trickle) {
		Janus.debug("isTrickleEnabled:", trickle);
		if(trickle === undefined || trickle === null)
			return true;	// Default is true
		return (trickle === true);
	}
}

return Janus;

})));

},{}],10:[function(require,module,exports){
'use strict';

/*
 * QuickBlox Multiparty Video Conferencing SDK
 *
 * Main SDK Module
 *
 */

var VERSION = "0.2.0";

var Janus = require('./janus.umd');
var Utils = require('./qbUtils');
var EventEmitter = require('fbemitter').EventEmitter;

var EVENT_PARTICIPANT_JOINED = "participantjoined";
var EVENT_PARTICIPANT_LEFT = "participantleft";
var EVENT_LOCAL_STREAM = "localstream";
var EVENT_REMOTE_STREAM = "remotestream";


/**
 * @class
 * @param {Object} configParams - a set of configuration parameters. The
 *  following parameters are applied:<br>
 * @param {String} configParams.server - (<b>required</b>) the address of the
 *  gateway as a specific address (e.g., http://yourserver:8088 to use
 *  the plain HTTP API or ws://yourserver:8188 for WebSockets).
 * @param {Array} configParams.iceServers - (<i>optional</i>) a list of
 *  STUN/TURN servers to use (a default STUN server will be used if you skip
 *  this property).
 * @param {Boolean} configParams.debug - (<i>optional</i>) whether debug should
 *  be enabled on the JavaScript console (true/false). Default is true.
 * @throws "'server' parameter is mandatory" error if 'server' parameter is null
 *  or undefined.
 * @throws "missing adapter.js" error if the 'adapter.js' is not connected.
 */
function QBVideoConferencingClient(configParams) {
  if(!adapter){
    throw "Error: in order to use this library please connect adapter.js. More info https://github.com/webrtc/adapter";
  }

  this.configs = configParams;
  if(!this.configs.server){
    throw "'server' parameter is mandatory.";
  }else{
    if(this.configs.server.includes("http")){
      this.configs.server = this.configs.server + "/janus";
    }
  }
  if(!this.configs.debug){
    this.configs.debug = "all";
  }

  this.engine = null;
  this.videoRoomPlugin = null;
  this.isOnlyAudio = false;
  //
  this.currentDialogId = null;
  this.remoteFeeds = [];
  this.remoteJseps = [];
  this.remoteFeedsAttachingInProgress = [];
  //
  this.currentMidiaDeviceId = null;
  //
  this.bitrateTimers = [];
  //
  this.emitter = new EventEmitter();
}

/**
 * Attach media stream to HTML 'video' element
 *
 * @static
 * @param {Object} element - HTML 'video' element
 * @param {Object} stream - WebRTC media stream
 */
QBVideoConferencingClient.attachMediaStream = function(element, stream) {
  Janus.attachMediaStream(element, stream);
};

/**
 *  Get plugged devices
 *
 * @static
 * @param {function} callback - a callback to be notified about result
 *  (with single argument - array of all devices).
 */
QBVideoConferencingClient.listDevices = function(callback) {
  navigator.mediaDevices.enumerateDevices().then(function(devices) {
    console.debug(devices);
    callback(devices);
  }).catch(function(err) {
    console.error(err);
    callback([]);
  });;
};

/**
 *  Get plugged video input devices only
 *
 * @static
 * @param {function} callback - a callback to be notified about result
 *  (with single argument - array of video input devices).
 */
QBVideoConferencingClient.listVideoinputDevices = function(callback) {
  QBVideoConferencingClient.listDevices(function(devices){
    var videoSelect = [];
    // code sample
    // https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js#L27
    for (var i=0; i!==devices.length; ++i) {
      var deviceInfo = devices[i];
      if (deviceInfo.kind === 'videoinput') {
        var videoinputDescription = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
        var videoinputId = deviceInfo.deviceId;
        videoSelect.push({"label": videoinputDescription, "deviceId": videoinputId});
      }
    }
    callback(videoSelect);
  });
};

QBVideoConferencingClient.prototype = {

  /**
   * Create video session
   *
   * @param {Object} callbacks - a set of callbacks to be notified about result,
   *  namely:<br>
   * @param {function} callbacks.success - the session was successfully created
   *  and is ready to be used.
   * @param {function} callbacks.error - the session was NOT successfully
   *  created. This callback passes single argument - text description of error.
   * @param {function} callbacks.destroyed - the session was destroyed and
   *  can't be used any more.
   */
   createSession: function(callbacks) {
      var self = this;

      Janus.init({debug: this.configs.debug, callback: function() {

        if(!Janus.isWebrtcSupported()) {
          if(typeof callbacks.error === 'function'){
            callbacks.error("Your browser does not support WebRTC, so you can't use this functionality.");
          }
          return;
        }

        self.engine = new Janus({
          server: self.configs.server,
          iceServers: self.configs.iceServers,

          success: function() {
            if(typeof callbacks.success === 'function'){
              Utils.safeCallbackCall(callbacks.success);
            }
          },
          error: function(error) {
            if(typeof callbacks.error === 'function'){
              Utils.safeCallbackCall(callbacks.error, error);
            }
          },
          destroyed: function() {
            if(typeof callbacks.destroyed === 'function'){
              Utils.safeCallbackCall(callbacks.destroyed);
            }
          },
          timeoutSessionCallback: function(){
            if(typeof callbacks.timeoutSessionCallback === 'function'){
              Utils.safeCallbackCall(callbacks.timeoutSessionCallback);
            }
          }
        });

      }});
    },

    /**
     * Returns the unique session identifier
     *
     * @returns {String} unique session identifier or null.
     */
    getSessionId: function(){
      if(this.engine){
        return this.engine.getSessionId();
      }
      return null;
    },

   /**
    * Destroy video session
    *
    * @param {Object} callbacks - a set of callbacks to be notified about
    *  result, namely:<br>
    * @param {function} callbacks.success - the session was successfully
    *  destroyed and no longer available.
    * @param {function} callbacks.error - the session was NOT successfully
    *  destroyed. This callback passes single argument - text description
    *  of error.
    */
    destroySession: function(callbacks) {
      var self = this;
      this.engine.destroy({});

      if(typeof callbacks.success === 'function'){
        Utils.safeCallbackCall(callbacks.success);
      }
    },

    /**
     * Сreate a video conferencing plugin handle.
     *
     * @param  {Boolean} isRemote  To pass 'false' when you attach plugin to
     *  current user and pass 'true' when attach to remote user.
     * @param  {Number}  userId  To pass 'null' when you attach plugin to
     *  current user and pass remote user id when attach to remote user.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the handle was successfully
     *  created and is ready to be used.
     * @param {function} callbacks.error - the handle was NOT successfully
     *  created or some error has occured. The format of error is the following:
     *  {"error_code": "some integer code", "error": "some text description"}.
     *  Possible values of 'error_code': <br>
     * <ul>
     * <li>428: No such feed - can happen when a user joins room and quickly
     * leaves it so other user tries to subscribe to none existend feed.
     * Usually, this error can be ignored.</li>
     * <li>433: Unauthorized - do not have proper rights to join this room.</li>
     * <li>436: User ID already exists in this room.</li>
     * <li>400: Some not usual error occured, for example - no connection to
     *  server. </li>
     * </ul>
     *
     * @param {function} callbacks.consentDialog - this callback is triggered
     *  just before <b>getUserMedia</b> is called (parameter=<b>true</b>) and
     *  after it is completed (parameter=<b>false</b>); this means it can be
     *  used to modify the UI accordingly, e.g., to prompt the user about the
     *  need to accept the device access consent requests.
     * @param {function} callbacks.mediaState - this callback is triggered
     *  when server starts or stops receiving your media: for instance,
     *  a <b>mediaState</b> with type=audio and on=true means server started
     *  receiving your audio stream (or started getting them again after
     *  a pause of more than a second); a mediaState with type=video
     *  and on=false means server hasn't received any video from you in the
     *  last second, after a start was detected before; useful to figure out
     *  when server actually started handling your media, or to detect problems
     *  on the media path (e.g., media never started, or stopped at some time).
     * @param {function} callbacks.webrtcState - this callback is triggered
     *  with a <b>true</b> value when the PeerConnection associated to a handle
     *  becomes active (so ICE, DTLS and everything else succeeded) from
     *  the library perspective, while <b>false</b> is triggered when
     *  the PeerConnection goes down instead; useful to figure out when WebRTC
     *  is actually up and running between you and server (e.g., to notify
     *  a user they're actually now active in a conference).
     * @param {function} callbacks.slowLink - this callback is triggered when
     *  server reports trouble either sending or receiving media on the
     *  specified PeerConnection, typically as a consequence of too many NACKs
     *  received from/sent to the user in the last second: for instance,
     *  a slowLink with uplink=true means you notified several missing packets
     *  from server, while uplink=false means server is not receiving all your
     *  packets; useful to figure out when there are problems on the media
     *  path (e.g., excessive loss), in order to possibly react accordingly
     *  (e.g., decrease the bitrate if most of our packets are getting lost).
     * @param {function} callbacks.oncleanup - the WebRTC PeerConnection with
     *  the plugin was closed.
     */
    attachVideoConferencingPlugin: function(isRemote, userId, callbacks){
      var self = this;
      var remoteFeed = null;

      this.engine.attach({
        plugin: "janus.plugin.videoroom",
        success: function(pluginHandle) {
          if(isRemote){
            remoteFeed = pluginHandle;
            remoteFeed.userId = userId;
            self.remoteFeedsAttachingInProgress[userId] = remoteFeed;

            // join remote's feed (listen)
            var listen = { "request": "join", "room": self.currentDialogId,
                        "ptype": "listener", "feed": userId};

            // If the publisher is VP8 and this is Safari, let's avoid video
            if(adapter.browserDetails.browser === "safari") {
              listen["offer_video"] = false;
            }

            remoteFeed.send({"message": listen});
          }else{
            self.videoRoomPlugin = pluginHandle;
          }

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error) {
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, Utils.wrapError(error));
          }
        },
        consentDialog: function(on) {
          if(typeof callbacks.consentDialog === 'function'){
            Utils.safeCallbackCall(callbacks.consentDialog, on);
          }
        },
        mediaState: function(medium, on) {
          if(typeof callbacks.mediaState === 'function'){
            Utils.safeCallbackCall(callbacks.mediaState, medium, on);
          }
        },
        webrtcState: function(on) {
          if(typeof callbacks.webrtcState === 'function'){
            Utils.safeCallbackCall(callbacks.webrtcState, on);
          }
        },
        slowLink: function(uplink, nacks){
          if(typeof callbacks.slowLink === 'function'){
            Utils.safeCallbackCall(callbacks.slowLink, uplink, nacks);
          }
        },
        iceState: function(iceConnectionState){
          if(typeof callbacks.iceState === 'function'){
            Utils.safeCallbackCall(callbacks.iceState, iceConnectionState);
          }
        },
        onmessage: function(msg, jsep) {
          var event = msg["videoroom"];

          // remote feed
          if(isRemote){
            if(event) {
              // Remote feed attached
              if(event === "attached") {
                var feedId = msg["id"];
                self.remoteFeeds[feedId] = self.remoteFeedsAttachingInProgress[feedId];
                self.remoteFeedsAttachingInProgress[feedId] = null;
              }else if(msg["error"]) {
                // #define VIDEOROOM_ERROR_NO_SUCH_FEED		428
                //
                if(typeof callbacks.error === 'function'){
                  Utils.safeCallbackCall(callbacks.error, Utils.wrapError(msg["error"]));
                }
              }
            }

            if(jsep) {
              var feedId = msg["id"];

              // ICE restart case
              if(!feedId){
              }

              self.remoteJseps[feedId] = jsep;

              self.createAnswer(self.remoteFeeds[feedId], jsep, {
                success: function() {

                },
                error: function(error) {
                  if(typeof callbacks.error === 'function'){
                    Utils.safeCallbackCall(callbacks.error, Utils.wrapError(error));
                  }
                }
              });
            }

          // local feed
          }else{
            if(event) {
              // We JOINED
              if(event === "joined") {
                self.createOffer({useAudio: true, useVideo: !self.isOnlyAudio}, {
                  success: function() {
                    // Any new feed to attach to?
                    if(msg["publishers"]) {
                      var publishers = msg["publishers"];
                      for(var f in publishers) {
                        var userId = publishers[f]["id"];
                        var userDisplayName = publishers[f]["display"];
                        self.emitter.emit(EVENT_PARTICIPANT_JOINED, userId, userDisplayName);
                      }
                    }
                  },
                  error: function(error) {
                    if(typeof callbacks.error === 'function'){
                      Utils.safeCallbackCall(callbacks.error, Utils.wrapError(error));
                    }
                  }
                });

              // We JOINED and now receiving who is online
              }else if(event === "event") {
                // Any new feed to attach to?
                if(msg["publishers"]) {
                  var publishers = msg["publishers"];

                  for(var f in publishers) {
                    var userId = publishers[f]["id"];
                    var userDisplayName = publishers[f]["display"];

                    self.emitter.emit(EVENT_PARTICIPANT_JOINED, userId, userDisplayName);
                  }

                // Someone is LEAVING
                } else if(msg["leaving"]) {
                  // One of the publishers has gone away?
                  var feedId = msg["leaving"];
                  var success = self.detachRemoteFeed(feedId);
                  if(success) {
                    self.emitter.emit(EVENT_PARTICIPANT_LEFT, feedId, null);
                  }

                } else if(msg["unpublished"]) {

                  // One of the publishers has gone away?
                  var feedId = msg["unpublished"];
                  if(feedId != 'ok'){
                    var success = self.detachRemoteFeed(feedId);
                    if(success){
                      self.emitter.emit(EVENT_PARTICIPANT_LEFT, feedId, null);
                    }
                  }

                } else if(msg["error"]) {
                  // #define VIDEOROOM_ERROR_ID_EXISTS			436
                  // #define VIDEOROOM_ERROR_UNAUTHORIZED		433
                  //
                  if(typeof callbacks.error === 'function'){
                    Utils.safeCallbackCall(callbacks.error, Utils.wrapError(msg["error"]));
                  }
                }
              }
            }

            if(jsep) {
              self.videoRoomPlugin.handleRemoteJsep({jsep: jsep});

              // TODO:
              // handle wrong or unsupported codecs here...
              // var video = msg["video_codec"];
              // if(mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
              // 		"Our video stream has been rejected, viewers won't see us";
              // }

            }

          }
        },
        onlocalstream: function(stream) {
          self.emitter.emit(EVENT_LOCAL_STREAM, stream);
        },
        onremotestream: function(stream) {
          remoteFeed.stream = stream;

          self.emitter.emit(EVENT_REMOTE_STREAM, stream, remoteFeed.userId);
        },
        oncleanup: function() {
          console.info("ON CLEANUP");
          if(typeof callbacks.oncleanup === 'function'){
            Utils.safeCallbackCall(callbacks.oncleanup);
          }
        },
        detached: function() {

        }
      });
    },

    /**
     * Returns the unique plugin identifier
     *
     * @returns {String} unique plugin identifier or null.
     */
    getPluginId: function(){
      if(this.videoRoomPlugin){
        return this.videoRoomPlugin.getId();
      }
      return null;
    },

    /**
     * Detach a video conferencing plugin handle.
     *
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the handle was successfully
     *  destroyed.
     * @param {function} callbacks.error - the handle was NOT successfully
     *  destroyed. This callback passes single argument - text description
     *  of error.
     */
    detachVideoConferencingPlugin: function(callbacks){
      var self = this;

      var clean = function(){
        self.videoRoomPlugin = null;

        // detach all remote feeds
        Object.keys(self.remoteFeeds).forEach(function(userId){
          self.detachRemoteFeed(userId);
        });

        self.remoteFeeds = [];
        self.remoteJseps = [];

        self.currentMidiaDeviceId = null;
      };

      this.videoRoomPlugin.detach({
        success: function() {
          clean();

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error) {
          clean();

          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        },
      });
    },

    /**
     * Join video conference room
     *
     * @param {String} chatDialogId - a chat dialog ID to join
     * @param {Number} userId - an id of current QuickBlox user.
     * @param {Boolean} isOnlyAudio - an id of current QuickBlox user.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the chat dialog was successfully
     *  joined.
     * @param {function} callbacks.error - the chat dialog was NOT successfully
     *  joined. This callback passes single argument - text description
     *  of error.
     */
    join: function(chatDialogId, userId, isOnlyAudio, callbacks) {
      var self = this;

      if(typeof(isOnlyAudio) !== "boolean"){
        throw "'isOnlyAudio' parameter can be of type 'boolean' only.";
      }
      self.isOnlyAudio = isOnlyAudio;
      if(adapter.browserDetails.browser === "safari") {
        self.isOnlyAudio = true;
      }

      console.info("isOnlyAudio: " + self.isOnlyAudio);

      var joinEvent = { "request": "join", "room": chatDialogId,
                    "ptype": "publisher", "id": userId}; //"display": null
    	this.videoRoomPlugin.send({"message": joinEvent,
        success: function(resp) {
          self.currentDialogId = chatDialogId;
          self.currentUserId = userId;

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error) {
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        }
      });
    },

    /**
     * Leave video conference room
     *
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the chat dialog was successfully
     *  left.
     * @param {function} callbacks.error - the chat dialog was NOT successfully
     *  left. This callback passes single argument - text description of error.
     */
    leave: function(callbacks){
      var self = this;

      console.warn("leave");

      if(!self.engine.isConnected()){
        if(typeof callbacks.success === 'function'){
          Utils.safeCallbackCall(callbacks.success);
        }
        return;
      }

      var leaveEvent = { "request": "leave", "room": this.currentDialogId, "id": this.currentUserId};
      if(this.videoRoomPlugin){
        this.videoRoomPlugin.send({"message": leaveEvent});
      }
      this.currentDialogId = null;
      this.currentUserId = null;

      console.warn("resp");
      if(typeof callbacks.success === 'function'){
        Utils.safeCallbackCall(callbacks.success);
      }
    },

    /**
     * List online participants
     *
     * @param {String} chatDialogId - a chat dialog ID to list online
     *  participants in.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - when everything is ok and you will
     *  receive one argument - array of online participants.
     * @param {function} callbacks.error - when an error occured. This callback
     *  passes single argument - text description of error.
     */
    listOnlineParticipants: function(chatDialogId, callbacks) {
      var listRequest = {"request": "listparticipants", "room": chatDialogId};
      //
      this.videoRoomPlugin.send({"message": listRequest,
        success: function(data) {
          var participants = [];
          if(data){
            participants = data.participants;
          }
          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success, participants);
          }
        },
        error: function(error) {
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        }
      });
    },

    /**
     * Toggle audio mute.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    toggleAudioMute: function(){
      var muted = this.videoRoomPlugin.isAudioMuted();
    	if(muted){
    		this.videoRoomPlugin.unmuteAudio();
    	}else{
    		this.videoRoomPlugin.muteAudio();
      }
      return this.videoRoomPlugin.isAudioMuted();
    },

    /**
     * Is audio muted.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    isAudioMuted: function(){
      return this.videoRoomPlugin.isAudioMuted();
    },

    /**
     * Toggle remote user audio mute.
     *
     * @param {Number} userId - an id of QuickBlox user to mute audio.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    toggleRemoteAudioMute: function(userId){
      var remoteFeed = this.remoteFeeds[userId];
      if(!remoteFeed){
        return false;
      }

      var audioTracks = remoteFeed.stream.getAudioTracks();
      if(audioTracks && audioTracks.length > 0) {
        for(var i=0; i<audioTracks.length; ++i){
          audioTracks[i].enabled = !audioTracks[i].enabled;
        }
        return !audioTracks[0].enabled;
      }

      return false;
    },

    /**
     * Is remote audio muted.
     *
     * @param {Number} userId - an id of QuickBlox user to check audio mute
     *  state.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    isRemoteAudioMuted: function(userId){
      var remoteFeed = this.remoteFeeds[userId];
      if(!remoteFeed){
        return false;
      }

      var audioTracks = remoteFeed.stream.getAudioTracks();
      if(audioTracks && audioTracks.length > 0) {
        return !audioTracks[0].enabled;
      }

      return false;
    },

    /**
     * Toggle video mute.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    toggleVideoMute: function(){
        var muted = this.videoRoomPlugin.isVideoMuted();
        if(muted){
            this.videoRoomPlugin.unmuteVideo();
        }else{
            this.videoRoomPlugin.muteVideo();
        }
        return this.videoRoomPlugin.isVideoMuted();
    },

    /**
     * Is video muted.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    isVideoMuted: function(){
        return this.videoRoomPlugin.isVideoMuted();
    },

    /**
     * Toggle remote user video mute.
     *
     * @param {Number} userId - an id of QuickBlox user to mute video.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    toggleRemoteVideoMute: function(userId){
        var remoteFeed = this.remoteFeeds[userId];
        if(!remoteFeed){
            return false;
        }

        var videoTracks = remoteFeed.stream.getVideoTracks();
        if(videoTracks && videoTracks.length > 0) {
            for(var i=0; i<videoTracks.length; ++i){
                videoTracks[i].enabled = !videoTracks[i].enabled;
            }
            return !videoTracks[0].enabled;
        }

        return false;
    },

    /**
     * Is remote video muted.
     *
     * @param {Number} userId - an id of QuickBlox user to check video mute
     *  state.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    isRemoteVideoMuted: function(userId){
        var remoteFeed = this.remoteFeeds[userId];
        if(!remoteFeed){
            return false;
        }

        var videoTracks = remoteFeed.stream.getVideoTracks();
        if(videoTracks && videoTracks.length > 0) {
            return !videoTracks[0].enabled;
        }

        return false;
    },

    /**
     * Switch video input source.
     *
     * @param {String} mediaDeviceId - an id of media device (camera) to switch to.
     *  Can be obtained via 'QBVideoConferencingClient.listVideoinputDevices'.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - when everything is ok.
     * @param {function} callbacks.error - when an error occured. This callback
     *  passes single argument - text description of error.
     */
    switchVideoinput: function(mediaDeviceId, callbacks){

      if(!this.videoRoomPlugin){
        if(typeof callbacks.error === 'function'){
          Utils.safeCallbackCall(callbacks.error, "No active stream");
        }
        return;
      }

      if(this.isOnlyAudio){
        throw "Can't switch video input in audio only call.";
      }

      this.currentMidiaDeviceId = null;

      var self = this;

      this.createOffer({video: {deviceId: mediaDeviceId}, replaceVideo: true}, {
        success: function() {
          console.info("switchVideoinput: success");

          self.currentMidiaDeviceId = mediaDeviceId;

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error){
          console.info("switchVideoinput: error", error);

          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        }
      });
    },

    /**
     * Initiate ICE restart for remote peer.
     * These are typically needed whenever something in your network changes
     * (e.g., you move from WiFi to mobile or a different WiFi) but want to
     * keep the conversation going: in this case, an ICE restart needs to take
     * place, as the peers need to exchange the new candidates they can be
     * reached on.
     *
     * @param {Number} userIdOrCallbacks - an id of QuickBlox user to initiate ICE restart with or callbacks if it's a local peer.
     * @param {function} callbacks.success - when everything is ok.
     * @param {function} callbacks.error - when an error occured. This callback
     *  passes single argument - text description of error.
     */
    iceRestart: function(userIdOrCallbacks, callbacks){
      // remote ICE restart
      if(callbacks){
        console.info("Performing remote ICE restart for user: ", userIdOrCallbacks);

        var remoteFeed = this.remoteFeeds[userIdOrCallbacks];

        if(!remoteFeed){
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, "No such user feed");
          }
          return;
        }

        var req = {"request": "configure", "restart": true};
        remoteFeed.send({"message": req});

        if(typeof callbacks.success === 'function'){
          Utils.safeCallbackCall(callbacks.success);
        }

      // local ICE restart
      }else{
        console.info("Performing local ICE restart");

        this.createOffer({iceRestart: true}, {
          success: function() {
            if(typeof userIdOrCallbacks.success === 'function'){
              Utils.safeCallbackCall(userIdOrCallbacks.success);
            }
          },
          error: function(error){
            if(typeof userIdOrCallbacks.error === 'function'){
              Utils.safeCallbackCall(userIdOrCallbacks.error, error);
            }
          }
        });
      }
    },

    /**
     * @private
     */
    createOffer: function(inputParams, callbacks){
      console.warn("createOffer, inputParams: ", inputParams);
      var self = this;

      var useAudio = inputParams.useAudio;
      var useVideo = inputParams.useVideo;
      var stream = inputParams.stream;
      var replaceVideo = inputParams.replaceVideo;
      var iceRestart = inputParams.iceRestart;

      var videoQuality = self.configs.video ? self.configs.video.quality : null;
      var videoFrameRate = self.configs.video ? self.configs.video.frameRate : null;

      var params;
      if(stream){
          params = {stream: stream};
      }else if(replaceVideo){
          params = {media: inputParams};
          if (videoQuality) {
              params["media"]["video"] = videoQuality;
          }
          if (videoFrameRate){
              params["media"]["videoFrameRate"] = {min: videoFrameRate, max: videoFrameRate}
          }
      }else if(iceRestart){
          params = inputParams;
      }else{
          params = {media: {audioRecv: false,
                            videoRecv: false,
                            audioSend: useAudio,
                            videoSend: useVideo}}; // Publishers are sendonly
          if (videoQuality) {
              params["media"]["video"] = videoQuality;
          }
          if (videoFrameRate){
              params["media"]["videoFrameRate"] = {min: videoFrameRate, ideal: videoFrameRate}
          }
      }

      console.info("createOffer params: ", params);

      params.success = function(jsep) {
          var publish = {"request": "configure"};
          if(replaceVideo || iceRestart){
            // publish["update"] = true;
          }else{
            publish["audio"] = useAudio;
            publish["video"] = useVideo;
          }
          console.info("createOffer publish: ", publish);

          self.videoRoomPlugin.send({"message": publish, "jsep": jsep});

          if(typeof callbacks.success === 'function'){
              callbacks.success();
          }
      };

      params.error = function(error) {
          console.error("Error in createOffer: ", error);
          if (useAudio) {
              self.createOffer({useAudio: false, useVideo: false}, callbacks);
          } else {
              if(typeof callbacks.error === 'function'){
                  callbacks.error(error);
              }
          }
      };

      this.videoRoomPlugin.createOffer(params);
    },

    /**
     * @private
     */
    createAnswer: function(remoteFeed, jsep, callbacks){
      var self = this;

      remoteFeed.createAnswer({
				jsep: jsep,
				media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
				success: function(jsep) {
					var body = { "request": "start", "room": self.currentDialogId};
					remoteFeed.send({"message": body, "jsep": jsep});

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
				},
				error: function(error) {
          console.error("createAnswer error: ", error);
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
				}
			});
    },

    /**
     * @private
     */
    detachRemoteFeed: function(userId){
      var remoteFeed = this.remoteFeeds[userId];
      if(remoteFeed) {
        remoteFeed.detach();
        this.remoteFeeds[userId] = null;
        this.remoteJseps[userId] = null;
        return true;
      }
      return false;
    },

    /**
     * Start show a verbose description of the user's stream bitrate.
     * Refresh it every 1 second.
     *
     * @param {Number} userId - an id of QuickBlox user to gets stream bitrate.
     * @param {Object} element - DOM element to display bitrate on.
     */
    showBitrate: function(userId, element){
      var remoteFeed = this.remoteFeeds[userId];

      if(adapter.browserDetails.browser === "chrome" || adapter.browserDetails.browser === "firefox") {
        this.bitrateTimers[userId] = setInterval(function() {
          var bitrate = remoteFeed.getBitrate();
          element.text(bitrate);
        }, 1000);
      }
    },

    /**
     * Stop show a verbose description of the user's stream bitrate.
     *
     * @param {Number} userId - an id of QuickBlox user to stop show stream
     * bitrate.
     * @param {Object} element - DOM element to stop display bitrate on.
     */
    hideBitrate: function(userId, element){
      if(this.bitrateTimers[userId]){
        clearInterval(this.bitrateTimers[userId]);
      }
      this.bitrateTimers[userId] = null;
      element.text = null;
    },

    /**
     * Adds a listener to be invoked when events of the specified type are
     * emitted. The data arguments emitted will be passed to the listener
     * function. <br>
     * Possible events:
     * <ul>
     * <li>'participantjoined': (userId, userDisplayName)</li>
     * <li>'participantleft': (userId, userDisplayName)</li>
     * <li>'localstream': (stream)</li>
     * <li>'remotestream': (stream, userId)</li>
     * </ul>
     *
     * @param {String} eventType - Name of the event to listen to
     * @param {function} listener - Function to invoke when the specified
     *  event is emitted
     */
    on: function(eventType, listener){
      var token = this.emitter.addListener(eventType, listener);
    },

    /**
     * Removes all of the registered listeners.
     *
     * @param {?String} eventType - Optional name of the event whose registered
     *   listeners to remove.
     */
    removeAllListeners: function(eventType){
      if(eventType){
        this.emitter.removeAllListeners(eventType);
      }else{
        this.emitter.removeAllListeners();
      }
    }
};

module.exports = QBVideoConferencingClient;

},{"./janus.umd":9,"./qbUtils":11,"fbemitter":1}],11:[function(require,module,exports){
'use strict';

/*
 * QuickBlox Multiparty Video Conferencing SDK
 *
 * Utilities
 *
 */

var Utils = {
    safeCallbackCall: function() {
        var listenerString = arguments[0].toString(),
            listenerName = listenerString.split('(')[0].split(' ')[1],
            argumentsCopy = [],
            listenerCall;

        for (var i = 0; i < arguments.length; i++) {
            argumentsCopy.push(arguments[i]);
        }

        listenerCall = argumentsCopy.shift();

        try {
            listenerCall.apply(null, argumentsCopy);
        } catch (err) {
            if (listenerName === '') {
                console.error('Error: ' + err);
            } else {
                console.error('Error in listener ' + listenerName + ': ' + err);
            }
        }
    },

    wrapError: function(error) {
        if (typeof error === "string") {
            return {
                "error_code": 400,
                "error": error
            };
        }
        return error;
    },

    getUUID: function() {
        var navigator_info = window.navigator;
        var screen_info = window.screen;
        var uid = navigator_info.mimeTypes.length;

        uid += navigator_info.userAgent.replace(/\D+/g, '');
        uid += navigator_info.plugins.length;
        uid += screen_info.height || '';
        uid += screen_info.width || '';
        uid += screen_info.pixelDepth || '';

        return uid;
    }
};

module.exports = Utils;

},{}]},{},[10])(10)
});