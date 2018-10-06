/* global _, scale, scaleMult */

window.scale = 40;
window.scaleMult = 5;

//eslint-disable-next-line no-extend-native
Array.prototype.firstIndex = function (callback, thisArg) {
	let T = thisArg;
	let O = Object(this);
	let len = O.length >>> 0;

	let k = 0;

	while (k < len) {
		let kValue;

		if (k in O) {
			kValue = O[k];

			if (callback.call(T, kValue, k, O))
				return k;
		}
		k++;
	}

	return -1;
};

//eslint-disable-next-line no-extend-native
Array.prototype.spliceWhere = function (callback, thisArg) {
	let T = thisArg;
	let O = Object(this);
	let len = O.length >>> 0;

	let k = 0;

	while (k < len) {
		let kValue;

		if (k in O) {
			kValue = O[k];

			if (callback.call(T, kValue, k, O)) {
				O.splice(k, 1);
				k--;
			}
		}
		k++;
	}
};

//eslint-disable-next-line no-extend-native
Array.prototype.spliceFirstWhere = function (callback, thisArg) {
	let T = thisArg;
	let O = Object(this);
	let len = O.length >>> 0;

	let k = 0;

	while (k < len) {
		let kValue;

		if (k in O) {
			kValue = O[k];

			if (callback.call(T, kValue, k, O)) {
				O.splice(k, 1);
				return kValue;
			}
		}
		k++;
	}
};

//eslint-disable-next-line no-extend-native
Object.defineProperty(Object.prototype, 'has', {
	enumerable: false,
	value: function (prop) {
		//eslint-disable-next-line no-undefined
		return (this.hasOwnProperty(prop) && this[prop] !== undefined && this[prop] !== null);
	}
});

window._ = {
	get2dArray: function (w, h, def) {
		def = def || 0;

		let result = [];
		for (let i = 0; i < w; i++) {
			let inner = [];
			for (let j = 0; j < h; j++) {
				if (def === 'array')
					inner.push([]);
				else
					inner.push(def);
			}

			result.push(inner);
		}

		return result;
	}
};

define([
	
], function (
	
) {
	return window._;
});
