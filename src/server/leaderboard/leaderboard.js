let io = require('../security/io');

module.exports = {
	list: [],
	waiting: [],
	loaded: false,

	init: function () {
		this.getList();
	},

	requestList: function (msg) {
		let prophecyFilter = msg.data.prophecies;
		let offset = msg.data.offset;

		let result = this.list;
		let length = result.length;

		if (prophecyFilter) {
			let pLen = prophecyFilter.length;

			result = result
				.filter(function (r) {
					let rProphecies = r.prophecies || [];

					let match = true;
					for (let i = 0; i < pLen; i++) {
						if (!rProphecies.some(rp => rp == prophecyFilter[i])) {
							match = false;
							break;
						}
					}

					return match;
				});

			length = result.length;

			result = result
				.filter(function (r, i) {
					return (
						(i >= offset) &&
						(i < offset + 10)
					);
				});
		}

		msg.callback({
			list: result,
			length: length
		});
	},

	getList: function () {
		io.get({
			ent: 'list',
			field: 'leaderboard',
			callback: this.onGetList.bind(this)
		});
	},

	onGetList: function (result) {
		if (!result) {
			let list = {
				list: []
			};

			io.set({
				ent: 'list',
				field: 'leaderboard',
				value: JSON.stringify(list)
			});
		} else
			this.parseList(result);

		this.loaded = true;
	},

	parseList: function (result) {
		this.list = JSON.parse(result).list;

		if (!(this.list instanceof Array))
			this.list = [];

		this.list.forEach(function (l) {
			if (l.name.indexOf('\'') > -1)
				l.name = l.name.split('\'').join('');
		});

		let doSave = false;

		this.waiting.forEach(function (w) {
			if (!this.list.some(l => l.name == w.name)) {
				this.list.push(w);
				doSave = true;
			}
		}, this);

		if (doSave)
			this.save();

		this.waiting = [];
	},

	getLevel: function (name) {
		if (!this.list)
			return null;

		let result = this.list.find(l => (l.name == name));
		if (result)
			return result.level;
		return null;
	},

	setLevel: function (name, level, prophecies) {
		if (!this.list) {
			this.waiting.push({
				name: name,
				level: level,
				prophecies: prophecies
			});

			return;
		}

		let exists = this.list.find(l => l.name == name);
		if (exists) {
			if (exists.level != level) {
				exists.level = level;

				this.save();
			}
		} else {
			this.list.push({
				name: name,
				level: level,
				prophecies: prophecies
			});

			this.save();
		}
	},

	deleteCharacter: function (name) {
		this.list.spliceWhere(l => (l.name == name));
		this.save();
	},

	killCharacter: function (name) {
		let character = this.list.find(l => (l.name == name));
		if (!character)
			return;

		character.dead = true;
		this.save();
	},

	sort: function () {
		this.list.sort(function (a, b) {
			return (b.level - a.level);
		}, this);
	},

	save: function () {
		this.sort();

		if (!this.loaded)
			return;

		let value = JSON.stringify({
			list: this.list
		});

		io.set({
			ent: 'list',
			field: 'leaderboard',
			value: value
		});
	}
};
