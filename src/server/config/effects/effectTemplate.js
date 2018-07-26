module.exports = {
	save: function () {
		if (!this.persist)
			return null;

		let values = {};
		for (let p in this) {
			let value = this[p];
			if ((typeof(value) == 'function') || (p == 'obj') || (p == 'events'))
				continue;

			values[p] = value;
		}

		return values;
	},

	simplify: function () {
		return this.type;
	}	
};
