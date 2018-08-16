module.exports = {
	list: [],
	waiting: [],
	loaded: false,

	init: async function () {
		await this.getList();
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
						if (!rProphecies.includes(prophecyFilter[i])) {
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

	getList: async function () {
		let list = await io.getAllAsync({
			table: 'leaderboard',
			isArray: true
		});

		this.list = list.map(l => ({
			name: l.key,
			level: l.value.level,
			prophecies: l.value.prophecies
		}));

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
			if (!this.list.some(l => l.name === w.name)) {
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

		let result = this.list.find(l => (l.name === name));
		if (result)
			return result.level;
		return null;
	},

	setLevel: function (name, level, prophecies) {
		let exists = this.list.find(l => l.name === name);
		if (exists)
			exists.level = level;
		else {
			exists = {
				name: name,
				level: level,
				prophecies: prophecies
			};

			this.list.push(exists);
			this.sort();
		}

		this.save(exists);
	},

	deleteCharacter: async function (name) {
		this.list.spliceWhere(l => (l.name === name));
		
		await io.deleteAsync({
			key: name,
			table: 'leaderboard'
		});
	},

	killCharacter: async function (name) {
		let character = this.list.find(l => (l.name === name));
		if (!character)
			return;

		character.dead = true;
		this.save(character);
	},

	sort: function () {
		this.list.sort(function (a, b) {
			return (b.level - a.level);
		}, this);
	},

	save: async function (character) {
		let value = {
			level: character.level,
			prophecies: character.prophecies
		};

		if (character.dead)
			value.dead = true;

		io.set({
			ent: character.name,
			field: 'leaderboard',
			value: JSON.stringify(character)
		});
	}
};
