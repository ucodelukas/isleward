//Hack to bypass eslint
let Obj = Object;

Obj.defineProperty(Array.prototype, 'firstIndex', {
	enumerable: false,
	value: function (callback, thisArg) {
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
	} 
});

Obj.defineProperty(Array.prototype, 'spliceWhere', {
	enumerable: false,
	value: function (callback, thisArg) {
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
	} 
});

Obj.defineProperty(Array.prototype, 'spliceFirstWhere', {
	enumerable: false,
	value: function (callback, thisArg) {
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
	} 
});

Obj.defineProperty(Object.prototype, 'has', {
	enumerable: false,
	value: function (prop) {
		return (this.hasOwnProperty(prop) && this[prop] !== undefined && this[prop] !== null);
	}
});
	
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
	},

	//Only use this method for official logging. Temporary logs should use console.log
	// so those instances can be reported by eslint
	log: function (msg) {
		//eslint-disable-next-line no-console
		console.log(msg);
	}
};
