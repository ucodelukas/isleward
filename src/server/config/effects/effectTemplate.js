module.exports = {
	save: function () {
		if (!this.persist)
			return null;

		let values = {};
		for (let p in this) {
			let value = this[p];
			if ((typeof(value) === 'function') || (p === 'obj') || (p === 'events'))
				continue;

			values[p] = value;
		}

		if (!this.expire)
			this.expire = (+new Date()) + (this.ttl * 350);

		return values;
	},

	simplify: function () {
		return this.type;
	}	
};
