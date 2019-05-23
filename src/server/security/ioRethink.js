let r = require('rethinkdb');
let serverConfig = require('../config/serverConfig');

const tables = [
	'character',
	'characterList',
	'stash',
	'skins',
	'login',
	'leaderboard',
	'customMap',
	'mail',
	'customChannels',
	'error',
	'modLog',
	'accountInfo'
];

module.exports = {
	connection: null,
	useDb: 'live',

	init: async function (cbReady) {
		const dbConfig = {
			host: serverConfig.dbHost,
			port: serverConfig.dbPort
		};

		this.connection = await r.connect(dbConfig);

		await this.connection.use(this.useDb);
		await this.create();

		cbReady();
	},

	create: async function () {
		try {
			await r.dbCreate(this.useDb).run(this.connection);
		} catch (e) {

		}

		for (const table of tables) {
			try {
				await r.tableCreate(table).run(this.connection);
			} catch (e) {
				if (!e.message.includes('already exists'))
					_.log(e);
			}
		}
	},

	getAsync: async function ({
		table,
		key,
		isArray,
		noDefault
	}) {
		let res = await r.table(table)
			.get(key)
			.run(this.connection);

		if (res)
			return res.value;
		else if (isArray && !noDefault)
			return [];

		return res;
	},

	getAllAsync: async function ({
		table,
		key,
		isArray,
		noDefault
	}) {
		let res = await r.table(table)
			.run(this.connection);

		res = await res.toArray();

		if (res)
			return res;
		else if (isArray && !noDefault)
			return [];

		return res;
	},

	setAsync: async function ({
		table,
		key: id,
		value,
		conflict = 'update'
	}) {
		await r.table(table)
			.insert({
				id,
				value
			}, {
				conflict
			})
			.run(this.connection);
	},

	deleteAsync: async function ({
		key,
		table
	}) {
		await r.table(table)
			.get(key)
			.delete()
			.run(this.connection);
	},

	subscribe: function (table) {
		return r.table(table)
			.changes()
			.run(this.connection);
	},

	append: async function ({
		table,
		key,
		value,
		field
	}) {
		await r.table(table)
			.get(key)
			.update(row => {
				return r.branch(
					row('value').typeOf().eq('ARRAY'),
					{
						[field]: row('value').setUnion(value)
					},
					{
						[field]: value
					}
				);
			})
			.run(this.connection);
	},

	exists: async function ({
		table,
		key
	}) {
		let res = await r.table(table)
			.get(key)
			.run(this.connection);

		return !!res;
	}
};
