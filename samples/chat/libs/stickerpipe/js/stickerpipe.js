
// todo: move StickersModule --> Stickers
window.StickersModule = {};


window.StickersModule.Libs = {};
(function(Plugin) {

	/**
	 *
	 * Copyright (C) 2011 by crac <![[dawid.kraczkowski[at]gmail[dot]com]]>
	 * Thanks for Hardy Keppler<![[Keppler.H[at]online.de]]> for shortened version
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 **/
	var Class = (function() {

		function _rewriteStatics(fnc, statics) {
			for (var prop in statics) {
				if (prop === 'extend' || prop === 'static' || prop === 'typeOf' || prop === 'mixin' ) {
					continue;
				}

				if (typeof statics[prop] === 'object' || typeof statics[prop] === 'function') {
					fnc[prop] = statics[prop];
					return;
				}

				//check if static is a constant
				if (prop === prop.toUpperCase()) {
					Object.defineProperty(fnc, prop, {
						writable: false,
						configurable: false,
						enumerable: true,
						value: statics[prop]
					});
					Object.defineProperty(fnc.prototype, prop, {
						writable: false,
						configurable: false,
						enumerable: true,
						value: statics[prop]
					});
				} else {
					Object.defineProperty(fnc, prop, {
						get: function() {
							return statics[prop]
						},
						set: function(val) {
							statics[prop] = val;
						}
					});
					Object.defineProperty(fnc.prototype, prop, {
						get: function() {
							return statics[prop]
						},
						set: function(val) {
							statics[prop] = val;
						}
					});
				}
			}
		}

		function _extend(base, source, overrideConstructor) {
			overrideConstructor = overrideConstructor || false;

			for (var p in source) {
				if ((p === '_constructor' && !overrideConstructor) || p === 'typeOf' || p === 'mixin' || p === 'static' || p === 'extend') {
					continue;
				}
				base[p] = source[p];
			}
		}

		return function (classBody) {

			var _preventCreateCall = false;

			return (function createClass(self, classBody) {

				var _mixins = [];
				var instance;

				var isSingleton = classBody.hasOwnProperty('singleton') && classBody.singleton;

				var classConstructor = function () {
					//apply constructor pattern
					if (typeof this['_constructor'] === 'function' && _preventCreateCall === false) {
						this._constructor.apply(this, arguments);
					}

					//apply getter pattern
					if (classBody.hasOwnProperty('get')) {
						for (var p in classBody.get) {

							var setter = 'set' in classBody ? (p in classBody.set ? classBody.set[p] : null) : null;
							if (setter === null) {
								Object.defineProperty(this, p, {
									get: classBody.get[p]
								});
							}
						}
					}

					//apply setter pattern
					if (classBody.hasOwnProperty('set')) {
						for (var p in classBody.set) {

							var getter = 'get' in classBody ? (p in classBody.get ? classBody.get[p] : null) : null;
							if (getter !== null) {
								Object.defineProperty(this, p, {
									set: classBody.set[p],
									get: classBody.get[p]
								});
							} else {
								Object.defineProperty(this, p, {
									set: classBody.set[p]
								});
							}
						}
					}

					if (isSingleton && typeof this !== 'undefined') {
						throw new Error('Singleton object cannot have more than one instance, call instance method instead');
					}
					this.constructor = classConstructor;
				};

				//make new class instance of extended object
				if (self !== null) {
					_preventCreateCall = true;
					classConstructor.prototype = new self();
					_preventCreateCall = false;
				}

				var classPrototype = classConstructor.prototype;

				classPrototype.typeOf = function(cls) {
					if (typeof cls === 'object') {
						return _mixins.indexOf(cls) >= 0;
					} else if (typeof cls === 'function') {
						if (this instanceof cls) {
							return true;
						} else if (_mixins.indexOf(cls) >= 0) {
							return true;
						}
					}

					return false;
				};
				if (typeof classBody === 'function') {
					classBody = classBody();
				}

				_extend(classPrototype, classBody, true);

				/**
				 * Defines statics and constans in class' body.
				 *
				 * @param {Object} statics
				 * @returns {Function}
				 */
				classConstructor.static = function(statics) {
					_rewriteStatics(classConstructor, statics);
					return classConstructor;
				};

				/**
				 * Extends class body by passed other class declaration
				 * @param {Function} *mixins
				 * @returns {Function}
				 */
				classConstructor.mixin = function() {
					for (var i = 0, l = arguments.length; i < l; i++) {
						//check if class implements interfaces
						var mixin = arguments[i];

						if (typeof mixin === 'function') {
							var methods = mixin.prototype;
						} else if (typeof mixin === 'object') {
							var methods = mixin;
						} else {
							throw new Error('js.class mixin method accepts only types: object, function - `' + (typeof mixin) + '` type given');
						}
						_extend(classPrototype, methods, false);
						_mixins.push(mixin);
					}
					return classConstructor;
				};

				/**
				 * Creates and returns new constructor function which extends
				 * its parent
				 *
				 * @param {Object} classBody
				 * @returns {Function}
				 */
				if (isSingleton) {
					classConstructor.extend = function() {
						throw new Error('Singleton class cannot be extended');
					};

					classConstructor.instance = function() {
						if (!instance) {
							isSingleton = false;
							instance = new classConstructor();
							isSingleton = true;
						}
						return instance;
					}

				} else {
					classConstructor.extend = function (classBody) {
						return createClass(this, classBody);
					};
				}

				return classConstructor;
			})(null, classBody);
		}
	})();

	if (typeof module !== "undefined") {
		module.exports = Class;
	} else {
		Plugin.Libs.Class = Class;   // for browser
	}

})(window.StickersModule);

// todo: remove

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-12-13
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
	if (!("classList" in document.createElement("_"))) {

		(function (view) {

			"use strict";

			if (!('Element' in view)) return;

			var
				classListProp = "classList"
				, protoProp = "prototype"
				, elemCtrProto = view.Element[protoProp]
				, objCtr = Object
				, strTrim = String[protoProp].trim || function () {
						return this.replace(/^\s+|\s+$/g, "");
					}
				, arrIndexOf = Array[protoProp].indexOf || function (item) {
						var
							i = 0
							, len = this.length
							;
						for (; i < len; i++) {
							if (i in this && this[i] === item) {
								return i;
							}
						}
						return -1;
					}
			// Vendors: please allow content code to instantiate DOMExceptions
				, DOMEx = function (type, message) {
					this.name = type;
					this.code = DOMException[type];
					this.message = message;
				}
				, checkTokenAndGetIndex = function (classList, token) {
					if (token === "") {
						throw new DOMEx(
							"SYNTAX_ERR"
							, "An invalid or illegal string was specified"
						);
					}
					if (/\s/.test(token)) {
						throw new DOMEx(
							"INVALID_CHARACTER_ERR"
							, "String contains an invalid character"
						);
					}
					return arrIndexOf.call(classList, token);
				}
				, ClassList = function (elem) {
					var
						trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
						, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
						, i = 0
						, len = classes.length
						;
					for (; i < len; i++) {
						this.push(classes[i]);
					}
					this._updateClassName = function () {
						elem.setAttribute("class", this.toString());
					};
				}
				, classListProto = ClassList[protoProp] = []
				, classListGetter = function () {
					return new ClassList(this);
				}
				;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
			DOMEx[protoProp] = Error[protoProp];
			classListProto.item = function (i) {
				return this[i] || null;
			};
			classListProto.contains = function (token) {
				token += "";
				return checkTokenAndGetIndex(this, token) !== -1;
			};
			classListProto.add = function () {
				var
					tokens = arguments
					, i = 0
					, l = tokens.length
					, token
					, updated = false
					;
				do {
					token = tokens[i] + "";
					if (checkTokenAndGetIndex(this, token) === -1) {
						this.push(token);
						updated = true;
					}
				}
				while (++i < l);

				if (updated) {
					this._updateClassName();
				}
			};
			classListProto.remove = function () {
				var
					tokens = arguments
					, i = 0
					, l = tokens.length
					, token
					, updated = false
					, index
					;
				do {
					token = tokens[i] + "";
					index = checkTokenAndGetIndex(this, token);
					while (index !== -1) {
						this.splice(index, 1);
						updated = true;
						index = checkTokenAndGetIndex(this, token);
					}
				}
				while (++i < l);

				if (updated) {
					this._updateClassName();
				}
			};
			classListProto.toggle = function (token, force) {
				token += "";

				var
					result = this.contains(token)
					, method = result ?
					force !== true && "remove"
						:
					force !== false && "add"
					;

				if (method) {
					this[method](token);
				}

				if (force === true || force === false) {
					return force;
				} else {
					return !result;
				}
			};
			classListProto.toString = function () {
				return this.join(" ");
			};

			if (objCtr.defineProperty) {
				var classListPropDesc = {
					get: classListGetter
					, enumerable: true
					, configurable: true
				};
				try {
					objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
				} catch (ex) { // IE 8 doesn't support enumerable:true
					if (ex.number === -0x7FF5EC54) {
						classListPropDesc.enumerable = false;
						objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
					}
				}
			} else if (objCtr[protoProp].__defineGetter__) {
				elemCtrProto.__defineGetter__(classListProp, classListGetter);
			}

		}(self));

	} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

		(function () {
			"use strict";

			var testElement = document.createElement("_");

			testElement.classList.add("c1", "c2");

			// Polyfill for IE 10/11 and Firefox <26, where classList.add and
			// classList.remove exist but support only one argument at a time.
			if (!testElement.classList.contains("c2")) {
				var createMethod = function(method) {
					var original = DOMTokenList.prototype[method];

					DOMTokenList.prototype[method] = function(token) {
						var i, len = arguments.length;

						for (i = 0; i < len; i++) {
							token = arguments[i];
							original.call(this, token);
						}
					};
				};
				createMethod('add');
				createMethod('remove');
			}

			testElement.classList.toggle("c3", false);

			// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
			// support the second argument.
			if (testElement.classList.contains("c3")) {
				var _toggle = DOMTokenList.prototype.toggle;

				DOMTokenList.prototype.toggle = function(token, force) {
					if (1 in arguments && !this.contains(token) === !force) {
						return force;
					} else {
						return _toggle.call(this, token);
					}
				};

			}

			testElement = null;
		}());

	}

}
document.addEventListener("DOMContentLoaded", function(event) {

	if(typeof window.ga === "undefined"){

		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	}

	ga('create', 'UA-1113296-81', 'auto', {'name': 'stickerTracker'});
	ga('stickerTracker.send', 'pageview');

});

(function(Plugin) {

	Plugin.Libs.Lockr = {
		prefix: '',

		_getPrefixedKey: function(key, options) {
			options = options || {};

			if (options.noPrefix) {
				return key;
			} else {
				return this.prefix + key;
			}
		},

		set: function (key, value, options) {
			var query_key = this._getPrefixedKey(key, options);

			try {
				localStorage.setItem(query_key, JSON.stringify({
					data: value
				}));
			} catch (e) {
				console && console.warn('Lockr didn\'t successfully save the "{'+ key +': '+ value +'}" pair, because the localStorage is full.');
			}
		},

		get: function (key, missing, options) {
			var query_key = this._getPrefixedKey(key, options),
				value;

			try {
				value = JSON.parse(localStorage.getItem(query_key));
			} catch (e) {
				value = null;
			}

			return (value === null) ? missing : (value.data || missing);
		},

		sadd: function(key, value, options) {
			var query_key = this._getPrefixedKey(key, options),
				json;

			var values = this.smembers(key);

			if (values.indexOf(value) > -1) {
				return null;
			}

			try {
				values.push(value);
				json = JSON.stringify({"data": values});
				localStorage.setItem(query_key, json);
			} catch (e) {
				if (console) {
					console.log(e);
					console.warn('Lockr didn\'t successfully add the '+ value +' to '+ key +' set, because the localStorage is full.');
				}
			}
		},

		smembers: function(key, options) {
			var query_key = this._getPrefixedKey(key, options),
				value;

			try {
				value = JSON.parse(localStorage.getItem(query_key));
			} catch (e) {
				value = null;
			}

			return (value === null) ? [] : (value.data || []);
		},

		sismember: function(key, value, options) {
			var query_key = this._getPrefixedKey(key, options);
			return this.smembers(key).indexOf(value) > -1;
		},

		getAll: function () {
			var keys = Object.keys(localStorage);

			return keys.map((function (key) {
				return this.get(key);
			}).bind(this));
		},

		srem: function(key, value, options) {
			var query_key = this._getPrefixedKey(key, options),
				json,
				index;

			var values = this.smembers(key, value);

			index = values.indexOf(value);

			if (index > -1)
				values.splice(index, 1);

			json = JSON.stringify({
				data: values
			});

			try {
				localStorage.setItem(query_key, json);
			} catch (e) {
				console && console.warn('Lockr couldn\'t remove the ' + value + ' from the set ' + key);
			}
		},

		rm: function (key) {
			localStorage.removeItem(key);
		},

		flush: function () {
			localStorage.clear();
		}
	};

})(window.StickersModule);
(function(Plugin) {

	Plugin.Libs.MD5 = function (string) {

		string = string.toString();

		function RotateLeft(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		}

		function AddUnsigned(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
				if (lResult & 0x40000000) {
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
		}

		function F(x,y,z) { return (x & y) | ((~x) & z); }
		function G(x,y,z) { return (x & z) | (y & (~z)); }
		function H(x,y,z) { return (x ^ y ^ z); }
		function I(x,y,z) { return (y ^ (x | (~z))); }

		function FF(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		}

		function GG(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		}

		function HH(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		}

		function II(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		}

		function ConvertToWordArray(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		}

		function WordToHex(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		}

		function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		}

		var x=Array();
		var k,AA,BB,CC,DD,a,b,c,d;
		var S11=7, S12=12, S13=17, S14=22;
		var S21=5, S22=9 , S23=14, S24=20;
		var S31=4, S32=11, S33=16, S34=23;
		var S41=6, S42=10, S43=15, S44=21;

		string = Utf8Encode(string);

		x = ConvertToWordArray(string);

		a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

		for (k=0;k<x.length;k+=16) {
			AA=a; BB=b; CC=c; DD=d;
			a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
			d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
			c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
			b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
			d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
			c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
			b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
			d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
			c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
			b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
			d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
			c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
			b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
			d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
			c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
			b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
			d=GG(d,a,b,c,x[k+10],S22,0x2441453);
			c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
			b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
			d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
			c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
			b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
			d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
			c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
			b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
			d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
			c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
			b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
			d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
			c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
			b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
			d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
			c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
			b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
			a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
			d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
			c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
			b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=II(a,b,c,d,x[k+0], S41,0xF4292244);
			d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
			c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
			b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
			d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
			c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
			b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
			d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
			c=II(c,d,a,b,x[k+6], S43,0xA3014314);
			b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
			d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
			c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
			b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=AddUnsigned(a,AA);
			b=AddUnsigned(b,BB);
			c=AddUnsigned(c,CC);
			d=AddUnsigned(d,DD);
		}

		var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

		return temp.toLowerCase();
	};

})(window.StickersModule);
/* perfect-scrollbar v0.6.10 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ps = require('../main');

if (typeof define === 'function' && define.amd) {
  // AMD
  define(ps);
} else {
  // Add to a global object.
  window.StickersModule.Libs.PerfectScrollbar = ps;
}

},{"../main":7}],2:[function(require,module,exports){
'use strict';

function oldAdd(element, className) {
  var classes = element.className.split(' ');
  if (classes.indexOf(className) < 0) {
    classes.push(className);
  }
  element.className = classes.join(' ');
}

function oldRemove(element, className) {
  var classes = element.className.split(' ');
  var idx = classes.indexOf(className);
  if (idx >= 0) {
    classes.splice(idx, 1);
  }
  element.className = classes.join(' ');
}

exports.add = function (element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    oldAdd(element, className);
  }
};

exports.remove = function (element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    oldRemove(element, className);
  }
};

exports.list = function (element) {
  if (element.classList) {
    return Array.prototype.slice.apply(element.classList);
  } else {
    return element.className.split(' ');
  }
};

},{}],3:[function(require,module,exports){
'use strict';

var DOM = {};

DOM.e = function (tagName, className) {
  var element = document.createElement(tagName);
  element.className = className;
  return element;
};

DOM.appendTo = function (child, parent) {
  parent.appendChild(child);
  return child;
};

function cssGet(element, styleName) {
  return window.getComputedStyle(element)[styleName];
}

function cssSet(element, styleName, styleValue) {
  if (typeof styleValue === 'number') {
    styleValue = styleValue.toString() + 'px';
  }
  element.style[styleName] = styleValue;
  return element;
}

function cssMultiSet(element, obj) {
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'number') {
      val = val.toString() + 'px';
    }
    element.style[key] = val;
  }
  return element;
}

DOM.css = function (element, styleNameOrObject, styleValue) {
  if (typeof styleNameOrObject === 'object') {
    // multiple set with object
    return cssMultiSet(element, styleNameOrObject);
  } else {
    if (typeof styleValue === 'undefined') {
      return cssGet(element, styleNameOrObject);
    } else {
      return cssSet(element, styleNameOrObject, styleValue);
    }
  }
};

DOM.matches = function (element, query) {
  if (typeof element.matches !== 'undefined') {
    return element.matches(query);
  } else {
    if (typeof element.matchesSelector !== 'undefined') {
      return element.matchesSelector(query);
    } else if (typeof element.webkitMatchesSelector !== 'undefined') {
      return element.webkitMatchesSelector(query);
    } else if (typeof element.mozMatchesSelector !== 'undefined') {
      return element.mozMatchesSelector(query);
    } else if (typeof element.msMatchesSelector !== 'undefined') {
      return element.msMatchesSelector(query);
    }
  }
};

DOM.remove = function (element) {
  if (typeof element.remove !== 'undefined') {
    element.remove();
  } else {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
};

DOM.queryChildren = function (element, selector) {
  return Array.prototype.filter.call(element.childNodes, function (child) {
    return DOM.matches(child, selector);
  });
};

module.exports = DOM;

},{}],4:[function(require,module,exports){
'use strict';

var EventElement = function (element) {
  this.element = element;
  this.events = {};
};

EventElement.prototype.bind = function (eventName, handler) {
  if (typeof this.events[eventName] === 'undefined') {
    this.events[eventName] = [];
  }
  this.events[eventName].push(handler);
  this.element.addEventListener(eventName, handler, false);
};

EventElement.prototype.unbind = function (eventName, handler) {
  var isHandlerProvided = (typeof handler !== 'undefined');
  this.events[eventName] = this.events[eventName].filter(function (hdlr) {
    if (isHandlerProvided && hdlr !== handler) {
      return true;
    }
    this.element.removeEventListener(eventName, hdlr, false);
    return false;
  }, this);
};

EventElement.prototype.unbindAll = function () {
  for (var name in this.events) {
    this.unbind(name);
  }
};

var EventManager = function () {
  this.eventElements = [];
};

EventManager.prototype.eventElement = function (element) {
  var ee = this.eventElements.filter(function (eventElement) {
    return eventElement.element === element;
  })[0];
  if (typeof ee === 'undefined') {
    ee = new EventElement(element);
    this.eventElements.push(ee);
  }
  return ee;
};

EventManager.prototype.bind = function (element, eventName, handler) {
  this.eventElement(element).bind(eventName, handler);
};

EventManager.prototype.unbind = function (element, eventName, handler) {
  this.eventElement(element).unbind(eventName, handler);
};

EventManager.prototype.unbindAll = function () {
  for (var i = 0; i < this.eventElements.length; i++) {
    this.eventElements[i].unbindAll();
  }
};

EventManager.prototype.once = function (element, eventName, handler) {
  var ee = this.eventElement(element);
  var onceHandler = function (e) {
    ee.unbind(eventName, onceHandler);
    handler(e);
  };
  ee.bind(eventName, onceHandler);
};

module.exports = EventManager;

},{}],5:[function(require,module,exports){
'use strict';

module.exports = (function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

},{}],6:[function(require,module,exports){
'use strict';

var cls = require('./class')
  , d = require('./dom');

exports.toInt = function (x) {
  return parseInt(x, 10) || 0;
};

exports.clone = function (obj) {
  if (obj === null) {
    return null;
  } else if (typeof obj === 'object') {
    var result = {};
    for (var key in obj) {
      result[key] = this.clone(obj[key]);
    }
    return result;
  } else {
    return obj;
  }
};

exports.extend = function (original, source) {
  var result = this.clone(original);
  for (var key in source) {
    result[key] = this.clone(source[key]);
  }
  return result;
};

exports.isEditable = function (el) {
  return d.matches(el, "input,[contenteditable]") ||
         d.matches(el, "select,[contenteditable]") ||
         d.matches(el, "textarea,[contenteditable]") ||
         d.matches(el, "button,[contenteditable]");
};

exports.removePsClasses = function (element) {
  var clsList = cls.list(element);
  for (var i = 0; i < clsList.length; i++) {
    var className = clsList[i];
    if (className.indexOf('ps-') === 0) {
      cls.remove(element, className);
    }
  }
};

exports.outerWidth = function (element) {
  return this.toInt(d.css(element, 'width')) +
         this.toInt(d.css(element, 'paddingLeft')) +
         this.toInt(d.css(element, 'paddingRight')) +
         this.toInt(d.css(element, 'borderLeftWidth')) +
         this.toInt(d.css(element, 'borderRightWidth'));
};

exports.startScrolling = function (element, axis) {
  cls.add(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.add(element, 'ps-' + axis);
  } else {
    cls.add(element, 'ps-x');
    cls.add(element, 'ps-y');
  }
};

exports.stopScrolling = function (element, axis) {
  cls.remove(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.remove(element, 'ps-' + axis);
  } else {
    cls.remove(element, 'ps-x');
    cls.remove(element, 'ps-y');
  }
};

exports.env = {
  isWebKit: 'WebkitAppearance' in document.documentElement.style,
  supportsTouch: (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
  supportsIePointer: window.navigator.msMaxTouchPoints !== null
};

},{"./class":2,"./dom":3}],7:[function(require,module,exports){
'use strict';

var destroy = require('./plugin/destroy')
  , initialize = require('./plugin/initialize')
  , update = require('./plugin/update');

module.exports = {
  initialize: initialize,
  update: update,
  destroy: destroy
};

},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":21}],8:[function(require,module,exports){
'use strict';

module.exports = {
  maxScrollbarLength: null,
  minScrollbarLength: null,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  stopPropagationOnClick: true,
  suppressScrollX: false,
  suppressScrollY: false,
  swipePropagation: true,
  useBothWheelAxes: false,
  useKeyboard: true,
  useSelectionScroll: false,
  wheelPropagation: false,
  wheelSpeed: 1,
  theme: 'default'
};

},{}],9:[function(require,module,exports){
'use strict';

var d = require('../lib/dom')
  , h = require('../lib/helper')
  , instances = require('./instances');

module.exports = function (element) {
  var i = instances.get(element);

  if (!i) {
    return;
  }

  i.event.unbindAll();
  d.remove(i.scrollbarX);
  d.remove(i.scrollbarY);
  d.remove(i.scrollbarXRail);
  d.remove(i.scrollbarYRail);
  h.removePsClasses(element);

  instances.remove(element);
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(require,module,exports){
'use strict';

var h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry')
  , updateScroll = require('../update-scroll');

function bindClickRailHandler(element, i) {
  function pageOffset(el) {
    return el.getBoundingClientRect();
  }
  var stopPropagation = window.Event.prototype.stopPropagation.bind;

  if (i.settings.stopPropagationOnClick) {
    i.event.bind(i.scrollbarY, 'click', stopPropagation);
  }
  i.event.bind(i.scrollbarYRail, 'click', function (e) {
    var halfOfScrollbarLength = h.toInt(i.scrollbarYHeight / 2);
    var positionTop = i.railYRatio * (e.pageY - window.pageYOffset - pageOffset(i.scrollbarYRail).top - halfOfScrollbarLength);
    var maxPositionTop = i.railYRatio * (i.railYHeight - i.scrollbarYHeight);
    var positionRatio = positionTop / maxPositionTop;

    if (positionRatio < 0) {
      positionRatio = 0;
    } else if (positionRatio > 1) {
      positionRatio = 1;
    }

    updateScroll(element, 'top', (i.contentHeight - i.containerHeight) * positionRatio);
    updateGeometry(element);

    e.stopPropagation();
  });

  if (i.settings.stopPropagationOnClick) {
    i.event.bind(i.scrollbarX, 'click', stopPropagation);
  }
  i.event.bind(i.scrollbarXRail, 'click', function (e) {
    var halfOfScrollbarLength = h.toInt(i.scrollbarXWidth / 2);
    var positionLeft = i.railXRatio * (e.pageX - window.pageXOffset - pageOffset(i.scrollbarXRail).left - halfOfScrollbarLength);
    var maxPositionLeft = i.railXRatio * (i.railXWidth - i.scrollbarXWidth);
    var positionRatio = positionLeft / maxPositionLeft;

    if (positionRatio < 0) {
      positionRatio = 0;
    } else if (positionRatio > 1) {
      positionRatio = 1;
    }

    updateScroll(element, 'left', ((i.contentWidth - i.containerWidth) * positionRatio) - i.negativeScrollAdjustment);
    updateGeometry(element);

    e.stopPropagation();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindClickRailHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],11:[function(require,module,exports){
'use strict';

var d = require('../../lib/dom')
  , h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry')
  , updateScroll = require('../update-scroll');

function bindMouseScrollXHandler(element, i) {
  var currentLeft = null;
  var currentPageX = null;

  function updateScrollLeft(deltaX) {
    var newLeft = currentLeft + (deltaX * i.railXRatio);
    var maxLeft = Math.max(0, i.scrollbarXRail.getBoundingClientRect().left) + (i.railXRatio * (i.railXWidth - i.scrollbarXWidth));

    if (newLeft < 0) {
      i.scrollbarXLeft = 0;
    } else if (newLeft > maxLeft) {
      i.scrollbarXLeft = maxLeft;
    } else {
      i.scrollbarXLeft = newLeft;
    }

    var scrollLeft = h.toInt(i.scrollbarXLeft * (i.contentWidth - i.containerWidth) / (i.containerWidth - (i.railXRatio * i.scrollbarXWidth))) - i.negativeScrollAdjustment;
    updateScroll(element, 'left', scrollLeft);
  }

  var mouseMoveHandler = function (e) {
    updateScrollLeft(e.pageX - currentPageX);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    h.stopScrolling(element, 'x');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarX, 'mousedown', function (e) {
    currentPageX = e.pageX;
    currentLeft = h.toInt(d.css(i.scrollbarX, 'left')) * i.railXRatio;
    h.startScrolling(element, 'x');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

function bindMouseScrollYHandler(element, i) {
  var currentTop = null;
  var currentPageY = null;

  function updateScrollTop(deltaY) {
    var newTop = currentTop + (deltaY * i.railYRatio);
    var maxTop = Math.max(0, i.scrollbarYRail.getBoundingClientRect().top) + (i.railYRatio * (i.railYHeight - i.scrollbarYHeight));

    if (newTop < 0) {
      i.scrollbarYTop = 0;
    } else if (newTop > maxTop) {
      i.scrollbarYTop = maxTop;
    } else {
      i.scrollbarYTop = newTop;
    }

    var scrollTop = h.toInt(i.scrollbarYTop * (i.contentHeight - i.containerHeight) / (i.containerHeight - (i.railYRatio * i.scrollbarYHeight)));
    updateScroll(element, 'top', scrollTop);
  }

  var mouseMoveHandler = function (e) {
    updateScrollTop(e.pageY - currentPageY);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    h.stopScrolling(element, 'y');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarY, 'mousedown', function (e) {
    currentPageY = e.pageY;
    currentTop = h.toInt(d.css(i.scrollbarY, 'top')) * i.railYRatio;
    h.startScrolling(element, 'y');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseScrollXHandler(element, i);
  bindMouseScrollYHandler(element, i);
};

},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],12:[function(require,module,exports){
'use strict';

var h = require('../../lib/helper')
  , d = require('../../lib/dom')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry')
  , updateScroll = require('../update-scroll');

function bindKeyboardHandler(element, i) {
  var hovered = false;
  i.event.bind(element, 'mouseenter', function () {
    hovered = true;
  });
  i.event.bind(element, 'mouseleave', function () {
    hovered = false;
  });

  var shouldPrevent = false;
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  i.event.bind(i.ownerDocument, 'keydown', function (e) {
    if (e.isDefaultPrevented && e.isDefaultPrevented()) {
      return;
    }

    var focused = d.matches(i.scrollbarX, ':focus') ||
                  d.matches(i.scrollbarY, ':focus');

    if (!hovered && !focused) {
      return;
    }

    var activeElement = document.activeElement ? document.activeElement : i.ownerDocument.activeElement;
    if (activeElement) {
      // go deeper if element is a webcomponent
      while (activeElement.shadowRoot) {
        activeElement = activeElement.shadowRoot.activeElement;
      }
      if (h.isEditable(activeElement)) {
        return;
      }
    }

    var deltaX = 0;
    var deltaY = 0;

    switch (e.which) {
    case 37: // left
      deltaX = -30;
      break;
    case 38: // up
      deltaY = 30;
      break;
    case 39: // right
      deltaX = 30;
      break;
    case 40: // down
      deltaY = -30;
      break;
    case 33: // page up
      deltaY = 90;
      break;
    case 32: // space bar
      if (e.shiftKey) {
        deltaY = 90;
      } else {
        deltaY = -90;
      }
      break;
    case 34: // page down
      deltaY = -90;
      break;
    case 35: // end
      if (e.ctrlKey) {
        deltaY = -i.contentHeight;
      } else {
        deltaY = -i.containerHeight;
      }
      break;
    case 36: // home
      if (e.ctrlKey) {
        deltaY = element.scrollTop;
      } else {
        deltaY = i.containerHeight;
      }
      break;
    default:
      return;
    }

    updateScroll(element, 'top', element.scrollTop - deltaY);
    updateScroll(element, 'left', element.scrollLeft + deltaX);
    updateGeometry(element);

    shouldPrevent = shouldPreventDefault(deltaX, deltaY);
    if (shouldPrevent) {
      e.preventDefault();
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindKeyboardHandler(element, i);
};

},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],13:[function(require,module,exports){
'use strict';

var instances = require('../instances')
  , updateGeometry = require('../update-geometry')
  , updateScroll = require('../update-scroll');

function bindMouseWheelHandler(element, i) {
  var shouldPrevent = false;

  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  function getDeltaFromEvent(e) {
    var deltaX = e.deltaX;
    var deltaY = -1 * e.deltaY;

    if (typeof deltaX === "undefined" || typeof deltaY === "undefined") {
      // OS X Safari
      deltaX = -1 * e.wheelDeltaX / 6;
      deltaY = e.wheelDeltaY / 6;
    }

    if (e.deltaMode && e.deltaMode === 1) {
      // Firefox in deltaMode 1: Line scrolling
      deltaX *= 10;
      deltaY *= 10;
    }

    if (deltaX !== deltaX && deltaY !== deltaY/* NaN checks */) {
      // IE in some mouse drivers
      deltaX = 0;
      deltaY = e.wheelDelta;
    }

    return [deltaX, deltaY];
  }

  function shouldBeConsumedByTextarea(deltaX, deltaY) {
    var hoveredTextarea = element.querySelector('textarea:hover');
    if (hoveredTextarea) {
      var maxScrollTop = hoveredTextarea.scrollHeight - hoveredTextarea.clientHeight;
      if (maxScrollTop > 0) {
        if (!(hoveredTextarea.scrollTop === 0 && deltaY > 0) &&
            !(hoveredTextarea.scrollTop === maxScrollTop && deltaY < 0)) {
          return true;
        }
      }
      var maxScrollLeft = hoveredTextarea.scrollLeft - hoveredTextarea.clientWidth;
      if (maxScrollLeft > 0) {
        if (!(hoveredTextarea.scrollLeft === 0 && deltaX < 0) &&
            !(hoveredTextarea.scrollLeft === maxScrollLeft && deltaX > 0)) {
          return true;
        }
      }
    }
    return false;
  }

  function mousewheelHandler(e) {
    var delta = getDeltaFromEvent(e);

    var deltaX = delta[0];
    var deltaY = delta[1];

    if (shouldBeConsumedByTextarea(deltaX, deltaY)) {
      return;
    }

    shouldPrevent = false;
    if (!i.settings.useBothWheelAxes) {
      // deltaX will only be used for horizontal scrolling and deltaY will
      // only be used for vertical scrolling - this is the default
      updateScroll(element, 'top', element.scrollTop - (deltaY * i.settings.wheelSpeed));
      updateScroll(element, 'left', element.scrollLeft + (deltaX * i.settings.wheelSpeed));
    } else if (i.scrollbarYActive && !i.scrollbarXActive) {
      // only vertical scrollbar is active and useBothWheelAxes option is
      // active, so let's scroll vertical bar using both mouse wheel axes
      if (deltaY) {
        updateScroll(element, 'top', element.scrollTop - (deltaY * i.settings.wheelSpeed));
      } else {
        updateScroll(element, 'top', element.scrollTop + (deltaX * i.settings.wheelSpeed));
      }
      shouldPrevent = true;
    } else if (i.scrollbarXActive && !i.scrollbarYActive) {
      // useBothWheelAxes and only horizontal bar is active, so use both
      // wheel axes for horizontal bar
      if (deltaX) {
        updateScroll(element, 'left', element.scrollLeft + (deltaX * i.settings.wheelSpeed));
      } else {
        updateScroll(element, 'left', element.scrollLeft - (deltaY * i.settings.wheelSpeed));
      }
      shouldPrevent = true;
    }

    updateGeometry(element);

    shouldPrevent = (shouldPrevent || shouldPreventDefault(deltaX, deltaY));
    if (shouldPrevent) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  if (typeof window.onwheel !== "undefined") {
    i.event.bind(element, 'wheel', mousewheelHandler);
  } else if (typeof window.onmousewheel !== "undefined") {
    i.event.bind(element, 'mousewheel', mousewheelHandler);
  }
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseWheelHandler(element, i);
};

},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],14:[function(require,module,exports){
'use strict';

var instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindNativeScrollHandler(element, i) {
  i.event.bind(element, 'scroll', function () {
    updateGeometry(element);
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindNativeScrollHandler(element, i);
};

},{"../instances":18,"../update-geometry":19}],15:[function(require,module,exports){
'use strict';

var h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry')
  , updateScroll = require('../update-scroll');

function bindSelectionHandler(element, i) {
  function getRangeNode() {
    var selection = window.getSelection ? window.getSelection() :
                    document.getSelection ? document.getSelection() : '';
    if (selection.toString().length === 0) {
      return null;
    } else {
      return selection.getRangeAt(0).commonAncestorContainer;
    }
  }

  var scrollingLoop = null;
  var scrollDiff = {top: 0, left: 0};
  function startScrolling() {
    if (!scrollingLoop) {
      scrollingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(scrollingLoop);
          return;
        }

        updateScroll(element, 'top', element.scrollTop + scrollDiff.top);
        updateScroll(element, 'left', element.scrollLeft + scrollDiff.left);
        updateGeometry(element);
      }, 50); // every .1 sec
    }
  }
  function stopScrolling() {
    if (scrollingLoop) {
      clearInterval(scrollingLoop);
      scrollingLoop = null;
    }
    h.stopScrolling(element);
  }

  var isSelected = false;
  i.event.bind(i.ownerDocument, 'selectionchange', function () {
    if (element.contains(getRangeNode())) {
      isSelected = true;
    } else {
      isSelected = false;
      stopScrolling();
    }
  });
  i.event.bind(window, 'mouseup', function () {
    if (isSelected) {
      isSelected = false;
      stopScrolling();
    }
  });

  i.event.bind(window, 'mousemove', function (e) {
    if (isSelected) {
      var mousePosition = {x: e.pageX, y: e.pageY};
      var containerGeometry = {
        left: element.offsetLeft,
        right: element.offsetLeft + element.offsetWidth,
        top: element.offsetTop,
        bottom: element.offsetTop + element.offsetHeight
      };

      if (mousePosition.x < containerGeometry.left + 3) {
        scrollDiff.left = -5;
        h.startScrolling(element, 'x');
      } else if (mousePosition.x > containerGeometry.right - 3) {
        scrollDiff.left = 5;
        h.startScrolling(element, 'x');
      } else {
        scrollDiff.left = 0;
      }

      if (mousePosition.y < containerGeometry.top + 3) {
        if (containerGeometry.top + 3 - mousePosition.y < 5) {
          scrollDiff.top = -5;
        } else {
          scrollDiff.top = -20;
        }
        h.startScrolling(element, 'y');
      } else if (mousePosition.y > containerGeometry.bottom - 3) {
        if (mousePosition.y - containerGeometry.bottom + 3 < 5) {
          scrollDiff.top = 5;
        } else {
          scrollDiff.top = 20;
        }
        h.startScrolling(element, 'y');
      } else {
        scrollDiff.top = 0;
      }

      if (scrollDiff.top === 0 && scrollDiff.left === 0) {
        stopScrolling();
      } else {
        startScrolling();
      }
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindSelectionHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],16:[function(require,module,exports){
'use strict';

var instances = require('../instances')
  , updateGeometry = require('../update-geometry')
  , updateScroll = require('../update-scroll');

function bindTouchHandler(element, i, supportsTouch, supportsIePointer) {
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    var scrollLeft = element.scrollLeft;
    var magnitudeX = Math.abs(deltaX);
    var magnitudeY = Math.abs(deltaY);

    if (magnitudeY > magnitudeX) {
      // user is perhaps trying to swipe up/down the page

      if (((deltaY < 0) && (scrollTop === i.contentHeight - i.containerHeight)) ||
          ((deltaY > 0) && (scrollTop === 0))) {
        return !i.settings.swipePropagation;
      }
    } else if (magnitudeX > magnitudeY) {
      // user is perhaps trying to swipe left/right across the page

      if (((deltaX < 0) && (scrollLeft === i.contentWidth - i.containerWidth)) ||
          ((deltaX > 0) && (scrollLeft === 0))) {
        return !i.settings.swipePropagation;
      }
    }

    return true;
  }

  function applyTouchMove(differenceX, differenceY) {
    updateScroll(element, 'top', element.scrollTop - differenceY);
    updateScroll(element, 'left', element.scrollLeft - differenceX);

    updateGeometry(element);
  }

  var startOffset = {};
  var startTime = 0;
  var speed = {};
  var easingLoop = null;
  var inGlobalTouch = false;
  var inLocalTouch = false;

  function globalTouchStart() {
    inGlobalTouch = true;
  }
  function globalTouchEnd() {
    inGlobalTouch = false;
  }

  function getTouch(e) {
    if (e.targetTouches) {
      return e.targetTouches[0];
    } else {
      // Maybe IE pointer
      return e;
    }
  }
  function shouldHandle(e) {
    if (e.targetTouches && e.targetTouches.length === 1) {
      return true;
    }
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
      return true;
    }
    return false;
  }
  function touchStart(e) {
    if (shouldHandle(e)) {
      inLocalTouch = true;

      var touch = getTouch(e);

      startOffset.pageX = touch.pageX;
      startOffset.pageY = touch.pageY;

      startTime = (new Date()).getTime();

      if (easingLoop !== null) {
        clearInterval(easingLoop);
      }

      e.stopPropagation();
    }
  }
  function touchMove(e) {
    if (!inGlobalTouch && inLocalTouch && shouldHandle(e)) {
      var touch = getTouch(e);

      var currentOffset = {pageX: touch.pageX, pageY: touch.pageY};

      var differenceX = currentOffset.pageX - startOffset.pageX;
      var differenceY = currentOffset.pageY - startOffset.pageY;

      applyTouchMove(differenceX, differenceY);
      startOffset = currentOffset;

      var currentTime = (new Date()).getTime();

      var timeGap = currentTime - startTime;
      if (timeGap > 0) {
        speed.x = differenceX / timeGap;
        speed.y = differenceY / timeGap;
        startTime = currentTime;
      }

      if (shouldPreventDefault(differenceX, differenceY)) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }
  function touchEnd() {
    if (!inGlobalTouch && inLocalTouch) {
      inLocalTouch = false;

      clearInterval(easingLoop);
      easingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(easingLoop);
          return;
        }

        if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
          clearInterval(easingLoop);
          return;
        }

        applyTouchMove(speed.x * 30, speed.y * 30);

        speed.x *= 0.8;
        speed.y *= 0.8;
      }, 10);
    }
  }

  if (supportsTouch) {
    i.event.bind(window, 'touchstart', globalTouchStart);
    i.event.bind(window, 'touchend', globalTouchEnd);
    i.event.bind(element, 'touchstart', touchStart);
    i.event.bind(element, 'touchmove', touchMove);
    i.event.bind(element, 'touchend', touchEnd);
  }

  if (supportsIePointer) {
    if (window.PointerEvent) {
      i.event.bind(window, 'pointerdown', globalTouchStart);
      i.event.bind(window, 'pointerup', globalTouchEnd);
      i.event.bind(element, 'pointerdown', touchStart);
      i.event.bind(element, 'pointermove', touchMove);
      i.event.bind(element, 'pointerup', touchEnd);
    } else if (window.MSPointerEvent) {
      i.event.bind(window, 'MSPointerDown', globalTouchStart);
      i.event.bind(window, 'MSPointerUp', globalTouchEnd);
      i.event.bind(element, 'MSPointerDown', touchStart);
      i.event.bind(element, 'MSPointerMove', touchMove);
      i.event.bind(element, 'MSPointerUp', touchEnd);
    }
  }
}

module.exports = function (element, supportsTouch, supportsIePointer) {
  var i = instances.get(element);
  bindTouchHandler(element, i, supportsTouch, supportsIePointer);
};

},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],17:[function(require,module,exports){
'use strict';

var cls = require('../lib/class')
  , h = require('../lib/helper')
  , instances = require('./instances')
  , updateGeometry = require('./update-geometry');

// Handlers
var clickRailHandler = require('./handler/click-rail')
  , dragScrollbarHandler = require('./handler/drag-scrollbar')
  , keyboardHandler = require('./handler/keyboard')
  , mouseWheelHandler = require('./handler/mouse-wheel')
  , nativeScrollHandler = require('./handler/native-scroll')
  , selectionHandler = require('./handler/selection')
  , touchHandler = require('./handler/touch');

module.exports = function (element, userSettings) {
  userSettings = typeof userSettings === 'object' ? userSettings : {};

  cls.add(element, 'ps-container');

  // Create a plugin instance.
  var i = instances.add(element);

  i.settings = h.extend(i.settings, userSettings);
  cls.add(element, 'ps-theme-' + i.settings.theme);

  clickRailHandler(element);
  dragScrollbarHandler(element);
  mouseWheelHandler(element);
  nativeScrollHandler(element);

  if (i.settings.useSelectionScroll) {
    selectionHandler(element);
  }

  if (h.env.supportsTouch || h.env.supportsIePointer) {
    touchHandler(element, h.env.supportsTouch, h.env.supportsIePointer);
  }
  if (i.settings.useKeyboard) {
    keyboardHandler(element);
  }

  updateGeometry(element);
};

},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(require,module,exports){
'use strict';

var cls = require('../lib/class')
  , d = require('../lib/dom')
  , defaultSettings = require('./default-setting')
  , EventManager = require('../lib/event-manager')
  , guid = require('../lib/guid')
  , h = require('../lib/helper');

var instances = {};

function Instance(element) {
  var i = this;

  i.settings = h.clone(defaultSettings);
  i.containerWidth = null;
  i.containerHeight = null;
  i.contentWidth = null;
  i.contentHeight = null;

  i.isRtl = d.css(element, 'direction') === "rtl";
  i.isNegativeScroll = (function () {
    var originalScrollLeft = element.scrollLeft;
    var result = null;
    element.scrollLeft = -1;
    result = element.scrollLeft < 0;
    element.scrollLeft = originalScrollLeft;
    return result;
  })();
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;
  i.event = new EventManager();
  i.ownerDocument = element.ownerDocument || document;

  function focus() {
    cls.add(element, 'ps-focus');
  }

  function blur() {
    cls.remove(element, 'ps-focus');
  }

  i.scrollbarXRail = d.appendTo(d.e('div', 'ps-scrollbar-x-rail'), element);
  i.scrollbarX = d.appendTo(d.e('div', 'ps-scrollbar-x'), i.scrollbarXRail);
  i.scrollbarX.setAttribute('tabindex', 0);
  i.event.bind(i.scrollbarX, 'focus', focus);
  i.event.bind(i.scrollbarX, 'blur', blur);
  i.scrollbarXActive = null;
  i.scrollbarXWidth = null;
  i.scrollbarXLeft = null;
  i.scrollbarXBottom = h.toInt(d.css(i.scrollbarXRail, 'bottom'));
  i.isScrollbarXUsingBottom = i.scrollbarXBottom === i.scrollbarXBottom; // !isNaN
  i.scrollbarXTop = i.isScrollbarXUsingBottom ? null : h.toInt(d.css(i.scrollbarXRail, 'top'));
  i.railBorderXWidth = h.toInt(d.css(i.scrollbarXRail, 'borderLeftWidth')) + h.toInt(d.css(i.scrollbarXRail, 'borderRightWidth'));
  // Set rail to display:block to calculate margins
  d.css(i.scrollbarXRail, 'display', 'block');
  i.railXMarginWidth = h.toInt(d.css(i.scrollbarXRail, 'marginLeft')) + h.toInt(d.css(i.scrollbarXRail, 'marginRight'));
  d.css(i.scrollbarXRail, 'display', '');
  i.railXWidth = null;
  i.railXRatio = null;

  i.scrollbarYRail = d.appendTo(d.e('div', 'ps-scrollbar-y-rail'), element);
  i.scrollbarY = d.appendTo(d.e('div', 'ps-scrollbar-y'), i.scrollbarYRail);
  i.scrollbarY.setAttribute('tabindex', 0);
  i.event.bind(i.scrollbarY, 'focus', focus);
  i.event.bind(i.scrollbarY, 'blur', blur);
  i.scrollbarYActive = null;
  i.scrollbarYHeight = null;
  i.scrollbarYTop = null;
  i.scrollbarYRight = h.toInt(d.css(i.scrollbarYRail, 'right'));
  i.isScrollbarYUsingRight = i.scrollbarYRight === i.scrollbarYRight; // !isNaN
  i.scrollbarYLeft = i.isScrollbarYUsingRight ? null : h.toInt(d.css(i.scrollbarYRail, 'left'));
  i.scrollbarYOuterWidth = i.isRtl ? h.outerWidth(i.scrollbarY) : null;
  i.railBorderYWidth = h.toInt(d.css(i.scrollbarYRail, 'borderTopWidth')) + h.toInt(d.css(i.scrollbarYRail, 'borderBottomWidth'));
  d.css(i.scrollbarYRail, 'display', 'block');
  i.railYMarginHeight = h.toInt(d.css(i.scrollbarYRail, 'marginTop')) + h.toInt(d.css(i.scrollbarYRail, 'marginBottom'));
  d.css(i.scrollbarYRail, 'display', '');
  i.railYHeight = null;
  i.railYRatio = null;
}

function getId(element) {
  if (typeof element.dataset === 'undefined') {
    return element.getAttribute('data-ps-id');
  } else {
    return element.dataset.psId;
  }
}

function setId(element, id) {
  if (typeof element.dataset === 'undefined') {
    element.setAttribute('data-ps-id', id);
  } else {
    element.dataset.psId = id;
  }
}

function removeId(element) {
  if (typeof element.dataset === 'undefined') {
    element.removeAttribute('data-ps-id');
  } else {
    delete element.dataset.psId;
  }
}

exports.add = function (element) {
  var newId = guid();
  setId(element, newId);
  instances[newId] = new Instance(element);
  return instances[newId];
};

exports.remove = function (element) {
  delete instances[getId(element)];
  removeId(element);
};

exports.get = function (element) {
  return instances[getId(element)];
};

},{"../lib/class":2,"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(require,module,exports){
'use strict';

var cls = require('../lib/class')
  , d = require('../lib/dom')
  , h = require('../lib/helper')
  , instances = require('./instances')
  , updateScroll = require('./update-scroll');

function getThumbSize(i, thumbSize) {
  if (i.settings.minScrollbarLength) {
    thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
  }
  if (i.settings.maxScrollbarLength) {
    thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
  }
  return thumbSize;
}

function updateCss(element, i) {
  var xRailOffset = {width: i.railXWidth};
  if (i.isRtl) {
    xRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth - i.contentWidth;
  } else {
    xRailOffset.left = element.scrollLeft;
  }
  if (i.isScrollbarXUsingBottom) {
    xRailOffset.bottom = i.scrollbarXBottom - element.scrollTop;
  } else {
    xRailOffset.top = i.scrollbarXTop + element.scrollTop;
  }
  d.css(i.scrollbarXRail, xRailOffset);

  var yRailOffset = {top: element.scrollTop, height: i.railYHeight};
  if (i.isScrollbarYUsingRight) {
    if (i.isRtl) {
      yRailOffset.right = i.contentWidth - (i.negativeScrollAdjustment + element.scrollLeft) - i.scrollbarYRight - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
    }
  } else {
    if (i.isRtl) {
      yRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth * 2 - i.contentWidth - i.scrollbarYLeft - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
    }
  }
  d.css(i.scrollbarYRail, yRailOffset);

  d.css(i.scrollbarX, {left: i.scrollbarXLeft, width: i.scrollbarXWidth - i.railBorderXWidth});
  d.css(i.scrollbarY, {top: i.scrollbarYTop, height: i.scrollbarYHeight - i.railBorderYWidth});
}

module.exports = function (element) {
  var i = instances.get(element);

  i.containerWidth = element.clientWidth;
  i.containerHeight = element.clientHeight;
  i.contentWidth = element.scrollWidth;
  i.contentHeight = element.scrollHeight;

  var existingRails;
  if (!element.contains(i.scrollbarXRail)) {
    existingRails = d.queryChildren(element, '.ps-scrollbar-x-rail');
    if (existingRails.length > 0) {
      existingRails.forEach(function (rail) {
        d.remove(rail);
      });
    }
    d.appendTo(i.scrollbarXRail, element);
  }
  if (!element.contains(i.scrollbarYRail)) {
    existingRails = d.queryChildren(element, '.ps-scrollbar-y-rail');
    if (existingRails.length > 0) {
      existingRails.forEach(function (rail) {
        d.remove(rail);
      });
    }
    d.appendTo(i.scrollbarYRail, element);
  }

  if (!i.settings.suppressScrollX && i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth) {
    i.scrollbarXActive = true;
    i.railXWidth = i.containerWidth - i.railXMarginWidth;
    i.railXRatio = i.containerWidth / i.railXWidth;
    i.scrollbarXWidth = getThumbSize(i, h.toInt(i.railXWidth * i.containerWidth / i.contentWidth));
    i.scrollbarXLeft = h.toInt((i.negativeScrollAdjustment + element.scrollLeft) * (i.railXWidth - i.scrollbarXWidth) / (i.contentWidth - i.containerWidth));
  } else {
    i.scrollbarXActive = false;
  }

  if (!i.settings.suppressScrollY && i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight) {
    i.scrollbarYActive = true;
    i.railYHeight = i.containerHeight - i.railYMarginHeight;
    i.railYRatio = i.containerHeight / i.railYHeight;
    i.scrollbarYHeight = getThumbSize(i, h.toInt(i.railYHeight * i.containerHeight / i.contentHeight));
    i.scrollbarYTop = h.toInt(element.scrollTop * (i.railYHeight - i.scrollbarYHeight) / (i.contentHeight - i.containerHeight));
  } else {
    i.scrollbarYActive = false;
  }

  if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
    i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
  }
  if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
    i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
  }

  updateCss(element, i);

  if (i.scrollbarXActive) {
    cls.add(element, 'ps-active-x');
  } else {
    cls.remove(element, 'ps-active-x');
    i.scrollbarXWidth = 0;
    i.scrollbarXLeft = 0;
    updateScroll(element, 'left', 0);
  }
  if (i.scrollbarYActive) {
    cls.add(element, 'ps-active-y');
  } else {
    cls.remove(element, 'ps-active-y');
    i.scrollbarYHeight = 0;
    i.scrollbarYTop = 0;
    updateScroll(element, 'top', 0);
  }
};

},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-scroll":20}],20:[function(require,module,exports){
'use strict';

var instances = require('./instances');

var upEvent = document.createEvent('Event')
  , downEvent = document.createEvent('Event')
  , leftEvent = document.createEvent('Event')
  , rightEvent = document.createEvent('Event')
  , yEvent = document.createEvent('Event')
  , xEvent = document.createEvent('Event')
  , xStartEvent = document.createEvent('Event')
  , xEndEvent = document.createEvent('Event')
  , yStartEvent = document.createEvent('Event')
  , yEndEvent = document.createEvent('Event')
  , lastTop
  , lastLeft;

upEvent.initEvent('ps-scroll-up', true, true);
downEvent.initEvent('ps-scroll-down', true, true);
leftEvent.initEvent('ps-scroll-left', true, true);
rightEvent.initEvent('ps-scroll-right', true, true);
yEvent.initEvent('ps-scroll-y', true, true);
xEvent.initEvent('ps-scroll-x', true, true);
xStartEvent.initEvent('ps-x-reach-start', true, true);
xEndEvent.initEvent('ps-x-reach-end', true, true);
yStartEvent.initEvent('ps-y-reach-start', true, true);
yEndEvent.initEvent('ps-y-reach-end', true, true);

module.exports = function (element, axis, value) {
  if (typeof element === 'undefined') {
    throw 'You must provide an element to the update-scroll function';
  }

  if (typeof axis === 'undefined') {
    throw 'You must provide an axis to the update-scroll function';
  }

  if (typeof value === 'undefined') {
    throw 'You must provide a value to the update-scroll function';
  }

  if (axis === 'top' && value <= 0) {
    element.scrollTop = value = 0; // don't allow negative scroll
    element.dispatchEvent(yStartEvent);
  }

  if (axis === 'left' && value <= 0) {
    element.scrollLeft = value = 0; // don't allow negative scroll
    element.dispatchEvent(xStartEvent);
  }

  var i = instances.get(element);

  if (axis === 'top' && value >= i.contentHeight - i.containerHeight) {
    element.scrollTop = value = i.contentHeight - i.containerHeight; // don't allow scroll past container
    element.dispatchEvent(yEndEvent);
  }

  if (axis === 'left' && value >= i.contentWidth - i.containerWidth) {
    element.scrollLeft = value = i.contentWidth - i.containerWidth; // don't allow scroll past container
    element.dispatchEvent(xEndEvent);
  }

  if (!lastTop) {
    lastTop = element.scrollTop;
  }

  if (!lastLeft) {
    lastLeft = element.scrollLeft;
  }

  if (axis === 'top' && value < lastTop) {
    element.dispatchEvent(upEvent);
  }

  if (axis === 'top' && value > lastTop) {
    element.dispatchEvent(downEvent);
  }

  if (axis === 'left' && value < lastLeft) {
    element.dispatchEvent(leftEvent);
  }

  if (axis === 'left' && value > lastLeft) {
    element.dispatchEvent(rightEvent);
  }

  if (axis === 'top') {
    element.scrollTop = lastTop = value;
    element.dispatchEvent(yEvent);
  }

  if (axis === 'left') {
    element.scrollLeft = lastLeft = value;
    element.dispatchEvent(xEvent);
  }

};

},{"./instances":18}],21:[function(require,module,exports){
'use strict';

var d = require('../lib/dom')
  , h = require('../lib/helper')
  , instances = require('./instances')
  , updateGeometry = require('./update-geometry')
  , updateScroll = require('./update-scroll');

module.exports = function (element) {
  var i = instances.get(element);

  if (!i) {
    return;
  }

  // Recalcuate negative scrollLeft adjustment
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;

  // Recalculate rail margins
  d.css(i.scrollbarXRail, 'display', 'block');
  d.css(i.scrollbarYRail, 'display', 'block');
  i.railXMarginWidth = h.toInt(d.css(i.scrollbarXRail, 'marginLeft')) + h.toInt(d.css(i.scrollbarXRail, 'marginRight'));
  i.railYMarginHeight = h.toInt(d.css(i.scrollbarYRail, 'marginTop')) + h.toInt(d.css(i.scrollbarYRail, 'marginBottom'));

  // Hide scrollbars not to affect scrollWidth and scrollHeight
  d.css(i.scrollbarXRail, 'display', 'none');
  d.css(i.scrollbarYRail, 'display', 'none');

  updateGeometry(element);

  // Update top/left scroll to trigger events
  updateScroll(element, 'top', element.scrollTop);
  updateScroll(element, 'left', element.scrollLeft);

  d.css(i.scrollbarXRail, 'display', '');
  d.css(i.scrollbarYRail, 'display', '');
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-geometry":19,"./update-scroll":20}]},{},[1]);

(function(Plugin) {

	/*jslint indent: 2, browser: true, bitwise: true, plusplus: true */
	Plugin.Libs.Twemoji = (function (
		/*! Copyright Twitter Inc. and other contributors. Licensed under MIT *//*
		 https://github.com/twitter/twemoji/blob/gh-pages/LICENSE
		 */

		// WARNING:   this file is generated automatically via
		//            `node twemoji-generator.js`
		//            please update its `createTwemoji` function
		//            at the bottom of the same file instead.

	) {
		'use strict';

		/*jshint maxparams:4 */

		var
		// the exported module object
			twemoji = {


				/////////////////////////
				//      properties     //
				/////////////////////////

				// default assets url, by default will be Twitter Inc. CDN
				base: (location.protocol === 'https:' ? 'https:' : 'http:') +
				'//twemoji.maxcdn.com/',

				// default assets file extensions, by default '.png'
				ext: '.png',

				// default assets/folder size, by default "36x36"
				// available via Twitter CDN: 16, 36, 72
				size: '36x36',

				// default class name, by default 'emoji'
				className: 'emoji',

				// basic utilities / helpers to convert code points
				// to JavaScript surrogates and vice versa
				convert: {

					/**
					 * Given an HEX codepoint, returns UTF16 surrogate pairs.
					 *
					 * @param   string  generic codepoint, i.e. '1F4A9'
					 * @return  string  codepoint transformed into utf16 surrogates pair,
					 *          i.e. \uD83D\uDCA9
					 *
					 * @example
					 *  twemoji.convert.fromCodePoint('1f1e8');
					 *  // "\ud83c\udde8"
					 *
					 *  '1f1e8-1f1f3'.split('-').map(twemoji.convert.fromCodePoint).join('')
					 *  // "\ud83c\udde8\ud83c\uddf3"
					 */
					fromCodePoint: fromCodePoint,

					/**
					 * Given UTF16 surrogate pairs, returns the equivalent HEX codepoint.
					 *
					 * @param   string  generic utf16 surrogates pair, i.e. \uD83D\uDCA9
					 * @param   string  optional separator for double code points, default='-'
					 * @return  string  utf16 transformed into codepoint, i.e. '1F4A9'
					 *
					 * @example
					 *  twemoji.convert.toCodePoint('\ud83c\udde8\ud83c\uddf3');
					 *  // "1f1e8-1f1f3"
					 *
					 *  twemoji.convert.toCodePoint('\ud83c\udde8\ud83c\uddf3', '~');
					 *  // "1f1e8~1f1f3"
					 */
					toCodePoint: toCodePoint
				},


				/////////////////////////
				//       methods       //
				/////////////////////////

				/**
				 * User first: used to remove missing images
				 * preserving the original text intent when
				 * a fallback for network problems is desired.
				 * Automatically added to Image nodes via DOM
				 * It could be recycled for string operations via:
				 *  $('img.emoji').on('error', twemoji.onerror)
				 */
				onerror: function onerror() {
					if (this.parentNode) {
						this.parentNode.replaceChild(createText(this.alt), this);
					}
				},

				/**
				 * Main method/logic to generate either <img> tags or HTMLImage nodes.
				 *  "emojify" a generic text or DOM Element.
				 *
				 * @overloads
				 *
				 * String replacement for `innerHTML` or server side operations
				 *  twemoji.parse(string);
				 *  twemoji.parse(string, Function);
				 *  twemoji.parse(string, Object);
				 *
				 * HTMLElement tree parsing for safer operations over existing DOM
				 *  twemoji.parse(HTMLElement);
				 *  twemoji.parse(HTMLElement, Function);
				 *  twemoji.parse(HTMLElement, Object);
				 *
				 * @param   string|HTMLElement  the source to parse and enrich with emoji.
				 *
				 *          string              replace emoji matches with <img> tags.
				 *                              Mainly used to inject emoji via `innerHTML`
				 *                              It does **not** parse the string or validate it,
				 *                              it simply replaces found emoji with a tag.
				 *                              NOTE: be sure this won't affect security.
				 *
				 *          HTMLElement         walk through the DOM tree and find emoji
				 *                              that are inside **text node only** (nodeType === 3)
				 *                              Mainly used to put emoji in already generated DOM
				 *                              without compromising surrounding nodes and
				 *                              **avoiding** the usage of `innerHTML`.
				 *                              NOTE: Using DOM elements instead of strings should
				 *                              improve security without compromising too much
				 *                              performance compared with a less safe `innerHTML`.
				 *
				 * @param   Function|Object  [optional]
				 *                              either the callback that will be invoked or an object
				 *                              with all properties to use per each found emoji.
				 *
				 *          Function            if specified, this will be invoked per each emoji
				 *                              that has been found through the RegExp except
				 *                              those follwed by the invariant \uFE0E ("as text").
				 *                              Once invoked, parameters will be:
				 *
				 *                                codePoint:string  the lower case HEX code point
				 *                                                  i.e. "1f4a9"
				 *
				 *                                options:Object    all info for this parsing operation
				 *
				 *                                variant:char      the optional \uFE0F ("as image")
				 *                                                  variant, in case this info
				 *                                                  is anyhow meaningful.
				 *                                                  By default this is ignored.
				 *
				 *                              If such callback will return a falsy value instead
				 *                              of a valid `src` to use for the image, nothing will
				 *                              actually change for that specific emoji.
				 *
				 *
				 *          Object              if specified, an object containing the following properties
				 *
				 *            callback   Function  the callback to invoke per each found emoji.
				 *            base       string    the base url, by default twemoji.base
				 *            ext        string    the image extension, by default twemoji.ext
				 *            size       string    the assets size, by default twemoji.size
				 *
				 * @example
				 *
				 *  twemoji.parse("I \u2764\uFE0F emoji!");
				 *  // I <img class="emoji" draggable="false" alt="❤️" src="/assets/2764.gif"> emoji!
				 *
				 *
				 *  twemoji.parse("I \u2764\uFE0F emoji!", function(icon, options, variant) {
       *    return '/assets/' + icon + '.gif';
       *  });
				 *  // I <img class="emoji" draggable="false" alt="❤️" src="/assets/2764.gif"> emoji!
				 *
				 *
				 * twemoji.parse("I \u2764\uFE0F emoji!", {
       *   size: 72,
       *   callback: function(icon, options, variant) {
       *     return '/assets/' + options.size + '/' + icon + options.ext;
       *   }
       * });
				 *  // I <img class="emoji" draggable="false" alt="❤️" src="/assets/72x72/2764.png"> emoji!
				 *
				 */
				parse: parse,

				/**
				 * Given a string, invokes the callback argument
				 *  per each emoji found in such string.
				 * This is the most raw version used by
				 *  the .parse(string) method itself.
				 *
				 * @param   string    generic string to parse
				 * @param   Function  a generic callback that will be
				 *                    invoked to replace the content.
				 *                    This calback wil receive standard
				 *                    String.prototype.replace(str, callback)
				 *                    arguments such:
				 *  callback(
				 *    match,  // the emoji match
				 *    icon,   // the emoji text (same as text)
				 *    variant // either '\uFE0E' or '\uFE0F', if present
				 *  );
				 *
				 *                    and others commonly received via replace.
				 *
				 *  NOTE: When the variant \uFE0E is found, remember this is an explicit intent
				 *  from the user: the emoji should **not** be replaced with an image.
				 *  In \uFE0F case one, it's the opposite, it should be graphic.
				 *  This utility convetion is that only \uFE0E are not translated into images.
				 */
				replace: replace,

				/**
				 * Simplify string tests against emoji.
				 *
				 * @param   string  some text that might contain emoji
				 * @return  boolean true if any emoji was found, false otherwise.
				 *
				 * @example
				 *
				 *  if (twemoji.test(someContent)) {
       *    console.log("emoji All The Things!");
       *  }
				 */
				test: test
			},

		// used to escape HTML special chars in attributes
			escaper = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;'
			},

		// RegExp based on emoji's official Unicode standards
		// http://www.unicode.org/Public/UNIDATA/EmojiSources.txt
			re = /((?:\ud83c\udde8\ud83c\uddf3|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddef\ud83c\uddf5|\ud83c\uddee\ud83c\uddf9|\ud83c\uddec\ud83c\udde7|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddea\ud83c\uddf8|\ud83c\udde9\ud83c\uddea|\u0039\ufe0f?\u20e3|\u0038\ufe0f?\u20e3|\u0037\ufe0f?\u20e3|\u0036\ufe0f?\u20e3|\u0035\ufe0f?\u20e3|\u0034\ufe0f?\u20e3|\u0033\ufe0f?\u20e3|\u0032\ufe0f?\u20e3|\u0031\ufe0f?\u20e3|\u0030\ufe0f?\u20e3|\u0023\ufe0f?\u20e3|\ud83d\udeb3|\ud83d\udeb1|\ud83d\udeb0|\ud83d\udeaf|\ud83d\udeae|\ud83d\udea6|\ud83d\udea3|\ud83d\udea1|\ud83d\udea0|\ud83d\ude9f|\ud83d\ude9e|\ud83d\ude9d|\ud83d\ude9c|\ud83d\ude9b|\ud83d\ude98|\ud83d\ude96|\ud83d\ude94|\ud83d\ude90|\ud83d\ude8e|\ud83d\ude8d|\ud83d\ude8b|\ud83d\ude8a|\ud83d\ude88|\ud83d\ude86|\ud83d\ude82|\ud83d\ude81|\ud83d\ude36|\ud83d\ude34|\ud83d\ude2f|\ud83d\ude2e|\ud83d\ude2c|\ud83d\ude27|\ud83d\ude26|\ud83d\ude1f|\ud83d\ude1b|\ud83d\ude19|\ud83d\ude17|\ud83d\ude15|\ud83d\ude11|\ud83d\ude10|\ud83d\ude0e|\ud83d\ude08|\ud83d\ude07|\ud83d\ude00|\ud83d\udd67|\ud83d\udd66|\ud83d\udd65|\ud83d\udd64|\ud83d\udd63|\ud83d\udd62|\ud83d\udd61|\ud83d\udd60|\ud83d\udd5f|\ud83d\udd5e|\ud83d\udd5d|\ud83d\udd5c|\ud83d\udd2d|\ud83d\udd2c|\ud83d\udd15|\ud83d\udd09|\ud83d\udd08|\ud83d\udd07|\ud83d\udd06|\ud83d\udd05|\ud83d\udd04|\ud83d\udd02|\ud83d\udd01|\ud83d\udd00|\ud83d\udcf5|\ud83d\udcef|\ud83d\udced|\ud83d\udcec|\ud83d\udcb7|\ud83d\udcb6|\ud83d\udcad|\ud83d\udc6d|\ud83d\udc6c|\ud83d\udc65|\ud83d\udc2a|\ud83d\udc16|\ud83d\udc15|\ud83d\udc13|\ud83d\udc10|\ud83d\udc0f|\ud83d\udc0b|\ud83d\udc0a|\ud83d\udc09|\ud83d\udc08|\ud83d\udc07|\ud83d\udc06|\ud83d\udc05|\ud83d\udc04|\ud83d\udc03|\ud83d\udc02|\ud83d\udc01|\ud83d\udc00|\ud83c\udfe4|\ud83c\udfc9|\ud83c\udfc7|\ud83c\udf7c|\ud83c\udf50|\ud83c\udf4b|\ud83c\udf33|\ud83c\udf32|\ud83c\udf1e|\ud83c\udf1d|\ud83c\udf1c|\ud83c\udf1a|\ud83c\udf18|\ud83c\udccf|\ud83c\udd8e|\ud83c\udd91|\ud83c\udd92|\ud83c\udd93|\ud83c\udd94|\ud83c\udd95|\ud83c\udd96|\ud83c\udd97|\ud83c\udd98|\ud83c\udd99|\ud83c\udd9a|\ud83d\udc77|\ud83d\udec5|\ud83d\udec4|\ud83d\udec3|\ud83d\udec2|\ud83d\udec1|\ud83d\udebf|\ud83d\udeb8|\ud83d\udeb7|\ud83d\udeb5|\ud83c\ude01|\ud83c\ude32|\ud83c\ude33|\ud83c\ude34|\ud83c\ude35|\ud83c\ude36|\ud83c\ude38|\ud83c\ude39|\ud83c\ude3a|\ud83c\ude50|\ud83c\ude51|\ud83c\udf00|\ud83c\udf01|\ud83c\udf02|\ud83c\udf03|\ud83c\udf04|\ud83c\udf05|\ud83c\udf06|\ud83c\udf07|\ud83c\udf08|\ud83c\udf09|\ud83c\udf0a|\ud83c\udf0b|\ud83c\udf0c|\ud83c\udf0f|\ud83c\udf11|\ud83c\udf13|\ud83c\udf14|\ud83c\udf15|\ud83c\udf19|\ud83c\udf1b|\ud83c\udf1f|\ud83c\udf20|\ud83c\udf30|\ud83c\udf31|\ud83c\udf34|\ud83c\udf35|\ud83c\udf37|\ud83c\udf38|\ud83c\udf39|\ud83c\udf3a|\ud83c\udf3b|\ud83c\udf3c|\ud83c\udf3d|\ud83c\udf3e|\ud83c\udf3f|\ud83c\udf40|\ud83c\udf41|\ud83c\udf42|\ud83c\udf43|\ud83c\udf44|\ud83c\udf45|\ud83c\udf46|\ud83c\udf47|\ud83c\udf48|\ud83c\udf49|\ud83c\udf4a|\ud83c\udf4c|\ud83c\udf4d|\ud83c\udf4e|\ud83c\udf4f|\ud83c\udf51|\ud83c\udf52|\ud83c\udf53|\ud83c\udf54|\ud83c\udf55|\ud83c\udf56|\ud83c\udf57|\ud83c\udf58|\ud83c\udf59|\ud83c\udf5a|\ud83c\udf5b|\ud83c\udf5c|\ud83c\udf5d|\ud83c\udf5e|\ud83c\udf5f|\ud83c\udf60|\ud83c\udf61|\ud83c\udf62|\ud83c\udf63|\ud83c\udf64|\ud83c\udf65|\ud83c\udf66|\ud83c\udf67|\ud83c\udf68|\ud83c\udf69|\ud83c\udf6a|\ud83c\udf6b|\ud83c\udf6c|\ud83c\udf6d|\ud83c\udf6e|\ud83c\udf6f|\ud83c\udf70|\ud83c\udf71|\ud83c\udf72|\ud83c\udf73|\ud83c\udf74|\ud83c\udf75|\ud83c\udf76|\ud83c\udf77|\ud83c\udf78|\ud83c\udf79|\ud83c\udf7a|\ud83c\udf7b|\ud83c\udf80|\ud83c\udf81|\ud83c\udf82|\ud83c\udf83|\ud83c\udf84|\ud83c\udf85|\ud83c\udf86|\ud83c\udf87|\ud83c\udf88|\ud83c\udf89|\ud83c\udf8a|\ud83c\udf8b|\ud83c\udf8c|\ud83c\udf8d|\ud83c\udf8e|\ud83c\udf8f|\ud83c\udf90|\ud83c\udf91|\ud83c\udf92|\ud83c\udf93|\ud83c\udfa0|\ud83c\udfa1|\ud83c\udfa2|\ud83c\udfa3|\ud83c\udfa4|\ud83c\udfa5|\ud83c\udfa6|\ud83c\udfa7|\ud83c\udfa8|\ud83c\udfa9|\ud83c\udfaa|\ud83c\udfab|\ud83c\udfac|\ud83c\udfad|\ud83c\udfae|\ud83c\udfaf|\ud83c\udfb0|\ud83c\udfb1|\ud83c\udfb2|\ud83c\udfb3|\ud83c\udfb4|\ud83c\udfb5|\ud83c\udfb6|\ud83c\udfb7|\ud83c\udfb8|\ud83c\udfb9|\ud83c\udfba|\ud83c\udfbb|\ud83c\udfbc|\ud83c\udfbd|\ud83c\udfbe|\ud83c\udfbf|\ud83c\udfc0|\ud83c\udfc1|\ud83c\udfc2|\ud83c\udfc3|\ud83c\udfc4|\ud83c\udfc6|\ud83c\udfc8|\ud83c\udfca|\ud83c\udfe0|\ud83c\udfe1|\ud83c\udfe2|\ud83c\udfe3|\ud83c\udfe5|\ud83c\udfe6|\ud83c\udfe7|\ud83c\udfe8|\ud83c\udfe9|\ud83c\udfea|\ud83c\udfeb|\ud83c\udfec|\ud83c\udfed|\ud83c\udfee|\ud83c\udfef|\ud83c\udff0|\ud83d\udc0c|\ud83d\udc0d|\ud83d\udc0e|\ud83d\udc11|\ud83d\udc12|\ud83d\udc14|\ud83d\udc17|\ud83d\udc18|\ud83d\udc19|\ud83d\udc1a|\ud83d\udc1b|\ud83d\udc1c|\ud83d\udc1d|\ud83d\udc1e|\ud83d\udc1f|\ud83d\udc20|\ud83d\udc21|\ud83d\udc22|\ud83d\udc23|\ud83d\udc24|\ud83d\udc25|\ud83d\udc26|\ud83d\udc27|\ud83d\udc28|\ud83d\udc29|\ud83d\udc2b|\ud83d\udc2c|\ud83d\udc2d|\ud83d\udc2e|\ud83d\udc2f|\ud83d\udc30|\ud83d\udc31|\ud83d\udc32|\ud83d\udc33|\ud83d\udc34|\ud83d\udc35|\ud83d\udc36|\ud83d\udc37|\ud83d\udc38|\ud83d\udc39|\ud83d\udc3a|\ud83d\udc3b|\ud83d\udc3c|\ud83d\udc3d|\ud83d\udc3e|\ud83d\udc40|\ud83d\udc42|\ud83d\udc43|\ud83d\udc44|\ud83d\udc45|\ud83d\udc46|\ud83d\udc47|\ud83d\udc48|\ud83d\udc49|\ud83d\udc4a|\ud83d\udc4b|\ud83d\udc4c|\ud83d\udc4d|\ud83d\udc4e|\ud83d\udc4f|\ud83d\udc50|\ud83d\udc51|\ud83d\udc52|\ud83d\udc53|\ud83d\udc54|\ud83d\udc55|\ud83d\udc56|\ud83d\udc57|\ud83d\udc58|\ud83d\udc59|\ud83d\udc5a|\ud83d\udc5b|\ud83d\udc5c|\ud83d\udc5d|\ud83d\udc5e|\ud83d\udc5f|\ud83d\udc60|\ud83d\udc61|\ud83d\udc62|\ud83d\udc63|\ud83d\udc64|\ud83d\udc66|\ud83d\udc67|\ud83d\udc68|\ud83d\udc69|\ud83d\udc6a|\ud83d\udc6b|\ud83d\udc6e|\ud83d\udc6f|\ud83d\udc70|\ud83d\udc71|\ud83d\udc72|\ud83d\udc73|\ud83d\udc74|\ud83d\udc75|\ud83d\udc76|\ud83d\udeb4|\ud83d\udc78|\ud83d\udc79|\ud83d\udc7a|\ud83d\udc7b|\ud83d\udc7c|\ud83d\udc7d|\ud83d\udc7e|\ud83d\udc7f|\ud83d\udc80|\ud83d\udc81|\ud83d\udc82|\ud83d\udc83|\ud83d\udc84|\ud83d\udc85|\ud83d\udc86|\ud83d\udc87|\ud83d\udc88|\ud83d\udc89|\ud83d\udc8a|\ud83d\udc8b|\ud83d\udc8c|\ud83d\udc8d|\ud83d\udc8e|\ud83d\udc8f|\ud83d\udc90|\ud83d\udc91|\ud83d\udc92|\ud83d\udc93|\ud83d\udc94|\ud83d\udc95|\ud83d\udc96|\ud83d\udc97|\ud83d\udc98|\ud83d\udc99|\ud83d\udc9a|\ud83d\udc9b|\ud83d\udc9c|\ud83d\udc9d|\ud83d\udc9e|\ud83d\udc9f|\ud83d\udca0|\ud83d\udca1|\ud83d\udca2|\ud83d\udca3|\ud83d\udca4|\ud83d\udca5|\ud83d\udca6|\ud83d\udca7|\ud83d\udca8|\ud83d\udca9|\ud83d\udcaa|\ud83d\udcab|\ud83d\udcac|\ud83d\udcae|\ud83d\udcaf|\ud83d\udcb0|\ud83d\udcb1|\ud83d\udcb2|\ud83d\udcb3|\ud83d\udcb4|\ud83d\udcb5|\ud83d\udcb8|\ud83d\udcb9|\ud83d\udcba|\ud83d\udcbb|\ud83d\udcbc|\ud83d\udcbd|\ud83d\udcbe|\ud83d\udcbf|\ud83d\udcc0|\ud83d\udcc1|\ud83d\udcc2|\ud83d\udcc3|\ud83d\udcc4|\ud83d\udcc5|\ud83d\udcc6|\ud83d\udcc7|\ud83d\udcc8|\ud83d\udcc9|\ud83d\udcca|\ud83d\udccb|\ud83d\udccc|\ud83d\udccd|\ud83d\udcce|\ud83d\udccf|\ud83d\udcd0|\ud83d\udcd1|\ud83d\udcd2|\ud83d\udcd3|\ud83d\udcd4|\ud83d\udcd5|\ud83d\udcd6|\ud83d\udcd7|\ud83d\udcd8|\ud83d\udcd9|\ud83d\udcda|\ud83d\udcdb|\ud83d\udcdc|\ud83d\udcdd|\ud83d\udcde|\ud83d\udcdf|\ud83d\udce0|\ud83d\udce1|\ud83d\udce2|\ud83d\udce3|\ud83d\udce4|\ud83d\udce5|\ud83d\udce6|\ud83d\udce7|\ud83d\udce8|\ud83d\udce9|\ud83d\udcea|\ud83d\udceb|\ud83d\udcee|\ud83d\udcf0|\ud83d\udcf1|\ud83d\udcf2|\ud83d\udcf3|\ud83d\udcf4|\ud83d\udcf6|\ud83d\udcf7|\ud83d\udcf9|\ud83d\udcfa|\ud83d\udcfb|\ud83d\udcfc|\ud83d\udd03|\ud83d\udd0a|\ud83d\udd0b|\ud83d\udd0c|\ud83d\udd0d|\ud83d\udd0e|\ud83d\udd0f|\ud83d\udd10|\ud83d\udd11|\ud83d\udd12|\ud83d\udd13|\ud83d\udd14|\ud83d\udd16|\ud83d\udd17|\ud83d\udd18|\ud83d\udd19|\ud83d\udd1a|\ud83d\udd1b|\ud83d\udd1c|\ud83d\udd1d|\ud83d\udd1e|\ud83d\udd1f|\ud83d\udd20|\ud83d\udd21|\ud83d\udd22|\ud83d\udd23|\ud83d\udd24|\ud83d\udd25|\ud83d\udd26|\ud83d\udd27|\ud83d\udd28|\ud83d\udd29|\ud83d\udd2a|\ud83d\udd2b|\ud83d\udd2e|\ud83d\udd2f|\ud83d\udd30|\ud83d\udd31|\ud83d\udd32|\ud83d\udd33|\ud83d\udd34|\ud83d\udd35|\ud83d\udd36|\ud83d\udd37|\ud83d\udd38|\ud83d\udd39|\ud83d\udd3a|\ud83d\udd3b|\ud83d\udd3c|\ud83d\udd3d|\ud83d\udd50|\ud83d\udd51|\ud83d\udd52|\ud83d\udd53|\ud83d\udd54|\ud83d\udd55|\ud83d\udd56|\ud83d\udd57|\ud83d\udd58|\ud83d\udd59|\ud83d\udd5a|\ud83d\udd5b|\ud83d\uddfb|\ud83d\uddfc|\ud83d\uddfd|\ud83d\uddfe|\ud83d\uddff|\ud83d\ude01|\ud83d\ude02|\ud83d\ude03|\ud83d\ude04|\ud83d\ude05|\ud83d\ude06|\ud83d\ude09|\ud83d\ude0a|\ud83d\ude0b|\ud83d\ude0c|\ud83d\ude0d|\ud83d\ude0f|\ud83d\ude12|\ud83d\ude13|\ud83d\ude14|\ud83d\ude16|\ud83d\ude18|\ud83d\ude1a|\ud83d\ude1c|\ud83d\ude1d|\ud83d\ude1e|\ud83d\ude20|\ud83d\ude21|\ud83d\ude22|\ud83d\ude23|\ud83d\ude24|\ud83d\ude25|\ud83d\ude28|\ud83d\ude29|\ud83d\ude2a|\ud83d\ude2b|\ud83d\ude2d|\ud83d\ude30|\ud83d\ude31|\ud83d\ude32|\ud83d\ude33|\ud83d\ude35|\ud83d\ude37|\ud83d\ude38|\ud83d\ude39|\ud83d\ude3a|\ud83d\ude3b|\ud83d\ude3c|\ud83d\ude3d|\ud83d\ude3e|\ud83d\ude3f|\ud83d\ude40|\ud83d\ude45|\ud83d\ude46|\ud83d\ude47|\ud83d\ude48|\ud83d\ude49|\ud83d\ude4a|\ud83d\ude4b|\ud83d\ude4c|\ud83d\ude4d|\ud83d\ude4e|\ud83d\ude4f|\ud83d\ude80|\ud83d\ude83|\ud83d\ude84|\ud83d\ude85|\ud83d\ude87|\ud83d\ude89|\ud83d\ude8c|\ud83d\ude8f|\ud83d\ude91|\ud83d\ude92|\ud83d\ude93|\ud83d\ude95|\ud83d\ude97|\ud83d\ude99|\ud83d\ude9a|\ud83d\udea2|\ud83d\udea4|\ud83d\udea5|\ud83d\udea7|\ud83d\udea8|\ud83d\udea9|\ud83d\udeaa|\ud83d\udeab|\ud83d\udeac|\ud83d\udead|\ud83d\udeb2|\ud83d\udeb6|\ud83d\udeb9|\ud83d\udeba|\ud83d\udebb|\ud83d\udebc|\ud83d\udebd|\ud83d\udebe|\ud83d\udec0|\ud83c\udde6|\ud83c\udde7|\ud83c\udde8|\ud83c\udde9|\ud83c\uddea|\ud83c\uddeb|\ud83c\uddec|\ud83c\udded|\ud83c\uddee|\ud83c\uddef|\ud83c\uddf0|\ud83c\uddf1|\ud83c\uddf2|\ud83c\uddf3|\ud83c\uddf4|\ud83c\uddf5|\ud83c\uddf6|\ud83c\uddf7|\ud83c\uddf8|\ud83c\uddf9|\ud83c\uddfa|\ud83c\uddfb|\ud83c\uddfc|\ud83c\uddfd|\ud83c\uddfe|\ud83c\uddff|\ud83c\udf0d|\ud83c\udf0e|\ud83c\udf10|\ud83c\udf12|\ud83c\udf16|\ud83c\udf17|\ue50a|\u27b0|\u2797|\u2796|\u2795|\u2755|\u2754|\u2753|\u274e|\u274c|\u2728|\u270b|\u270a|\u2705|\u26ce|\u23f3|\u23f0|\u23ec|\u23eb|\u23ea|\u23e9|\u27bf|\u00a9|\u00ae)|(?:(?:\ud83c\udc04|\ud83c\udd70|\ud83c\udd71|\ud83c\udd7e|\ud83c\udd7f|\ud83c\ude02|\ud83c\ude1a|\ud83c\ude2f|\ud83c\ude37|\u3299|\u303d|\u3030|\u2b55|\u2b50|\u2b1c|\u2b1b|\u2b07|\u2b06|\u2b05|\u2935|\u2934|\u27a1|\u2764|\u2757|\u2747|\u2744|\u2734|\u2733|\u2716|\u2714|\u2712|\u270f|\u270c|\u2709|\u2708|\u2702|\u26fd|\u26fa|\u26f5|\u26f3|\u26f2|\u26ea|\u26d4|\u26c5|\u26c4|\u26be|\u26bd|\u26ab|\u26aa|\u26a1|\u26a0|\u2693|\u267f|\u267b|\u3297|\u2666|\u2665|\u2663|\u2660|\u2653|\u2652|\u2651|\u2650|\u264f|\u264e|\u264d|\u264c|\u264b|\u264a|\u2649|\u2648|\u263a|\u261d|\u2615|\u2614|\u2611|\u260e|\u2601|\u2600|\u25fe|\u25fd|\u25fc|\u25fb|\u25c0|\u25b6|\u25ab|\u25aa|\u24c2|\u231b|\u231a|\u21aa|\u21a9|\u2199|\u2198|\u2197|\u2196|\u2195|\u2194|\u2139|\u2122|\u2049|\u203c|\u2668)([\uFE0E\uFE0F]?)))/g,

		// used to find HTML special chars in attributes
			rescaper = /[&<>'"]/g,

		// nodes with type 1 which should **not** be parsed (including lower case svg)
			shouldntBeParsed = /IFRAME|NOFRAMES|NOSCRIPT|SCRIPT|SELECT|STYLE|TEXTAREA|[a-z]/,

		// just a private shortcut
			fromCharCode = String.fromCharCode;

		return twemoji;


		/////////////////////////
		//  private functions  //
		//     declaration     //
		/////////////////////////

		/**
		 * Shortcut to create text nodes
		 * @param   string  text used to create DOM text node
		 * @return  Node  a DOM node with that text
		 */
		function createText(text) {
			return document.createTextNode(text);
		}

		/**
		 * Utility function to escape html attribute text
		 * @param   string  text use in HTML attribute
		 * @return  string  text encoded to use in HTML attribute
		 */
		function escapeHTML(s) {
			return s.replace(rescaper, replacer);
		}

		/**
		 * Default callback used to generate emoji src
		 *  based on Twitter CDN
		 * @param   string    the emoji codepoint string
		 * @param   string    the default size to use, i.e. "36x36"
		 * @param   string    optional "\uFE0F" variant char, ignored by default
		 * @return  string    the image source to use
		 */
		function defaultImageSrcGenerator(icon, options) {
			return ''.concat(options.base, options.size, '/', icon, options.ext);
		}

		/**
		 * Given a generic DOM nodeType 1, walk through all children
		 * and store every nodeType 3 (#text) found in the tree.
		 * @param   Element a DOM Element with probably some text in it
		 * @param   Array the list of previously discovered text nodes
		 * @return  Array same list with new discovered nodes, if any
		 */
		function grabAllTextNodes(node, allText) {
			var
				childNodes = node.childNodes,
				length = childNodes.length,
				subnode,
				nodeType;
			while (length--) {
				subnode = childNodes[length];
				nodeType = subnode.nodeType;
				// parse emoji only in text nodes
				if (nodeType === 3) {
					// collect them to process emoji later
					allText.push(subnode);
				}
				// ignore all nodes that are not type 1 or that
				// should not be parsed as script, style, and others
				else if (nodeType === 1 && !shouldntBeParsed.test(subnode.nodeName)) {
					grabAllTextNodes(subnode, allText);
				}
			}
			return allText;
		}

		/**
		 * Used to both remove the possible variant
		 *  and to convert utf16 into code points
		 * @param   string    the emoji surrogate pair
		 * @param   string    the optional variant char, if any
		 */
		function grabTheRightIcon(icon, variant) {
			// if variant is present as \uFE0F
			return toCodePoint(
				variant === '\uFE0F' ?
					// the icon should not contain it
					icon.slice(0, -1) :
					// fix non standard OSX behavior
					(icon.length === 3 && icon.charAt(1) === '\uFE0F' ?
					icon.charAt(0) + icon.charAt(2) : icon)
			);
		}

		/**
		 * DOM version of the same logic / parser:
		 *  emojify all found sub-text nodes placing images node instead.
		 * @param   Element   generic DOM node with some text in some child node
		 * @param   Object    options  containing info about how to parse
		 *
		 *            .callback   Function  the callback to invoke per each found emoji.
		 *            .base       string    the base url, by default twemoji.base
		 *            .ext        string    the image extension, by default twemoji.ext
		 *            .size       string    the assets size, by default twemoji.size
		 *
		 * @return  Element same generic node with emoji in place, if any.
		 */
		function parseNode(node, options) {
			var
				allText = grabAllTextNodes(node, []),
				length = allText.length,
				attrib,
				attrname,
				modified,
				fragment,
				subnode,
				text,
				match,
				i,
				index,
				img,
				alt,
				icon,
				variant,
				src;
			while (length--) {
				modified = false;
				fragment = document.createDocumentFragment();
				subnode = allText[length];
				text = subnode.nodeValue;
				i = 0;
				while ((match = re.exec(text))) {
					index = match.index;
					if (index !== i) {
						fragment.appendChild(
							createText(text.slice(i, index))
						);
					}
					alt = match[0];
					icon = match[1];
					variant = match[2];
					i = index + alt.length;
					if (variant !== '\uFE0E') {
						src = options.callback(
							grabTheRightIcon(icon, variant),
							options,
							variant
						);
						if (src) {
							img = new Image();
							img.onerror = options.onerror;
							img.setAttribute('draggable', 'false');
							attrib = options.attributes(icon, variant);
							for (attrname in attrib) {
								if (
									attrib.hasOwnProperty(attrname) &&
										// don't allow any handlers to be set + don't allow overrides
									attrname.indexOf('on') !== 0 &&
									!img.hasAttribute(attrname)
								) {
									img.setAttribute(attrname, attrib[attrname]);
								}
							}
							img.className = options.className;
							img.alt = alt;
							img.src = src;
							modified = true;
							fragment.appendChild(img);
						}
					}
					if (!img) fragment.appendChild(createText(alt));
					img = null;
				}
				// is there actually anything to replace in here ?
				if (modified) {
					// any text left to be added ?
					if (i < text.length) {
						fragment.appendChild(
							createText(text.slice(i))
						);
					}
					// replace the text node only, leave intact
					// anything else surrounding such text
					subnode.parentNode.replaceChild(fragment, subnode);
				}
			}
			return node;
		}

		/**
		 * String/HTML version of the same logic / parser:
		 *  emojify a generic text placing images tags instead of surrogates pair.
		 * @param   string    generic string with possibly some emoji in it
		 * @param   Object    options  containing info about how to parse
		 *
		 *            .callback   Function  the callback to invoke per each found emoji.
		 *            .base       string    the base url, by default twemoji.base
		 *            .ext        string    the image extension, by default twemoji.ext
		 *            .size       string    the assets size, by default twemoji.size
		 *
		 * @return  the string with <img tags> replacing all found and parsed emoji
		 */
		function parseString(str, options) {
			return replace(str, function (match, icon, variant) {
				var
					ret = match,
					attrib,
					attrname,
					src;
				// verify the variant is not the FE0E one
				// this variant means "emoji as text" and should not
				// require any action/replacement
				// http://unicode.org/Public/UNIDATA/StandardizedVariants.html
				if (variant !== '\uFE0E') {
					src = options.callback(
						grabTheRightIcon(icon, variant),
						options,
						variant
					);
					if (src) {
						// recycle the match string replacing the emoji
						// with its image counter part
						ret = '<img '.concat(
							'class="', options.className, '" ',
							'draggable="false" ',
							// needs to preserve user original intent
							// when variants should be copied and pasted too
							'alt="',
							match,
							'"',
							' src="',
							src,
							'"'
						);
						attrib = options.attributes(icon, variant);
						for (attrname in attrib) {
							if (
								attrib.hasOwnProperty(attrname) &&
									// don't allow any handlers to be set + don't allow overrides
								attrname.indexOf('on') !== 0 &&
								ret.indexOf(' ' + attrname + '=') === -1
							) {
								ret = ret.concat(' ', attrname, '="', escapeHTML(attrib[attrname]), '"');
							}
						}
						ret = ret.concat('>');
					}
				}
				return ret;
			});
		}

		/**
		 * Function used to actually replace HTML special chars
		 * @param   string  HTML special char
		 * @return  string  encoded HTML special char
		 */
		function replacer(m) {
			return escaper[m];
		}

		/**
		 * Default options.attribute callback
		 * @return  null
		 */
		function returnNull() {
			return null;
		}

		/**
		 * Given a generic value, creates its squared counterpart if it's a number.
		 *  As example, number 36 will return '36x36'.
		 * @param   any     a generic value.
		 * @return  any     a string representing asset size, i.e. "36x36"
		 *                  only in case the value was a number.
		 *                  Returns initial value otherwise.
		 */
		function toSizeSquaredAsset(value) {
			return typeof value === 'number' ?
			value + 'x' + value :
				value;
		}


		/////////////////////////
		//  exported functions //
		//     declaration     //
		/////////////////////////

		function fromCodePoint(codepoint) {
			var code = typeof codepoint === 'string' ?
				parseInt(codepoint, 16) : codepoint;
			if (code < 0x10000) {
				return fromCharCode(code);
			}
			code -= 0x10000;
			return fromCharCode(
				0xD800 + (code >> 10),
				0xDC00 + (code & 0x3FF)
			);
		}

		function parse(what, how) {
			if (!how || typeof how === 'function') {
				how = {callback: how};
			}
			// if first argument is string, inject html <img> tags
			// otherwise use the DOM tree and parse text nodes only
			return (typeof what === 'string' ? parseString : parseNode)(what, {
				callback:   how.callback || defaultImageSrcGenerator,
				attributes: typeof how.attributes === 'function' ? how.attributes : returnNull,
				base:       typeof how.base === 'string' ? how.base : twemoji.base,
				ext:        how.ext || twemoji.ext,
				size:       how.folder || toSizeSquaredAsset(how.size || twemoji.size),
				className:  how.className || twemoji.className,
				onerror:    how.onerror || twemoji.onerror
			});
		}

		function replace(text, callback) {
			return String(text).replace(re, callback);
		}

		function test(text) {
			// IE6 needs a reset before too
			re.lastIndex = 0;
			var result = re.test(text);
			re.lastIndex = 0;
			return result;
		}

		function toCodePoint(unicodeSurrogates, sep) {
			var
				r = [],
				c = 0,
				p = 0,
				i = 0;
			while (i < unicodeSurrogates.length) {
				c = unicodeSurrogates.charCodeAt(i++);
				if (p) {
					r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
					p = 0;
				} else if (0xD800 <= c && c <= 0xDBFF) {
					p = c;
				} else {
					r.push(c.toString(16));
				}
			}
			return r.join(sep || '-');
		}

	}());

})(window.StickersModule);

window.StickersModule.Service = {};

(function(Plugin) {

	Plugin.Service.Ajax = function(options) {
		options = options || {};

		if (!options.url) {
			return;
		}

		options.type = (options.type && options.type.toUpperCase()) || 'GET';
		options.headers = options.headers || {};
		options.data = options.data || {};
		options.success = options.success || function() {};
		options.error = options.error || function() {};
		options.complete = options.complete || function() {};

		options.headers.Apikey = Plugin.Configs.apiKey;
		options.headers.Platform = 'JS';
		options.headers.Localization = Plugin.Configs.lang;
		options.headers.UserId = Plugin.Configs.userId;

		if (options.type == 'POST' || options.type == 'PUT') {
			options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
			options.headers['DeviceId'] = Plugin.Service.Storage.getDeviceId();
		}


		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open(options.type, options.url, true);

		for (var name in options.headers) {
			xmlhttp.setRequestHeader(name, options.headers[name]);
		}

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					options.success(JSON.parse(xmlhttp.responseText), xmlhttp);
				} else {
					var response = {};
					try {
						response = JSON.parse(xmlhttp.responseText);
					} catch (ex) {
						response = {}
					}
					options.error(response, xmlhttp);
				}

				options.complete(JSON.parse(xmlhttp.responseText), xmlhttp);
			}
		};

		xmlhttp.send(JSON.stringify(options.data));
	};

})(window.StickersModule);

(function(Plugin) {

	var API_VERSION = 2;

	Plugin.Service.Api = {

		getApiVersion: function() {
			return API_VERSION;
		},

		getPacks: function(successCallback) {
			Plugin.Service.Ajax({
				type: 'get',
				url: Plugin.Service.Url.getUserPacksUrl(),
				success: function(response) {
					response = response || {};
					response.meta = response.meta || {};
					response.meta.shop_last_modified = response.meta.shop_last_modified || 0;

					Plugin.Service.Storage.setStoreLastModified(response.meta.shop_last_modified * 1000);

					successCallback && successCallback(response.data);
				}
			});
		},

		getPackPreview: function(packName, successCallback) {
			Plugin.Service.Ajax({
				type: 'get',
				url: Plugin.Service.Url.getPackPreviewUrl(packName),
				success: function(response) {
					successCallback && successCallback(response.data);
				}
			});
		},

		sendStatistic: function(statistic) {
			Plugin.Service.Ajax({
				type: 'post',
				url: Plugin.Service.Url.getStatisticUrl(),
				data: statistic
			});
		},

		updateUserData: function(userData) {
			return Plugin.Service.Ajax({
				type: 'put',
				url: Plugin.Service.Url.getUserDataUrl(),
				data: userData,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		},

		purchasePack: function(packName, pricePoint, successCallback, failCallback) {
			Plugin.Service.Ajax({
				type: 'post',
				url: Plugin.Service.Url.getPurchaseUrl(packName, pricePoint),
				success: function(response) {
					successCallback && successCallback(response.data);
				},
				error: function() {
					var pr = Plugin.Service.PendingRequest;
					pr.add(pr.tasks.purchasePack, {
						packName: packName,
						pricePoint: pricePoint
					});

					failCallback && failCallback();
				}
			});
		},

		getContentById: function(contentId, successCallback) {
			Plugin.Service.Ajax({
				type: 'get',
				url: Plugin.Service.Url.getContentByIdUrl(contentId),
				success: function(response) {
					successCallback && successCallback(response.data);
				}
			});
		},

		hidePack: function(packName, successCallback, failCallback) {
			return Plugin.Service.Ajax({
				type: 'DELETE',
				url: Plugin.Service.Url.getHidePackUrl(packName),
				success: function(response) {
					successCallback && successCallback(response.data);
				},
				error: function() {
					failCallback && failCallback();
				}
			});
		}
	};
})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.El = {

		css: function(el, property) {
			// todo: getComputedStyle add IE 8 supporting

			return (el.style && el.style[property])
				|| (el.currentStyle && el.currentStyle[property])
				|| (getComputedStyle(el)[property]);

		},

		outerWidth: function(el) {
			var width = el.offsetWidth;
			width += parseInt(this.css(el, 'marginLeft')) + parseInt(this.css(el, 'marginRight'));
			return width;
		},

		appendAfter: function(newNode, referenceNode) {
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		},

		getParents: function (elem, selector) {

			var parents = [];
			if ( selector ) {
				var firstChar = selector.charAt(0);
			}

			// Get matches
			for ( ; elem && elem !== document; elem = elem.parentNode ) {
				if ( selector ) {

					// If selector is a class
					if ( firstChar === '.' ) {
						if ( elem.classList.contains( selector.substr(1) ) ) {
							parents.push( elem );
						}
					}

					// If selector is an ID
					if ( firstChar === '#' ) {
						if ( elem.id === selector.substr(1) ) {
							parents.push( elem );
						}
					}

					// If selector is a data attribute
					if ( firstChar === '[' ) {
						if ( elem.hasAttribute( selector.substr(1, selector.length - 1) )) {
							parents.push( elem );
						}
					}

					// If selector is a tag
					if ( elem.tagName.toLowerCase() === selector ) {
						parents.push( elem );
					}

				} else {
					parents.push( elem );
				}

			}

			// Return parents if any exist
			if ( parents.length === 0 ) {
				return null;
			} else {
				return parents;
			}

		}
	};
})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.Emoji = {

		emojiProvider: null,

		init: function(emojiProvider) {
			this.emojiProvider = emojiProvider;
		},

		parseEmojiFromText: function(text) {
			return this.emojiProvider.parse(text, {
				size: (window.devicePixelRatio == 2) ? 72 : 36
			});
		},

		parseEmojiFromHtml: function(html) {
			var content = document.createElement('div');
			content.innerHTML = html;

			var emojisEls = content.getElementsByClassName('emoji');

			for (var i = emojisEls.length - 1; i >= 0; i--) {
				var emoji = emojisEls[i].getAttribute('alt');
				content.replaceChild(document.createTextNode(emoji), emojisEls[i]);
			}

			return content.innerHTML;
		}
	};

})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.Event = {

		events: {
			resize: 'resize',
			popoverShown: 'sp:popover:shown',
			popoverHidden: 'sp:popover:hidden',
			showContentHighlight: 'sp:content:highlight:show',
			hideContentHighlight: 'sp:content:highlight:hide'
		},

		dispatch: function(eventName, el) {
			if (!eventName) {
				return;
			}

			el = el || window;

			var event;
			if (document.createEvent) {
				event = document.createEvent('HTMLEvents');
				event.initEvent(eventName, true, true);
			} else if (document.createEventObject) { // IE < 9
				event = document.createEventObject();
				event.eventType = eventName;
			}

			event.eventName = eventName;

			if (el.dispatchEvent) {
				el.dispatchEvent(event);
			} else if (el.fireEvent) { // IE < 9
				el.fireEvent('on' + event.eventType, event);// can trigger only real event (e.g. 'click')
			} else if (el[eventName]) {
				el[eventName]();
			} else if (el['on' + eventName]) {
				el['on' + eventName]();
			}
		},

		popoverShown: function() {
			this.dispatch(this.events.popoverShown);
		},

		popoverHidden: function() {
			this.dispatch(this.events.popoverHidden);
		},

		changeContentHighlight: function(value) {
			this.dispatch((value) ? this.events.showContentHighlight : this.events.hideContentHighlight);
		},

		resize: function(el) {
			this.dispatch(this.events.resize, el);
		}
	};

})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.Helper = {

		extend: function(out) {
			out = out || {};

			for (var i = 1; i < arguments.length; i++) {
				if (!arguments[i])
					continue;

				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key))
						out[key] = arguments[i][key];
				}
			}

			return out;
		},

		setConfig: function(config) {
			Plugin.Configs = this.extend({}, Plugin.Configs || {}, config);
		},

		setEvent: function(eventType, el, className, callback) {

			el.addEventListener(eventType, function (event) {

				var el = event.target, found;

				while (el && !(found = el.className.match(className))) {
					el = el.parentElement;
				}

				if (found) {
					callback(el, event);
				}
			});
		},

		urlParamsSerialize: function(params) {
			var str = [];
			for(var p in params)
				if (params.hasOwnProperty(p)) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
				}
			return str.join('&');
		},

		isIE: function() {
			return ((navigator.appName == 'Microsoft Internet Explorer') ||
			(navigator.userAgent.match(/MSIE\s+\d+\.\d+/)) ||
			(navigator.userAgent.match(/Trident\/\d+\.\d+/)));
		},

		md5: function(string) {
			return Plugin.Libs.MD5(string);
		},

		getLocation: function(url) {
			var location = document.createElement('a');
			location.href = url;
			return location;
		},

		getDomain: function(url) {
			var location = this.getLocation(url);
			return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
		},

		getMobileOS: function() {
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			if(userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i )) {
				return 'ios';
			} else if(userAgent.match( /Android/i )) {
				return 'android';
			} else {
				return 'other';
			}
		}
	};

})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.Highlight = {

		check: function() {

			var showContentHighlight = Plugin.Service.Packs.isExistUnwatched();
			if (!showContentHighlight && Plugin.Service.Storage.getRecentStickers().length == 0) {
				showContentHighlight = true;
			}

			if (!showContentHighlight &&
				Plugin.Service.Storage.getStoreLastModified() > Plugin.Service.Storage.getStoreLastVisit()) {
				showContentHighlight = true;
			}
			Plugin.Service.Event.changeContentHighlight(showContentHighlight);
		}

	};
})(window.StickersModule);

(function(Plugin) {

	var stickerpipe;

	Plugin.Service.Pack = {

		init: function(_stickerpipe) {
			stickerpipe = _stickerpipe;
		},

		purchase: function(packName, pricePoint, isUnwatched, successCallback, failCallback) {
			isUnwatched = (typeof isUnwatched == 'undefined') ? true : isUnwatched;

			Plugin.Service.Api.purchasePack(packName, pricePoint, function(pack) {
				pack.isUnwatched = isUnwatched;

				var packContentIds = [];
				for (var i = 0; i < pack.stickers.length; i++) {
					var sticker = pack.stickers[i];
					sticker.pack = packName;

					Plugin.Service.Storage.setContentById(sticker.content_id, sticker);

					packContentIds.push(sticker.content_id);
				}

				pack.stickers = packContentIds;

				Plugin.Service.Storage.setPack(pack.pack_name, pack, true);

				if (stickerpipe && stickerpipe.view.isRendered) {
					stickerpipe.view.tabsView.renderPacks();
				}

				successCallback && successCallback(pack);
			}, function() {
				failCallback && failCallback();
			});
		},

		remove: function(packName, successCallback, failCallback) {
			Plugin.Service.Api.hidePack(packName, function() {

				var pack = Plugin.Service.Storage.getPack(packName);
				pack.user_status = 'hidden';
				Plugin.Service.Storage.setPack(packName, pack);

				if (stickerpipe && stickerpipe.view.isRendered) {
					stickerpipe.view.tabsView.renderPacks();
					stickerpipe.view.tabsView.controls.history.el.click();
				}

				successCallback && successCallback();
			}, function() {
				failCallback && failCallback();
			});
		},

		getMainIcon: function(packName, successCallback) {
			Plugin.Service.Api.getPackPreview(packName, function(pack) {
				var url = (pack && pack.main_icon && pack.main_icon[Plugin.Configs.stickerResolutionType]) || null;

				successCallback && successCallback(url);
			});
		},

		isHidden: function(pack) {
			return pack.user_status == 'hidden';
		}
	};

})(window.StickersModule);

(function(Plugin) {

	function filterRecentStickers() {

		var packs = Plugin.Service.Storage.getPacks(),
			recentStickersIds = Plugin.Service.Storage.getRecentStickers();

		for (var i = 0; i < recentStickersIds.length; i++) {

			Plugin.Service.Sticker.getById(recentStickersIds[i], function(sticker) {

				// check existing sticker pack
				var pack = null;

				for (var j = 0; j < packs.length; j++) {
					if (packs[j].pack_name == sticker.pack) {
						pack = packs[j];
						break;
					}
				}

				if (pack == null) {
					recentStickersIds.splice(i, 1);
					Plugin.Service.Storage.setRecentStickers(recentStickersIds);
					return;
				}

				// check existing sticker in pack
				var exist = false;
				for (var j = 0; j < pack.stickers.length; j++) {
					if (pack.stickers[j] == sticker.content_id) {
						exist = true;
						break;
					}
				}

				if (!exist) {
					recentStickersIds.splice(i, 1);
					Plugin.Service.Storage.setRecentStickers(recentStickersIds);
					return;
				}
			});

		}
	}

	Plugin.Service.Packs = {

		fetch: function(callback) {

			Plugin.Service.Api.getPacks(function(packs) {

				var packsInStorage = Plugin.Service.Storage.getPacks(),
					undefinedPacksInStorage = [];

				if (!packsInStorage.length) {
					undefinedPacksInStorage = packs;
				} else {
					for (var i = 0; i < packs.length; i++) {
						var packInStorage = null;

						for (var j = 0; j < packsInStorage.length; j++) {
							if (packs[i].pack_name == packsInStorage[j].pack_name) {
								packInStorage = packsInStorage[j];
								break;
							}
						}

						if (packInStorage && packs[i].updated_at == packInStorage.updated_at) {
							packs[i] = packInStorage;
						} else {
							undefinedPacksInStorage.push(packs[i]);
						}
					}
				}

				Plugin.Service.Storage.setPacks(packs);

				for (var i = 0; i < undefinedPacksInStorage.length; i++) {
					if (Plugin.Service.Pack.isHidden(undefinedPacksInStorage[i])) {
						continue;
					}

					Plugin.Service.Pack.purchase(
						undefinedPacksInStorage[i].pack_name,
						undefinedPacksInStorage[i].pricepoint,
						(packsInStorage.length) ? true : false
					);
				}

				filterRecentStickers();

				Plugin.Service.Highlight.check();

				callback && callback();
			});
		},

		isExistUnwatched: function() {
			var packs = Plugin.Service.Storage.getPacks();

			for(var i = 0; i < packs.length; i++) {
				if (!!packs[i].isUnwatched) {
					return true;
				}
			}

			return false;
		}
	};

})(window.StickersModule);

(function(Plugin) {

	function purchasePack(taskData) {
		Plugin.Service.Pack.purchase(taskData.packName, taskData.pricePoint);
	}

	Plugin.Service.PendingRequest = {

		tasks: {
			activateUserPack: 'activateUserPack',
			purchasePack: 'purchasePack'
		},

		init: function() {
			this.run();
		},

		add: function(taskName, taskData) {
			Plugin.Service.Storage.addPendingRequestTask({
				name: taskName,
				data: taskData
			});
		},

		run: function() {
			var task = Plugin.Service.Storage.popPendingRequestTask();

			while(task) {
				switch (task.name) {
					case this.tasks.activateUserPack:
					case this.tasks.purchasePack:
						purchasePack(task.data);
						break;
					default :
						break;
				}

				task = Plugin.Service.Storage.popPendingRequestTask();
			}
		}

	};
})(window.StickersModule);

(function(Plugin) {

	function trackStatistic(category, action, label) {
		Plugin.Service.Api.sendStatistic([{
			category: category,
			action: action,
			label: label
		}]);

		ga('stickerTracker.send', 'event', category, action, label);
	}

	Plugin.Service.Statistic = {

		messageSend: function(isSticker) {
			trackStatistic('message', 'send', ((isSticker) ? 'sticker' : 'text'));
		},

		useSticker: function(stickerId) {
			trackStatistic('sticker', 'use', stickerId);
		},

		useEmoji: function(emoji) {
			trackStatistic('emoji', 'use', emoji);
		}

	};

})(StickersModule);


(function(Plugin) {


	Plugin.Service.Sticker = {

		parseStickerId: function(text) {
			if (!text) {
				return null;
			}

			var stickerId = null,
				formatV1 = text.match(/\[\[(\S+)_(\S+)\]\]/),
				formatV2 = text.match(/\[\[(\d+)\]\]/);

			if (formatV1) {
				stickerId = formatV1[1] + '_' + formatV1[2];
			} else if (formatV2) {
				stickerId = formatV2[1];
			}

			return stickerId;
		},

		parse: function(text, callback) {

			var stickerId = this.parseStickerId(text);

			if (!stickerId) {
				callback && callback(null);
				return;
			}

			Plugin.Service.Sticker.getById(stickerId, function(sticker, async) {
				var url = sticker.image && sticker.image[Plugin.Configs.stickerResolutionType];

				callback && callback({
					id: stickerId,
					url: url,
					html: '<img src="' + url + '" class="stickerpipe-sticker" data-sticker-id="' + stickerId + '">'
				}, async);
			});
		},

		getById: function(contentId, successCallback) {
			var sticker = Plugin.Service.Storage.getContentById(contentId);

			if (sticker) {
				successCallback && successCallback(sticker, false);
				return;
			}

			Plugin.Service.Api.getContentById(contentId, function(sticker) {
				Plugin.Service.Storage.setContentById(contentId, sticker);
				successCallback && successCallback(sticker, true);
			});
		},

		isSticker: function(text) {
			return !!this.parseStickerId(text);
		}
	};
})(window.StickersModule);

(function(Plugin) {

	var lockr = Plugin.Libs.Lockr;

	Plugin.Service.Storage = {

		get: function(key) {
			lockr.prefix = Plugin.Configs.storagePrefix;
			return lockr.get(key);
		},
		set: function(key, data) {
			lockr.prefix = Plugin.Configs.storagePrefix;
			return lockr.set(key, data);
		},

		///////////////////////////////////////
		// Used stickers
		///////////////////////////////////////
		getRecentStickers: function() {
			return this.get('recent_stickers') || [];
		},
		setRecentStickers: function(recentStickers) {
			return this.set('recent_stickers', recentStickers);
		},
		addRecentSticker: function(stickerId) {

			var recentStickers = this.getRecentStickers();

			for (var i = 0; i < recentStickers.length; i++) {
				if (recentStickers[i] == stickerId) {
					recentStickers.splice(i, 1);
				}
			}

			recentStickers.unshift(stickerId);

			this.setRecentStickers(recentStickers);
		},

		///////////////////////////////////////
		// Packs
		///////////////////////////////////////
		getPacks: function() {
			return this.get('packs') || [];
		},
		setPacks: function(packs) {
			return this.set('packs', packs)
		},

		getPack: function(packName) {
			var packs = this.getPacks();

			for (var i = 0; i < packs.length; i++) {
				if (packName == packs[i].pack_name) {
					return packs[i];
				}
			}

			return null;
		},
		setPack: function(packName, pack, toBeginning) {
			toBeginning = (typeof toBeginning != 'undefined') ? toBeginning : false;

			var packExist = false,
				packs = this.getPacks();

			for (var i = 0; i < packs.length; i++) {
				if (packName == packs[i].pack_name) {
					packs[i] = pack;
					packExist = true;

					if (toBeginning) {
						packs.splice(i, 1);
					}
					break;
				}
			}

			if (!packExist || toBeginning) {
				packs.unshift(pack);
			}

			this.setPacks(packs);
		},

		///////////////////////////////////////
		// Content
		///////////////////////////////////////
		getContent: function() {
			return this.get('content') || {};
		},
		setContent: function(content) {
			return this.set('content', content || {})
		},

		getContentById: function(id) {
			return this.getContent()['id' + id] || null;
		},
		setContentById: function(id, data) {
			var content = this.getContent();
			content['id' + id] = data || null;
			this.setContent(content);
		},
		///////////////////////////////////////
		// Device ID
		///////////////////////////////////////
		getDeviceId: function() {
			var deviceId = this.get('device_id');

			if (typeof deviceId == 'undefined') {
				deviceId = + new Date();
				this.set('device_id', deviceId);
			}

			return deviceId;
		},

		///////////////////////////////////////
		// User ID
		///////////////////////////////////////
		getUserId: function() {
			return this.get('user_id');
		},
		setUserId: function(userId) {
			return this.set('user_id', userId);
		},

		///////////////////////////////////////
		// User data
		///////////////////////////////////////
		getUserData: function() {
			return this.get('user_data');
		},
		setUserData: function(userData) {
			return this.set('user_data', userData);
		},

		///////////////////////////////////////
		// Pending request
		///////////////////////////////////////
		getPendingRequestTasks: function() {
			return this.get('pending_request_tasks') || [];
		},
		setPendingRequestTasks: function(tasks) {
			return this.set('pending_request_tasks', tasks);
		},
		addPendingRequestTask: function(task) {

			var tasks = this.getPendingRequestTasks();

			tasks.push(task);

			this.setPendingRequestTasks(tasks);
		},
		popPendingRequestTask: function() {
			var tasks = this.getPendingRequestTasks(),
				task = tasks.pop();

			this.setPendingRequestTasks(tasks);

			return task;
		},

		///////////////////////////////////////
		// Metadata
		///////////////////////////////////////
		getMetadata: function(key) {
			var metadata = this.get('metadata');

			if (key) {
				metadata = metadata[key];
			}

			return metadata;
		},
		setMetadata: function(key, value) {
			var metadata = this.getMetadata() || {};

			metadata[key] = value;

			return this.set('metadata', metadata);
		},

		// todo: create Metadata service
		///////////////////////////////////////
		// Last store visit
		///////////////////////////////////////
		getStoreLastVisit: function() {
			return this.getMetadata()['last_store_visit'] || 0;
		},
		setStoreLastVisit: function(time) {
			return this.setMetadata('last_store_visit', time);
		},

		///////////////////////////////////////
		// Last store visit
		///////////////////////////////////////
		getStoreLastModified: function() {
			return this.getMetadata()['shop_last_modified'];
		},
		setStoreLastModified: function(time) {
			return this.setMetadata('shop_last_modified', time);
		}
	};

})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.Url = {

		buildStoreUrl: function(uri) {
			uri = uri || '';

			var platform = 'JS',
				style = platform,
				primaryColor = Plugin.Configs.primaryColor;

			if (Plugin.Service.Helper.getMobileOS() == 'ios' || navigator.appVersion.indexOf('Mac') != -1) {
				style = 'ios';
			}

			if (primaryColor.charAt(0) == '#') {
				primaryColor = primaryColor.substr(1);
			}

			var params = {
				apiKey: Plugin.Configs.apiKey,
				platform: platform,
				userId: Plugin.Configs.userId,
				density: Plugin.Configs.stickerResolutionType,
				priceB: Plugin.Configs.priceB,
				priceC: Plugin.Configs.priceC,
				is_subscriber: (Plugin.Configs.userPremium ? 1 : 0),
				localization: Plugin.Configs.lang,
				style: style,
				primaryColor: primaryColor
			};

			var url = Plugin.Configs.storeUrl || this.buildApiUrl('/web');

			url += ((url.indexOf('?') == -1) ? '?' : '&')
				+ Plugin.Service.Helper.urlParamsSerialize(params)
				+ '#/' + uri;

			return url;
		},

		buildApiUrl: function(uri) {
			uri = uri || '';

			return Plugin.Configs.apiUrl + '/api/v' + Plugin.Service.Api.getApiVersion() + uri;
		},

		getUserPacksUrl: function() {
			var url = this.buildApiUrl('/shop/my');

			if (Plugin.Configs.userPremium) {
				url += '?is_subscriber=1';
			}

			return url;
		},

		getPackPreviewUrl: function(packName) {
			var url = this.buildApiUrl('/packs/' + packName);

			if (Plugin.Configs.userPremium) {
				url += '?is_subscriber=1';
			}

			return url;
		},

		getStatisticUrl: function() {
			return this.buildApiUrl('/statistics');
		},

		getUserDataUrl: function() {
			return this.buildApiUrl('/user');
		},

		getPurchaseUrl: function(packName, pricePoint) {

			// detect purchase type
			var purchaseType = 'free';
			if (pricePoint == 'B') {
				purchaseType = 'oneoff';
				if (Plugin.Configs.userPremium) {
					purchaseType = 'subscription';
				}
			} else if (pricePoint == 'C') {
				purchaseType = 'oneoff';
			}

			// build url
			var url = this.buildApiUrl('/packs/' + packName);
			url += '?' + Plugin.Service.Helper.urlParamsSerialize({
					purchase_type: purchaseType
				});

			return url;
		},

		getContentByIdUrl: function(contentId) {
			return this.buildApiUrl('/content/' + contentId);
		},

		getHidePackUrl: function(packName) {
			return this.buildApiUrl('/packs/' + packName);
		},

		getStoreUrl: function() {
			return this.buildStoreUrl('store/');
		},

		getStorePackUrl: function(packName) {
			return this.buildStoreUrl('packs/' + packName);
		}

	};
})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.User = {

		init: function() {
			this.updateUserData();
		},

		updateUserData: function() {
			if (!Plugin.Configs.userData) {
				return;
			}

			var storedUserData = Plugin.Service.Storage.getUserData() || {};

			if (JSON.stringify(storedUserData) != JSON.stringify(Plugin.Configs.userData)) {
				Plugin.Service.Api.updateUserData(Plugin.Configs.userData);
				Plugin.Service.Storage.setUserData(Plugin.Configs.userData);
			}
		}
	};

})(window.StickersModule);

window.StickersModule.Configs = {};

(function(Plugin) {

	Plugin.Service.Helper.setConfig({

		elId: 'stickerPipe',

		// todo: more than 2 resolution
		stickerResolutionType : (window.devicePixelRatio == 1) ? 'mdpi' : 'xhdpi',
		tabResolutionType: (window.devicePixelRatio == 1) ? 'hdpi' : 'xxhdpi',

		tabItemClass: 'sp-tab-item',
		stickerItemClass: 'sp-sticker-item',
		emojiItemClass: 'sp-emoji',

		htmlForEmptyRecent: 'No recent stickers',

		apiKey: null,

		apiUrl: 'https://api.stickerpipe.com',

		storagePrefix: 'stickerpipe_',

		enableEmojiTab: false,
		enableHistoryTab: false,
		enableSettingsTab: false,
		enableStoreTab: false,

		userId: null,
		userPremium: false,
		userData: {},

		priceB: null,
		priceC: null,

		primaryColor: '',

		// todo: block or popover
		display: 'block',
		height: '350px',
		width: '320px',

		lang: document.documentElement.lang.substr(0, 2) || 'en'
	});

})(window.StickersModule);

(function(Plugin) {

	Plugin.Service.Helper.setConfig({
		emojiList: [
			// Emoticons		
			"😊",
			"😃",
			"😁",
			"😂",
			"😀",
			"😇",
			"😈",
			"😎",
			"😐",
			"😑",
			"😕",
			"😗",
			"😙",
			"😛",
			"😟",
			"😦",
			"😧",
			"😬",
			"😮",
			"😯",
			"😴",
			"😶",
			"😄",
			"😅",
			"😆",
			"😉",
			"😋",
			"😌",
			"😍",
			"😏",
			"😒",
			"😓",
			"😔",
			"😖",
			"😘",
			"😚",
			"😜",
			"😝",
			"😞",
			"😠",
			"😡",
			"😢",
			"😣",
			"😤",
			"😥",
			"😨",
			"😩",
			"😪",
			"😫",
			"😭",
			"😰",
			"😱",
			"😲",
			"😳",
			"😵",
			"😷",
			"😸",
			"😹",
			"😺",
			"😻",
			"😼",
			"😽",
			"😾",
			"😿",
			"🙀",
			"🙅",
			"🙆",
			"🙇",
			"🙈",
			"🙉",
			"🙊",
			"🙋",
			"🙌",
			"🙍",
			"🙎",
			"🙏",
// Dingbats		
			"✂",
			"✅",
			"✈",
			"✉",
			"✊",
			"✋",
			"✌",
			"✏",
			"✒",
			"✔",
			"✖",
			"✨",
			"✳",
			"✴",
			"❄",
			"❇",
			"❌",
			"❎",
			"❓",
			"❔",
			"❕",
			"❗",
			"❤",
			"➕",
			"➖",
			"➗",
			"➡",
			"➰",
// Transport and map symbols		
			"🚀",
			"🚃",
			"🚄",
			"🚅",
			"🚇",
			"🚉",
			"🚌",
			"🚏",
			"🚑",
			"🚒",
			"🚓",
			"🚕",
			"🚗",
			"🚙",
			"🚚",
			"🚢",
			"🚤",
			"🚥",
			"🚧",
			"🚨",
			"🚩",
			"🚪",
			"🚫",
			"🚬",
			"🚭",
			"🚲",
			"🚶",
			"🚹",
			"🚺",
			"🚻",
			"🚼",
			"🚽",
			"🚾",
			"🛀",
// Enclosed characters		
			"Ⓜ",
			"🅰",
			"🅱",
			"🅾",
			"🅿",
			"🆎",
			"🆑",
			"🆒",
			"🆓",
			"🆔",
			"🆕",
			"🆖",
			"🆗",
			"🆘",
			"🆙",
			"🆚",
			"🇩🇪",
			"🇬🇧",
			"🇨🇳",
			"🇯🇵",
			"🇰🇷",
			"🇫🇷",
			"🇪🇸",
			"🇮🇹",
			"🇺🇸",
			"🇷🇺",
			"🈁",
			"🈂",
			"🈚",
			"🈯",
			"🈲",
			"🈳",
			"🈴",
			"🈵",
			"🈶",
			"🈷",
			"🈸",
			"🈹",
			"🈺",
			"🉐",
			"🉑",
// Uncategorized		
			"©",
			"®",
			"‼",
			"⁉",
			"8⃣",
			"9⃣",
			"7⃣",
			"6⃣",
			"1⃣",
			"0⃣",
			"2⃣",
			"3⃣",
			"5⃣",
			"4⃣",
			"#⃣",
			"™",
			"ℹ",
			"↔",
			"↕",
			"↖",
			"↗",
			"↘",
			"↙",
			"↩",
			"↪",
			"⌚",
			"⌛",
			"⏩",
			"⏪",
			"⏫",
			"⏬",
			"⏰",
			"⏳",
			"▪",
			"▫",
			"▶",
			"◀",
			"◻",
			"◼",
			"◽",
			"◾",
			"☀",
			"☁",
			"☎",
			"☑",
			"☔",
			"☕",
			"☝",
			"☺",
			"♈",
			"♉",
			"♊",
			"♋",
			"♌",
			"♍",
			"♎",
			"♏",
			"♐",
			"♑",
			"♒",
			"♓",
			"♠",
			"♣",
			"♥",
			"♦",
			"♨",
			"♻",
			"♿",
			"⚓",
			"⚠",
			"⚡",
			"⚪",
			"⚫",
			"⚽",
			"⚾",
			"⛄",
			"⛅",
			"⛎",
			"⛔",
			"⛪",
			"⛲",
			"⛳",
			"⛵",
			"⛺",
			"⛽",
			"⤴",
			"⤵",
			"⬅",
			"⬆",
			"⬇",
			"⬛",
			"⬜",
			"⭐",
			"⭕",
			"〰",
			"〽",
			"㊗",
			"㊙",
			"🀄",
			"🃏",
			"🌀",
			"🌁",
			"🌂",
			"🌃",
			"🌄",
			"🌅",
			"🌆",
			"🌇",
			"🌈",
			"🌉",
			"🌊",
			"🌋",
			"🌌",
			"🌏",
			"🌑",
			"🌓",
			"🌔",
			"🌕",
			"🌙",
			"🌛",
			"🌟",
			"🌠",
			"🌰",
			"🌱",
			"🌴",
			"🌵",
			"🌷",
			"🌸",
			"🌹",
			"🌺",
			"🌻",
			"🌼",
			"🌽",
			"🌾",
			"🌿",
			"🍀",
			"🍁",
			"🍂",
			"🍃",
			"🍄",
			"🍅",
			"🍆",
			"🍇",
			"🍈",
			"🍉",
			"🍊",
			"🍌",
			"🍍",
			"🍎",
			"🍏",
			"🍑",
			"🍒",
			"🍓",
			"🍔",
			"🍕",
			"🍖",
			"🍗",
			"🍘",
			"🍙",
			"🍚",
			"🍛",
			"🍜",
			"🍝",
			"🍞",
			"🍟",
			"🍠",
			"🍡",
			"🍢",
			"🍣",
			"🍤",
			"🍥",
			"🍦",
			"🍧",
			"🍨",
			"🍩",
			"🍪",
			"🍫",
			"🍬",
			"🍭",
			"🍮",
			"🍯",
			"🍰",
			"🍱",
			"🍲",
			"🍳",
			"🍴",
			"🍵",
			"🍶",
			"🍷",
			"🍸",
			"🍹",
			"🍺",
			"🍻",
			"🎀",
			"🎁",
			"🎂",
			"🎃",
			"🎄",
			"🎅",
			"🎆",
			"🎇",
			"🎈",
			"🎉",
			"🎊",
			"🎋",
			"🎌",
			"🎍",
			"🎎",
			"🎏",
			"🎐",
			"🎑",
			"🎒",
			"🎓",
			"🎠",
			"🎡",
			"🎢",
			"🎣",
			"🎤",
			"🎥",
			"🎦",
			"🎧",
			"🎨",
			"🎩",
			"🎪",
			"🎫",
			"🎬",
			"🎭",
			"🎮",
			"🎯",
			"🎰",
			"🎱",
			"🎲",
			"🎳",
			"🎴",
			"🎵",
			"🎶",
			"🎷",
			"🎸",
			"🎹",
			"🎺",
			"🎻",
			"🎼",
			"🎽",
			"🎾",
			"🎿",
			"🏀",
			"🏁",
			"🏂",
			"🏃",
			"🏄",
			"🏆",
			"🏈",
			"🏊",
			"🏠",
			"🏡",
			"🏢",
			"🏣",
			"🏥",
			"🏦",
			"🏧",
			"🏨",
			"🏩",
			"🏪",
			"🏫",
			"🏬",
			"🏭",
			"🏮",
			"🏯",
			"🏰",
			"🐌",
			"🐍",
			"🐎",
			"🐑",
			"🐒",
			"🐔",
			"🐗",
			"🐘",
			"🐙",
			"🐚",
			"🐛",
			"🐜",
			"🐝",
			"🐞",
			"🐟",
			"🐠",
			"🐡",
			"🐢",
			"🐣",
			"🐤",
			"🐥",
			"🐦",
			"🐧",
			"🐨",
			"🐩",
			"🐫",
			"🐬",
			"🐭",
			"🐮",
			"🐯",
			"🐰",
			"🐱",
			"🐲",
			"🐳",
			"🐴",
			"🐵",
			"🐶",
			"🐷",
			"🐸",
			"🐹",
			"🐺",
			"🐻",
			"🐼",
			"🐽",
			"🐾",
			"👀",
			"👂",
			"👃",
			"👄",
			"👅",
			"👆",
			"👇",
			"👈",
			"👉",
			"👊",
			"👋",
			"👌",
			"👍",
			"👎",
			"👏",
			"👐",
			"👑",
			"👒",
			"👓",
			"👔",
			"👕",
			"👖",
			"👗",
			"👘",
			"👙",
			"👚",
			"👛",
			"👜",
			"👝",
			"👞",
			"👟",
			"👠",
			"👡",
			"👢",
			"👣",
			"👤",
			"👦",
			"👧",
			"👨",
			"👩",
			"👪",
			"👫",
			"👮",
			"👯",
			"👰",
			"👱",
			"👲",
			"👳",
			"👴",
			"👵",
			"👶",
			"👷",
			"👸",
			"👹",
			"👺",
			"👻",
			"👼",
			"👽",
			"👾",
			"👿",
			"💀",
			"💁",
			"💂",
			"💃",
			"💄",
			"💅",
			"💆",
			"💇",
			"💈",
			"💉",
			"💊",
			"💋",
			"💌",
			"💍",
			"💎",
			"💏",
			"💐",
			"💑",
			"💒",
			"💓",
			"💔",
			"💕",
			"💖",
			"💗",
			"💘",
			"💙",
			"💚",
			"💛",
			"💜",
			"💝",
			"💞",
			"💟",
			"💠",
			"💡",
			"💢",
			"💣",
			"💤",
			"💥",
			"💦",
			"💧",
			"💨",
			"💩",
			"💪",
			"💫",
			"💬",
			"💮",
			"💯",
			"💰",
			"💱",
			"💲",
			"💳",
			"💴",
			"💵",
			"💸",
			"💹",
			"💺",
			"💻",
			"💼",
			"💽",
			"💾",
			"💿",
			"📀",
			"📁",
			"📂",
			"📃",
			"📄",
			"📅",
			"📆",
			"📇",
			"📈",
			"📉",
			"📊",
			"📋",
			"📌",
			"📍",
			"📎",
			"📏",
			"📐",
			"📑",
			"📒",
			"📓",
			"📔",
			"📕",
			"📖",
			"📗",
			"📘",
			"📙",
			"📚",
			"📛",
			"📜",
			"📝",
			"📞",
			"📟",
			"📠",
			"📡",
			"📢",
			"📣",
			"📤",
			"📥",
			"📦",
			"📧",
			"📨",
			"📩",
			"📪",
			"📫",
			"📮",
			"📰",
			"📱",
			"📲",
			"📳",
			"📴",
			"📶",
			"📷",
			"📹",
			"📺",
			"📻",
			"📼",
			"🔃",
			"🔊",
			"🔋",
			"🔌",
			"🔍",
			"🔎",
			"🔏",
			"🔐",
			"🔑",
			"🔒",
			"🔓",
			"🔔",
			"🔖",
			"🔗",
			"🔘",
			"🔙",
			"🔚",
			"🔛",
			"🔜",
			"🔝",
			"🔞",
			"🔟",
			"🔠",
			"🔡",
			"🔢",
			"🔣",
			"🔤",
			"🔥",
			"🔦",
			"🔧",
			"🔨",
			"🔩",
			"🔪",
			"🔫",
			"🔮",
			"🔯",
			"🔰",
			"🔱",
			"🔲",
			"🔳",
			"🔴",
			"🔵",
			"🔶",
			"🔷",
			"🔸",
			"🔹",
			"🔺",
			"🔻",
			"🔼",
			"🔽",
			"🕐",
			"🕑",
			"🕒",
			"🕓",
			"🕔",
			"🕕",
			"🕖",
			"🕗",
			"🕘",
			"🕙",
			"🕚",
			"🕛",
			"🗻",
			"🗼",
			"🗽",
			"🗾",
			"🗿",
// Additional transport and map symbols		
			"🚁",
			"🚂",
			"🚆",
			"🚈",
			"🚊",
			"🚍",
			"🚎",
			"🚐",
			"🚔",
			"🚖",
			"🚘",
			"🚛",
			"🚜",
			"🚝",
			"🚞",
			"🚟",
			"🚠",
			"🚡",
			"🚣",
			"🚦",
			"🚮",
			"🚯",
			"🚰",
			"🚱",
			"🚳",
			"🚴",
			"🚵",
			"🚷",
			"🚸",
			"🚿",
			"🛁",
			"🛂",
			"🛃",
			"🛄",
			"🛅",
// Other additional symbols		
			"🌍",
			"🌎",
			"🌐",
			"🌒",
			"🌖",
			"🌗",
			"🌘",
			"🌚",
			"🌜",
			"🌝",
			"🌞",
			"🌲",
			"🌳",
			"🍋",
			"🍐",
			"🍼",
			"🏇",
			"🏉",
			"🏤",
			"🐀",
			"🐁",
			"🐂",
			"🐃",
			"🐄",
			"🐅",
			"🐆",
			"🐇",
			"🐈",
			"🐉",
			"🐊",
			"🐋",
			"🐏",
			"🐐",
			"🐓",
			"🐕",
			"🐖",
			"🐪",
			"👥",
			"👬",
			"👭",
			"💭",
			"💶",
			"💷",
			"📬",
			"📭",
			"📯",
			"📵",
			"🔀",
			"🔁",
			"🔂",
			"🔄",
			"🔅",
			"🔆",
			"🔇",
			"🔉",
			"🔕",
			"🔬",
			"🔭",
			"🕜",
			"🕝",
			"🕞",
			"🕟",
			"🕠",
			"🕡",
			"🕢",
			"🕣",
			"🕤",
			"🕥",
			"🕦",
			"🕧"
		]
	});

})(window.StickersModule);



/////////////////////////////////////////////////////////////
// Load modules
/////////////////////////////////////////////////////////////
window.StickersModule.Module = {};

(function(Plugin) {

	Plugin.Module.Store = {

		init: function(stickerpipe) {
			Plugin.Module.Store.View.init();
			Plugin.Module.Store.ApiListener.init();
			Plugin.Module.Store.Api.init(stickerpipe);
		},

		open: function(contentId) {
			Plugin.Module.Store.View.open(contentId);
		},

		close: function() {
			Plugin.Module.Store.View.close();
		},

		setOnPurchaseCallback: function(callback) {
			Plugin.Module.Store.Controller.onPurchaseCallback = callback;
		},

		purchaseSuccess: function(packName, pricePoint) {
			Plugin.Module.Store.Controller.onPurchaseSuccess(packName, pricePoint);
		},

		purchaseFail: function() {
			Plugin.Module.Store.Controller.onPurchaseFail();
		}
	};

})(StickersModule);


(function(Plugin, Module) {

	var stickerpipe;

	function isPackHidden(packName) {
		var packs = Plugin.Service.Storage.getPacks();

		for (var i = 0; i < packs.length; i++) {
			if (packs[i].pack_name == packName) {
				return Plugin.Service.Pack.isHidden(packs[i]);
			}
		}

		return false;
	}

	Module.Api= {

		init: function(_stickerpipe) {
			stickerpipe = _stickerpipe;
		},

		showPack: function(data) {
			Module.View.close();
			stickerpipe.open(data.attrs.packName);
		},

		purchasePack: function(data) {
			var packName = data.attrs.packName,
				packTitle = data.attrs.packTitle,
				pricePoint = data.attrs.pricePoint;

			var isHidden = isPackHidden(packName);

			if (pricePoint == 'A' || (pricePoint == 'B' && Plugin.Configs.userPremium) || isHidden) {
				Module.Controller.downloadPack(packName, pricePoint);
			} else {
				Module.Controller.onPurchaseCallback &&
				Module.Controller.onPurchaseCallback(packName, packTitle, pricePoint);
			}
		},

		showPagePreloader: function(data) {
			Module.View.showPagePreloader(data.attrs.show);
		},

		removePack: function(data) {
			Module.Controller.removePack(data.attrs.packName);
		},

		showBackButton: function(data) {
			Module.View.showBackButton(data.attrs.show);
		},

		setYScroll: function(data) {
			Module.View.setYScroll(data.attrs.yPosition);
		},

		keyUp: function(data) {
			var ESC_CODE = 27;

			if (data.attrs.keyCode == ESC_CODE) {
				Module.View.close();
			}
		}
	};

})(StickersModule, StickersModule.Module.Store);


(function(Plugin, Module) {

	var initialized = false;

	Module.ApiListener = {

		init: function() {
			if (initialized) {
				return;
			}

			window.addEventListener('message', function(e) {
				var data = JSON.parse(e.data);

				if (!data.action) {
					return;
				}

				var api = Module.Api;
				api[data.action] && api[data.action](data);
			});

			initialized = true;
		}
	};

})(window.StickersModule, StickersModule.Module.Store);

(function(Plugin, Module) {

	function callStoreMethod(action, attrs) {
		var iframe = Module.View.iframe;

		iframe && iframe.contentWindow.postMessage(JSON.stringify({
			action: action,
			attrs: attrs
		}), Plugin.Service.Helper.getDomain(Plugin.Service.Url.buildStoreUrl('/')));
	}

	Module.Controller = {

		onPurchaseCallback: null,

		configureStore: function() {
			callStoreMethod('configure', {
				canShowPack: true,
				canRemovePack: true
			});
		},

		downloadPack: function(packName, pricePoint) {
			Plugin.Service.Pack.purchase(packName, pricePoint, true, function() {
				callStoreMethod('onPackPurchaseSuccess');
			}, function() {
				callStoreMethod('onPackPurchaseFail');
			});
		},

		removePack: function(packName) {
			Plugin.Service.Pack.remove(packName, function() {
				callStoreMethod('onPackRemoveSuccess');
			}, function() {
				callStoreMethod('onPackRemoveFail');
			});
		},

		goBack: function() {
			callStoreMethod('goBack');
		},

		///////////////////////////////////////////
		// Callbacks
		///////////////////////////////////////////

		onPurchaseSuccess: function(packName, pricePoint) {
			this.downloadPack(packName, pricePoint);
		},

		onPurchaseFail: function() {
			callStoreMethod('onPackPurchaseFail');
		},

		onScrollContent: function(yPosition) {
			callStoreMethod('onScrollContent', {
				yPosition: yPosition
			});
		}
	};

})(StickersModule, StickersModule.Module.Store);


(function(Plugin, Module) {

	Module.View = {

		modal: null,
		iframe: null,

		modalBody: null,

		preloader: null,

		init: function() {
			this.iframe = document.createElement('iframe');

			this.iframe.style.width = '100%';
			this.iframe.style.height = '100%';
			this.iframe.style.border = '0';

			this.modal = Plugin.Module.Modal.init(this.iframe, {
				onOpen: (function(contentEl, modalEl, overlay) {
					Plugin.Service.Event.resize();
					Module.ApiListener.init();

					if (Plugin.Service.Helper.getMobileOS() == 'ios') {
						var modalBody = modalEl.getElementsByClassName('sp-modal-body')[0];
						modalBody.style.overflowY = 'scroll';

						modalBody.addEventListener('scroll', (function() {
							Module.Controller.onScrollContent(modalBody.scrollTop);
						}).bind(this));

						this.modalBody = modalBody;
					}

					this.iframe.onload = function() {
						Module.Controller.configureStore();
					};


					if (!this.preloader) {
						var modalDialog = modalEl.getElementsByClassName('sp-modal-dialog')[0];
						this.preloader = new Plugin.View.Preloader(modalDialog);
						this.preloader.hide();
					}
				}).bind(this)
			});

			this.modal.backButton.addEventListener('click', (function() {
				Module.Controller.goBack();
			}).bind(this));

			window.addEventListener('resize', (function() {
				this.onWindowResize();
			}).bind(this));
		},

		open: function(contentId) {

			var self = this;

			self.iframe.src = Plugin.Service.Url.getStoreUrl();

			if (contentId) {
				Plugin.Service.Sticker.getById(contentId, function (sticker) {
					self.iframe.src = Plugin.Service.Url.getStorePackUrl(sticker.pack);
				});
			}

			this.modal.open();
		},

		close: function() {
			if (this.modal && this.modal.hasGlobalOpened()) {
				this.modal.close();
			}
		},

		showPagePreloader: function(show) {
			this.preloader[(show ? 'show' : 'hide')]();
		},

		showBackButton: function(show) {
			var modal = this.modal;
			modal.backButton.style.display = (show) ? 'block' : 'none';
		},

		setYScroll: function(yPosition) {
			if (this.modalBody) {
				this.modalBody.scrollTop = yPosition;
			}
		},

		onWindowResize: function() {
			var dialog = this.modal.modalEl.getElementsByClassName('sp-modal-dialog')[0];
			dialog.style.height = '';

			if (window.innerWidth > 700) {

				var marginTop = parseInt(Plugin.Service.El.css(dialog, 'marginTop'), 10),
					marginBottom = parseInt(Plugin.Service.El.css(dialog, 'marginBottom'), 10);

				var minHeight = window.innerHeight - marginTop - marginBottom;

				dialog.style.height = minHeight + 'px';
			}
		}
	};

})(window.StickersModule, StickersModule.Module.Store);

(function(Plugin) {

	// todo: + bind & unbind methods for events (error on ESC two modals)

	var modalsStack = [],
		KEY_CODE_A = 65,
		KEY_CODE_TAB = 9,
		KEY_CODE_ESC = 27,

		oMargin = {},
		ieBodyTopMargin = 0,

		classes = {
			lock: 'sp-modal-lock',
			overlay: 'sp-modal-overlay',
			modal: 'sp-modal',
			modalDialog: 'sp-modal-dialog',
			dialogHeader: 'sp-modal-header',
			dialogBody: 'sp-modal-body',
			back: 'sp-modal-back',
			close: 'sp-modal-close'
		},

		defaultOptions = {
			closeOnEsc: true,
			closeOnOverlayClick: true,

			onBeforeClose: null,
			onClose: null,
			onOpen: null
		},

		isOpen = false,

		overlay = null;

	function lockContainer() {
		if (overlay) {
			return;
		}

		overlay = document.createElement('div');
		overlay.className = classes.overlay;

		document.body.insertBefore(overlay, document.body.firstChild);

		var bodyOuterWidth = Plugin.Service.El.outerWidth(document.body);
		document.body.classList.add(classes.lock);
		document.getElementsByTagName('html')[0].classList.add(classes.lock);

		var scrollbarWidth = Plugin.Service.El.outerWidth(document.body) - bodyOuterWidth;

		if (Plugin.Service.Helper.isIE()) {
			ieBodyTopMargin = Plugin.Service.El.css(document.body, 'marginTop');
			document.body.style.marginTop = 0;
		}

		if (scrollbarWidth != 0) {
			var tags = ['html', 'body'];
			for (var i = 0 ; i < tags.length; i++) {
				var tag = tags[i],
					tagEl = document.getElementsByTagName(tag)[0];

				oMargin[tag.toLowerCase()] = parseInt(Plugin.Service.El.css(tagEl, 'marginRight'));
			}

			document.getElementsByTagName('html')[0].style.marginRight = oMargin['html'] + scrollbarWidth + 'px';

			overlay.style.left = 0 - scrollbarWidth + 'px';
		}
	}

	function unlockContainer() {
		overlay.parentNode.removeChild(overlay);
		overlay = null;

		if (Plugin.Service.Helper.isIE()) {
			document.body.style.marginTop = ieBodyTopMargin + 'px';
		}

		var bodyOuterWidth = Plugin.Service.El.outerWidth(document.body);
		document.body.classList.remove(classes.lock);
		document.getElementsByTagName('html')[0].classList.remove(classes.lock);
		var scrollbarWidth = Plugin.Service.El.outerWidth(document.body) - bodyOuterWidth;

		if (scrollbarWidth != 0) {
			var tags = ['html', 'body'];
			for (var i = 0 ; i < tags.length; i++) {
				var tag = tags[i],
					tagEl = document.getElementsByTagName(tag)[0];

				tagEl.style.marginRight = oMargin[tag.toLowerCase()] + 'px';
			}
		}
	}

	Plugin.Module.Modal = {

		init: function(contentEl, options) {

			options = Plugin.Service.Helper.extend({}, defaultOptions, (options || {}));

			var modalInstance = {};

			// ****************************************************************************

			// MODAL
			var modalEl = document.createElement('div');
			modalEl.style.display = 'none';
			modalEl.className = classes.modal;

			if (options.closeOnOverlayClick) {
				modalEl.addEventListener('click', (function() {
					modalInstance.close(options);
				}).bind(this));
			}


			// DIALOG
			var dialogEl = document.createElement('div');
			dialogEl.className = classes.modalDialog;


			// HEADER
			var dialogHeader = document.createElement('div');
			dialogHeader.className = classes.dialogHeader;


			// BODY
			var dialogBody = document.createElement('div');
			dialogBody.className = classes.dialogBody;


			modalEl.appendChild(dialogEl);

			dialogEl.appendChild(dialogBody);
			dialogEl.appendChild(dialogHeader);

			var backButton = document.createElement('div');
			backButton.className = classes.back;
			backButton.innerHTML = '<div class="sp-icon-back"></div>';
			modalInstance.backButton = backButton;

			var closeButton = document.createElement('div');
			closeButton.className = classes.close;
			closeButton.innerHTML = '<div class="sp-icon-close"></div>';
			closeButton.addEventListener('click', (function() {
				this.close();
			}).bind(modalInstance));

			dialogHeader.appendChild(backButton);
			dialogHeader.appendChild(closeButton);

			modalInstance.modalEl = modalEl;

			// ****************************************************************************

			if (!contentEl || !contentEl.nodeType) {

				try {
					contentEl = document.querySelector(contentEl);
				} catch (e) {}

				if (!contentEl) {
					contentEl = document.createElement('div');
				}
			}

			dialogBody.appendChild(contentEl);

			document.body.appendChild(modalInstance.modalEl);

			// on Ctrl+A click fire `onSelectAll` event
			window.addEventListener('keydown', function(e) {
				// todo
				//if (!(e.ctrlKey && e.keyCode == KEY_CODE_A)) {
				//	return true;
				//}
				//
				//if ( $('input:focus, textarea:focus').length > 0 ) {
				//    return true;
				//}
				//
				//var selectAllEvent = new $.Event('onSelectAll');
				//selectAllEvent.parentEvent = e;
				//$(window).trigger(selectAllEvent);
				//return true;
			});

			// todo line 6
			//els.bind('keydown',function(e) {
			//	var modalFocusableElements = $(':focusable',$(this));
			//	if(modalFocusableElements.filter(':last').is(':focus') && (e.which || e.keyCode) == KEY_CODE_TAB){
			//		e.preventDefault();
			//		modalFocusableElements.filter(':first').focus();
			//	}
			//});

			return Plugin.Service.Helper.extend(modalInstance, {

				options: options,
				contentEl: contentEl,

				open: function() {

					if (modalsStack.length) {
						modalsStack[modalsStack.length - 1].modalEl.style.display = 'none';
					}

					modalsStack.push(this);

					// todo: close modal if opened
					//if (document.getElementsByClassName(classes.overlay).length) {
					//	this.close();
					//}

					lockContainer();


					//overlay.appendChild(this.modalEl); // openedModalElement
					Plugin.Service.El.appendAfter(this.modalEl, overlay);

					this.modalEl.style.display = 'block';

					if (this.options.closeOnEsc) {
						window.addEventListener('keyup', (function(e) {
							if(e.keyCode === KEY_CODE_ESC && isOpen) {
								this.close(this.options);
							}
						}).bind(this));
					}

					if (this.options.closeOnOverlayClick) {
						for (var i = this.modalEl.children.length; i--;) {
							if (this.modalEl.children[i].nodeType != 8) {
								this.modalEl.children[i].addEventListener('click', function(e) {
									e.stopPropagation();
								});
							}
						}
					}

					//document.addEventListener('touchmove', (function(e) {
					//	//helper function (see below)
					//	function collectionHas(a, b) {
					//		for(var i = 0, len = a.length; i < len; i ++) {
					//			if(a[i] == b) return true;
					//		}
					//		return false;
					//	}
					//
					//	function findParentBySelector(elm, selector) {
					//		var all = document.querySelectorAll(selector),
					//			cur = elm.parentNode;
					//
					//		//keep going up until you find a match
					//		while (cur && !collectionHas(all, cur)) {
					//			cur = cur.parentNode; //go up
					//		}
					//
					//		//will return null if not found
					//		return cur;
					//	}
					//
					//	var selector = '.' + classes.overlay;
					//	var parent = findParentBySelector(e.target, selector);
					//
					//	if(!parent) {
					//		e.preventDefault();
					//	}
					//}).bind(this));

					//document.addEventListener('touchmove', (function(e) {
					//	e.preventDefault();
					//}).bind(this));

					document.addEventListener('touchmove', function(e) {

						//var q = Plugin.Service.El.getParents(e.target, '.' + classes.overlay);
						//if (!q.length) {
						//	e.preventDefault();
						//}

						//if(!$(e).parents('.' + localOptions.overlayClass)) {
						//	e.preventDefault();
						//}
					});

					window.addEventListener('onSelectAll',function(e) {
						//e.parentEvent.preventDefault();

						// todo
						//var range = null,
						//	selection = null,
						//	selectionElement = openedModalElement.get(0);
						//
						//if (document.body.createTextRange) { //ms
						//	range = document.body.createTextRange();
						//	range.moveToElementText(selectionElement);
						//	range.select();
						//} else if (window.getSelection) { //all others
						//	selection = window.getSelection();
						//	range = document.createRange();
						//	range.selectNodeContents(selectionElement);
						//	selection.removeAllRanges();
						//	selection.addRange(range);
						//}
					});

					if (this.options.onOpen) {
						this.options.onOpen(this.contentEl, this.modalEl, overlay, this.options);
					}

					isOpen = true;
				},

				close: function() {

					// todo
					//if ($.isFunction(this.options.onBeforeClose)) {
					//	if (this.options.onBeforeClose(overlay, this.options) === false) {
					//		return;
					//	}
					//}

					// todo
					//if (!this.options.cloning) {
					//	if (!modalEl) {
					//		modalEl = overlay.data(pluginNamespace+'.modalEl');
					//	}
					//	$(modalEl).hide().appendTo($(modalEl).data(pluginNamespace+'.parent'));
					//}

					if (this.options.onClose) {
						this.options.onClose(this.contentEl, this.modalEl, overlay, this.options);
					}

					document.body.removeChild(this.modalEl);
					modalsStack.pop();

					if (!modalsStack.length) {
						unlockContainer();
					} else {
						modalsStack[modalsStack.length - 1].modalEl.style.display = 'block';
					}

					isOpen = false;
				},

				// todo
				hasGlobalOpened: function() {
					return isOpen;
				}
			});
		},

		setDefaultOptions: function(options) {
			defaultOptions = Plugin.Service.Helper.extend({}, defaultOptions, options);
		}
	};

})(window.StickersModule);

/////////////////////////////////////////////////////////////

window.StickersModule.View = {};

(function(Plugin) {

	Plugin.View.Block = Plugin.Libs.Class({

		emojisOffset: 0,
		emojisLimit: 100,

		// todo
		isRendered: false,

		el: null,
		contentEl: null,

		tabsView: null,

		scrollableEl: null,

		_constructor: function() {

			this.el = document.getElementById(Plugin.Configs.elId);
			this.contentEl = document.createElement('div');

			this.tabsView = new Plugin.View.Tabs();

			window.addEventListener('resize', (function() {
				this.onWindowResize();
			}).bind(this));
		},

		render: function() {

			this.tabsView.render();

			this.el.innerHTML = '';
			this.el.className ='sticker-pipe';
			this.el.style.width = Plugin.Configs.width;

			this.scrollableEl = document.createElement('div');
			this.scrollableEl.className = 'sp-scroll-content';
			this.scrollableEl.style.height = parseInt(Plugin.Configs.height, 10) - 49 + 'px';
			this.scrollableEl.appendChild(this.contentEl);

			this.scrollableEl.addEventListener('ps-y-reach-end', (function () {
				if (this.contentEl.className == 'sp-emojis') {
					this.renderEmojis(this.emojisOffset);
				}
			}).bind(this));

			this.el.appendChild(this.tabsView.el);
			this.el.appendChild(this.scrollableEl);

			Plugin.Libs.PerfectScrollbar.initialize(this.scrollableEl);

			this.isRendered = true;

			this.tabsView.onWindowResize();
			this.onWindowResize();
		},
		renderRecentStickers: function() {

			var recentStickers = Plugin.Service.Storage.getRecentStickers();

			if (!recentStickers.length) {
				this.contentEl.className = 'sp-recent-empty';
				this.contentEl.innerHTML = Plugin.Configs.htmlForEmptyRecent;
				this.updateScroll('top');
				return false;
			}

			this.renderStickers(recentStickers);
		},
		renderEmojiBlock: function() {

			this.contentEl.innerHTML = '';
			this.contentEl.className = 'sp-emojis';

			this.emojisOffset = 0;
			this.renderEmojis(this.emojisOffset);

			this.updateScroll('top');
		},
		renderPack: function(pack) {
			this.renderStickers(pack.stickers);
		},
		renderStickers: function(stickersIds) {
			var self = this;

			this.contentEl.innerHTML = '';
			this.contentEl.className = 'sp-stickers';

			function appendSticker(stickerId) {
				var stickersSpanEl = document.createElement('span');
				stickersSpanEl.className = 'sp-sticker-placeholder';
				stickersSpanEl.style.background = Plugin.Configs.primaryColor || '#e1e1e1';
				stickersSpanEl.setAttribute('data-sticker-id', stickerId);

				var image = new Image();
				image.onload = function() {
					stickersSpanEl.className = Plugin.Configs.stickerItemClass;
					stickersSpanEl.style.background = '';
					stickersSpanEl.appendChild(image);
				};
				image.onerror = function() {};

				Plugin.Service.Sticker.getById(stickerId, function(sticker) {
					image.src = sticker.image[Plugin.Configs.stickerResolutionType];
				});

				self.contentEl.appendChild(stickersSpanEl);
			}

			for (var i = 0; i < stickersIds.length; i++) {
				var stickerId = stickersIds[i];
				appendSticker(stickerId);
			}

			this.updateScroll('top');
		},
		renderEmojis: function(offset) {

			if (offset > Plugin.Configs.emojiList.length - 1) {
				return;
			}

			var limit = offset + this.emojisLimit;
			if (limit > Plugin.Configs.emojiList.length - 1) {
				limit = Plugin.Configs.emojiList.length;
			}

			for (var i = offset; i < limit; i++) {
				var emoji = Plugin.Configs.emojiList[i],
					emojiEl = document.createElement('span'),
					emojiImgHtml = Plugin.Service.Emoji.parseEmojiFromText(emoji);

				emojiEl.className = Plugin.Configs.emojiItemClass;
				emojiEl.innerHTML = emojiImgHtml;

				this.contentEl.appendChild(emojiEl);
			}

			this.emojisOffset = limit;

			this.updateScroll();
		},

		handleClickOnSticker: function(callback) {
			// todo: create static Plugin.Configs.stickerItemClass
			Plugin.Service.Helper.setEvent('click', this.contentEl, Plugin.Configs.stickerItemClass, callback);
		},
		handleClickOnEmoji: function(callback) {
			// todo: create static Plugin.Configs.emojiItemClass
			Plugin.Service.Helper.setEvent('click', this.contentEl, Plugin.Configs.emojiItemClass, callback);
		},

		open: function(tabName) {
			tabName = tabName || null;

			if (tabName) {
				this.tabsView.activeTab(tabName);
			}

			if (!this.tabsView.hasActiveTab) {
				this.tabsView.activeLastUsedStickersTab();
			}
		},
		close: function() {},

		updateScroll: function(position) {
			position = position || 'relative';

			if (position == 'top') {
				this.scrollableEl.scrollTop = 0;
			}

			Plugin.Libs.PerfectScrollbar.update(this.scrollableEl);
		},

		onWindowResize: function() {}
	});

})(window.StickersModule);

(function(Plugin) {

	var parent = Plugin.View.Block;

	Plugin.View.Popover = parent.extend({

		popoverEl: null,
		triangleEl: null,
		toggleEl: null,

		active: false,

		_constructor: function() {
			parent.prototype._constructor.apply(this, arguments);

			this.toggleEl = document.getElementById(Plugin.Configs.elId);
			this.toggleEl.addEventListener('click', (function() {
				this.toggle();
			}).bind(this));

			this.popoverEl = document.createElement('div');
			this.popoverEl.className = 'sp-popover';

			this.el = document.createElement('div');

			this.triangleEl = document.createElement('div');
			this.triangleEl.className = 'sp-arrow';

			this.popoverEl.appendChild(this.el);
			this.popoverEl.appendChild(this.triangleEl);

			this.handleClickOnSticker((function() {
				this.toggle();
			}).bind(this));

			document.getElementsByTagName('body')[0].addEventListener('click', (function(e) {
				function isDescendant(parent, child) {
					var node = child.parentNode;
					while (node != null) {
						if (node == parent) {
							return true;
						}
						node = node.parentNode;
					}
					return false;
				}

				if (!this.active) {
					return;
				}

				if (!isDescendant(this.popoverEl, e.target) && !isDescendant(this.toggleEl.parentElement, e.target)) {
					this.toggle();
				}
			}).bind(this));

			window.addEventListener(Plugin.Service.Event.events.showContentHighlight, (function() {
				this.toggleEl.classList.add('stickerpipe-content-highlight');
			}).bind(this));

			window.addEventListener(Plugin.Service.Event.events.hideContentHighlight, (function() {
				this.toggleEl.classList.remove('stickerpipe-content-highlight');
			}).bind(this));

			// todo: addEventListener --> DOMEventService
			if (window.addEventListener) {
				window.addEventListener(Plugin.Service.Event.events.popoverShown, function() {
					Plugin.Service.Event.resize();
				});
			} else {
				window.attachEvent('on' + Plugin.Service.Event.events.popoverShown, function() {
					Plugin.Service.Event.resize();
				});
			}
		},

		toggle: function() {
			if (!this.active) {
				this.open();
			} else {
				this.close();
			}
		},

		open: function() {
			if (!this.active) {

				this.active = true;

				this.toggleEl.parentElement.appendChild(this.popoverEl);
				this.positioned();
				Plugin.Service.Event.popoverShown();
			}

			parent.prototype.open.apply(this, arguments);
		},

		close: function() {
			this.active = false;
			this.toggleEl.parentElement.removeChild(this.popoverEl);
			Plugin.Service.Event.popoverHidden();
			// todo
			this.popoverEl.style.marginTop = 0;
		},

		positioned: function() {
			var arrowOffset = 0;

			// todo: check
			if (this.triangleEl) {
				var style = this.toggleEl.currentStyle || window.getComputedStyle(this.toggleEl);
				var marginLeft = parseInt(style.marginLeft, 10);

				this.popoverEl.style.marginLeft = marginLeft + 'px';

				//if (this.popoverEl.getBoundingClientRect().left + this.popoverEl.offsetWidth > window.innerWidth) {
				//	this.popoverEl.style.marginLeft = marginLeft - (this.popoverEl.offsetWidth / 2) + (this.toggleEl.clientWidth / 2) + 'px';
				//}

				this.triangleEl.style.marginLeft = this.toggleEl.getBoundingClientRect().left
					- this.popoverEl.getBoundingClientRect().left
					+ (this.toggleEl.clientWidth / 2) - (this.triangleEl.offsetWidth / 2)
					+ 'px';

				var arrowStyle = this.triangleEl.currentStyle || window.getComputedStyle(this.triangleEl);
				if (arrowStyle.display != 'none') {
					arrowOffset = 15;
				}

				var elOffset = this.toggleEl.getBoundingClientRect().top + this.toggleEl.offsetHeight - this.popoverEl.getBoundingClientRect().top;

				// todo 5px remove
				this.popoverEl.style.marginTop = -(this.popoverEl.offsetHeight + this.toggleEl.offsetHeight + arrowOffset - elOffset + 5) + 'px';
			} else {
				console && console.error('error: triangle not found');
			}
		}

	});

})(window.StickersModule);

(function(Plugin) {

	Plugin.View.Preloader = function(parentEl) {

		// Constructor

		var el = document.createElement('div');
		el.className = 'sp-preloader';

		el.innerHTML = '' +
			'<div class="sp-preloader-content">' +
				'<div class="sp-preloader-chasing-dots">' +
					'<div class="sp-preloader-child sp-preloader-dot1"></div>' +
					'<div class="sp-preloader-child sp-preloader-dot2"></div>' +
				'</div>' +
			'</div>';

		if (parentEl) {
			parentEl.appendChild(el);
		}

		// ***********

		return {

			getEl: function() {
				return el;
			},

			show: function() {
				el.style.display = '';
			},

			hide: function() {
				el.style.display = 'none';
			}
		};
	};

})(window.StickersModule);

(function(Plugin) {


	var packTabSize = 48,
		classes = {
			scrollableContainer: 'sp-tabs-scrollable-container',
			scrollableContent: 'sp-tabs-scrollable-content',
			controlTab: 'sp-control-tab',
			controlButton: 'sp-control-button',
			unwatched: 'sp-unwatched-content',
			packTab: 'sp-pack-tab',
			tabActive: 'sp-tab-active',
			tabs: 'sp-tabs'
		};

	Plugin.View.Tabs = Plugin.Libs.Class({

		el: null,
		scrollableContainerEl: null,
		scrollableContentEl: null,

		packTabs: {},
		packTabsIndexes: {},

		hasActiveTab: false,

		controls: {
			emoji: {
				id: 'spTabEmoji',
				class: 'sp-tab-emoji',
				icon: 'sp-icon-face',
				el: null,
				isTab: true
			},
			history: {
				id: 'spTabHistory',
				class: 'sp-tab-history',
				icon: 'sp-icon-clock',
				el: null,
				isTab: true
			},
			settings: {
				id: 'spTabSettings',
				class: 'sp-tab-settings',
				icon: 'sp-icon-settings',
				el: null,
				isTab: false
			},
			store: {
				id: 'spTabStore',
				class: 'sp-tab-store',
				icon: 'sp-icon-plus',
				el: null,
				isTab: false
			},
			prevPacks: {
				id: 'spTabPrevPacks',
				class: 'sp-tab-prev-packs',
				icon: 'sp-icon-arrow-back',
				el: null,
				isTab: false
			},
			nextPacks: {
				id: 'spTabNextPacks',
				class: 'sp-tab-next-packs',
				icon: 'sp-icon-arrow-forward',
				el: null,
				isTab: false
			}
		},

		_constructor: function() {

			this.el = document.createElement('div');

			window.addEventListener('resize', (function() {
				this.onWindowResize();
			}).bind(this));
		},


		render: function() {

			this.el.className = classes.tabs;
			this.el.innerHTML = '';

			this.renderPrevPacksTab();

			this.renderScrollableContainer();

			this.renderPacks();

			this.renderNextPacksTab();

			this.renderStoreTab();
		},
		renderScrollableContainer: function() {

			this.scrollableContentEl = document.createElement('div');
			this.scrollableContentEl.className = classes.scrollableContent;

			this.scrollableContainerEl = document.createElement('div');
			this.scrollableContainerEl.className = classes.scrollableContainer;

			this.scrollableContainerEl.appendChild(this.scrollableContentEl);
			this.el.appendChild(this.scrollableContainerEl);
		},
		renderControlButton: function(controlButton) {
			controlButton.isTab = controlButton.isTab || false;

			var buttonClasses = [controlButton.class];
			buttonClasses.push((controlButton.isTab) ? classes.controlTab : classes.controlButton);

			var content = '<span class="' + controlButton.icon + '"></span>';

			controlButton.el = this.renderTab(controlButton.id, buttonClasses, content);
			return controlButton.el;
		},
		renderPackTab: function(pack) {
			var tabClasses = [classes.packTab];

			if (pack.isUnwatched) {
				tabClasses.push(classes.unwatched);
			}

			var content = '<img src=' + pack.tab_icon[Plugin.Configs.tabResolutionType] + '>';

			var tabEl = this.renderTab(null, tabClasses, content, {
				'data-pack-name': pack.pack_name
			});

			tabEl.addEventListener('click', (function() {
				tabEl.classList.remove(classes.unwatched);
			}).bind(this));

			this.packTabs[pack.pack_name] = tabEl;

			return tabEl;
		},
		renderTab: function(id, tabClasses, content, attrs) {
			tabClasses = tabClasses || [];
			attrs = attrs || {};

			var tabEl = document.createElement('span');

			if (id) {
				tabEl.id = id;
			}

			tabClasses.push(Plugin.Configs.tabItemClass);

			tabEl.classList.add.apply(tabEl.classList, tabClasses);

			for (var name in attrs) {
				tabEl.setAttribute(name, attrs[name]);
			}

			tabEl.innerHTML = content;

			tabEl.addEventListener('click', (function() {
				if (!tabEl.classList.contains(classes.controlTab) &&
					!tabEl.classList.contains(classes.packTab)) {
					return;
				}

				for (var tabName in this.packTabs) {
					this.packTabs[tabName].classList.remove(classes.tabActive);
				}

				for (var controlName in this.controls) {
					var controlTab = this.controls[controlName];
					if (controlTab && controlTab.el) {
						controlTab.el.classList.remove(classes.tabActive);
					}
				}

				tabEl.classList.add(classes.tabActive);
			}).bind(this));

			return tabEl;
		},


		renderPacks: function() {
			this.scrollableContentEl.innerHTML = '';

			this.renderEmojiTab();
			this.renderHistoryTab();

			var packs = Plugin.Service.Storage.getPacks();

			for (var i = 0; i < packs.length; i++) {
				var pack = packs[i];

				if (Plugin.Service.Pack.isHidden(pack)) {
					continue;
				}

				this.scrollableContentEl.appendChild(this.renderPackTab(pack));
				this.packTabsIndexes[pack.pack_name] = i;
			}

			this.renderSettingsTab();
		},
		renderEmojiTab: function() {
			if (Plugin.Configs.enableEmojiTab) {
				this.scrollableContentEl.appendChild(this.renderControlButton(this.controls.emoji));
			}
		},
		renderHistoryTab: function() {
			if (Plugin.Configs.enableHistoryTab) {
				this.scrollableContentEl.appendChild(this.renderControlButton(this.controls.history));
			}
		},
		renderSettingsTab: function() {
			if (Plugin.Configs.enableSettingsTab) {
				this.scrollableContentEl.appendChild(this.renderControlButton(this.controls.settings));
			}
		},
		renderStoreTab: function() {
			if (Plugin.Configs.enableStoreTab) {
				this.el.appendChild(this.renderControlButton(this.controls.store));

				if (Plugin.Service.Storage.getStoreLastModified() > Plugin.Service.Storage.getStoreLastVisit()) {
					this.controls.store.el.classList.add('sp-unwatched-content');
				}
			}
		},
		renderPrevPacksTab: function() {
			this.el.appendChild(this.renderControlButton(this.controls.prevPacks));
			Plugin.Service.Helper.setEvent('click', this.el, this.controls.prevPacks.class, this.onClickPrevPacksButton.bind(this));
		},
		renderNextPacksTab: function() {
			this.el.appendChild(this.renderControlButton(this.controls.nextPacks));
			Plugin.Service.Helper.setEvent('click', this.el, this.controls.nextPacks.class, this.onClickNextPacksButton.bind(this));
		},


		onClickPrevPacksButton: function() {
			var containerWidth = this.scrollableContainerEl.offsetWidth;
			var contentOffset = parseInt(this.scrollableContentEl.style.left, 10) || 0;
			var countFullShownTabs = parseInt((containerWidth / packTabSize), 10);

			var offset = contentOffset + (packTabSize * countFullShownTabs);
			offset = (offset > 0) ? 0 : offset;
			this.scrollableContentEl.style.left = offset + 'px';
			this.onWindowResize();
		},
		onClickNextPacksButton: function() {
			var containerWidth = this.scrollableContainerEl.offsetWidth;
			var contentOffset = parseInt(this.scrollableContentEl.style.left, 10) || 0;
			var countFullShownTabs = parseInt((containerWidth / packTabSize), 10);

			var offset = -(packTabSize * countFullShownTabs) + contentOffset;
			this.scrollableContentEl.style.left = offset + 'px';
			this.onWindowResize();
		},


		activeTab: function(tabName) {
			var i = this.packTabsIndexes[tabName];

			if (Plugin.Configs.enableEmojiTab) {
				i++;
			}
			if (Plugin.Configs.enableHistoryTab) {
				i++;
			}

			this.packTabs[tabName].click();
			this.hasActiveTab = true;

			var packTabSize = this.scrollableContentEl.getElementsByClassName(classes.packTab)[0].offsetWidth;
			var containerWidth = this.scrollableContainerEl.offsetWidth;
			var countFullShownTabs = parseInt((containerWidth / packTabSize), 10);

			var offset = -(parseInt((i / countFullShownTabs), 10) * containerWidth);
			//offset = (offset > 0) ? 0 : offset + 6; // old code
			offset = (-offset < countFullShownTabs * packTabSize) ? 0 : offset + 6; // bugfix todo

			this.scrollableContentEl.style.left = offset + 'px';

			this.onWindowResize();
		},
		activeLastUsedStickersTab: function() {
			this.controls.history.el.click();
			this.hasActiveTab = true;
		},


		handleClickOnEmojiTab: function(callback) {
			Plugin.Service.Helper.setEvent('click', this.el, this.controls.emoji.class, callback);
		},
		handleClickOnRecentTab: function(callback) {
			Plugin.Service.Helper.setEvent('click', this.el, this.controls.history.class, callback);
		},
		handleClickOnPackTab: function(callback) {
			Plugin.Service.Helper.setEvent('click', this.el, classes.packTab, callback);
		},
		handleClickOnStoreTab: function(callback) {
			Plugin.Service.Helper.setEvent('click', this.el, this.controls.store.class, callback);
		},


		onWindowResize: function() {

			if (!this.el.parentElement) {
				return;
			}

			if (this.controls.prevPacks.el) {
				if (parseInt(this.scrollableContentEl.style.left, 10) < 0) {
					this.controls.prevPacks.el.style.display = 'block';
				} else {
					this.controls.prevPacks.el.style.display = 'none';
				}
			}


			if (this.controls.nextPacks.el) {
				var contentWidth = this.scrollableContentEl.scrollWidth;
				var contentOffset = parseInt(this.scrollableContentEl.style.left, 10) || 0;

				if (contentWidth + contentOffset > this.scrollableContainerEl.offsetWidth) {
					this.controls.nextPacks.el.style.display = 'block';
				} else {
					this.controls.nextPacks.el.style.display = 'none';
				}
			}
		}
	});

})(window.StickersModule);

(function(window, Plugin) {

	// todo: rename Stickers --> StickerPipe
	window.Stickers = Plugin.Libs.Class({

		view: null,

		_constructor: function(config) {

			Plugin.Service.Helper.setConfig(config);

			// ***** Init Emoji tab *****
			var mobileOS = Plugin.Service.Helper.getMobileOS();
			if (mobileOS == 'ios' || mobileOS == 'android') {
				config.enableEmojiTab = false;
			}

			// ***** Check required params *****
			if (!Plugin.Configs.apiKey || !Plugin.Configs.userId) {
				throw new Error('Empty one of required data [apiKey, userId]');
			}

			// ***** Init UserId *****
			Plugin.Configs.userId = Plugin.Service.Helper.md5(Plugin.Configs.userId + Plugin.Configs.apiKey);

			if (Plugin.Configs.userId != Plugin.Service.Storage.getUserId()) {
				Plugin.Service.Storage.setPacks([]);
				Plugin.Service.Storage.setRecentStickers([]);
				Plugin.Service.Storage.setUserData({});
				Plugin.Service.Storage.setPendingRequestTasks([]);
				Plugin.Service.Storage.setStoreLastVisit(0);
			}

			Plugin.Service.Storage.setUserId(Plugin.Configs.userId);

			// ***** Init modules *****
			Plugin.Module.Store.init(this);

			// ***** Init services ******
			Plugin.Service.User.init();
			Plugin.Service.Pack.init(this);
			Plugin.Service.Emoji.init(Plugin.Libs.Twemoji);
			Plugin.Service.PendingRequest.init();
		},

		////////////////////
		//   Functions
		////////////////////

		render: function(callback, elId) {
			Plugin.Configs.elId = elId || Plugin.Configs.elId;

			var self = this;

			this.view = new Plugin.View.Popover();

			this.delegateEvents();

			// todo
			Plugin.Service.Packs.fetch(function() {
				self.view.render();

				callback && callback();
			});

			setInterval(function() {
				Plugin.Service.Packs.fetch();
			}, 1000 * 60 * 60);
		},

		delegateEvents: function() {
			var self = this;

			this.view.tabsView.handleClickOnEmojiTab(function() {
				self.view.renderEmojiBlock();
			});

			this.view.tabsView.handleClickOnRecentTab(function() {
				self.view.renderRecentStickers();
			});

			this.view.tabsView.handleClickOnStoreTab(function() {
				Plugin.Module.Store.open();

				Plugin.Service.Storage.setStoreLastVisit(+(new Date()));
				Plugin.Service.Highlight.check();

				self.view.tabsView.controls.store.el.classList.remove('sp-unwatched-content');
			});

			this.view.tabsView.handleClickOnPackTab(function(el) {
				var packName = el.getAttribute('data-pack-name'),
					pack = Plugin.Service.Storage.getPack(packName);

				if (pack) {
					pack.isUnwatched = false;
					Plugin.Service.Storage.setPack(packName, pack);
					self.view.renderPack(pack);
				}

				Plugin.Service.Highlight.check();
			});

			this.view.handleClickOnSticker(function(el) {

				var stickerId = el.getAttribute('data-sticker-id');

				Plugin.Service.Statistic.useSticker(stickerId);
				Plugin.Service.Storage.addRecentSticker(stickerId);

				Plugin.Service.Highlight.check();
			});

			this.view.handleClickOnEmoji(function(el) {
				var emoji = Plugin.Service.Emoji.parseEmojiFromHtml(el.innerHTML);
				Plugin.Service.Statistic.useEmoji(emoji);
			});
		},

		fetchPacks: function(callback) {
			Plugin.Service.Packs.fetch(callback);
		},

		isSticker: function(text) {
			return Plugin.Service.Sticker.isSticker(text);
		},

		parseStickerFromText: function(text, callback) {
			return Plugin.Service.Sticker.parse(text, callback);
		},

		parseEmojiFromText: function(text) {
			return Plugin.Service.Emoji.parseEmojiFromText(text);
		},

		parseEmojiFromHtml: function(html) {
			return Plugin.Service.Emoji.parseEmojiFromHtml(html);
		},

		onUserMessageSent: function(isSticker) {
			Plugin.Service.Statistic.messageSend(isSticker);
		},

		purchaseSuccess: function(packName, pricePoint) {
			Plugin.Module.Store.purchaseSuccess(packName, pricePoint);
		},

		purchaseFail: function() {
			Plugin.Module.Store.purchaseFail();
		},

		open: function(tabName) {
			this.view.open(tabName);
		},

		close: function() {
			this.view.close();
		},

		openStore: function(contentId) {
			Plugin.Module.Store.open(contentId);
		},

		closeStore: function() {
			Plugin.Module.Store.close();
		},

		getPackMainIcon: function(packName, callback) {
			Plugin.Service.Pack.getMainIcon(packName, callback);
		},

		////////////////////
		//  Callbacks
		////////////////////

		onClickSticker: function(callback, context) {
			this.view.handleClickOnSticker(function(el) {
				callback.call(context, '[[' + el.getAttribute('data-sticker-id') + ']]');
			});
		},

		onClickEmoji: function(callback, context) {
			this.view.handleClickOnEmoji((function(el) {
				var emoji = this.parseEmojiFromHtml(el.innerHTML);

				callback.call(context, emoji);
			}).bind(this));
		},

		onPurchase: function(callback) {
			Plugin.Module.Store.setOnPurchaseCallback(callback);
		}
	});

})(window, window.StickersModule);
