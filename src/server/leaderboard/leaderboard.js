define([
	'security/io',
	'fixes/fixes'
], function (
	io,
	fixes
) {
	return {
		init: function () {

		},

		requestList: function (msg) {
			var prophecyFilter = msg.data.prophecies;
			var offset = msg.data.offset;

			var query = {
				field: 'playerLevels',
				offset: offset,
				limit: 10,
				order: {
					level: 'DESC'
				},
				callback: this.onGetList.bind(this, msg)
			};

			if (!prophecyFilter) {
				query.filter = [];

				prophecyFilter.forEach(function (p) {
					query.filter.push({
						field: 'prophecies',
						operator: 'like',
						value: `'%${p}%'`
					});
				});
			}

			io.get(query);
		},

		onGetList: function (msg, result) {
			result = result || [];

			result = result.map(function (r) {
				return {
					name: r.key,
					level: r.level
				};
			});

			msg.callback({
				list: result,
				length: 123
			});
		},

		getLevel: function (name) {
			var query = {
				key: name,
				field: 'playerLevels',
				callback: this.onGetLevel.bind(this)
			};
		},

		setLevel: function (name, level, prophecies) {
			var value = JSON.stringify({
				name: name,
				level: level,
				prophecies: prophecies
			});

			io.set({
				ent: name,
				field: 'playerLevels',
				extraFields: {
					level: level
				},
				value: value
			});
		},

		deleteCharacter: function (name) {
			io.delete({
				ent: name,
				field: 'playerLevels'
			});
		},

		killCharacter: function (name) {
			var char = io.get({
				ent: name,
				field: 'playerLevels',
				callback: this.doKillCharacter.bind(this, name)
			});
		},
		doKillCharacter: function (name, result) {
			var obj = JSON.parse(result);
			obj.dead = true;

			var value = JSON.stringify(obj);

			io.set({
				ent: name,
				field: 'playerLevels',
				value: value
			});
		}
	};
});
