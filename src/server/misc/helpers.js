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
	
module.exports = {
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
	},
	randomKey: function (o) {
		let keys = Object.keys(o);

		let keyIndex = ~~(Math.random() * keys.length);
		let key = keys[keyIndex];

		return key;
	},
	getDeepProperty: function (obj, path) {
		let o = obj;
		let pLen = path.length;

		for (let i = 0; i < pLen; i++) {
			o = o[path[i]];
			if (!o)
				return null;
		}

		return o;
	}
};
