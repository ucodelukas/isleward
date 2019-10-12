const serverConfig = require('../config/serverConfig');

const r = require('rethinkdbdash')({
	host: serverConfig.dbHost,
	port: serverConfig.dbPort,
	db: serverConfig.dbName
});

const dbConfig = {
	host: serverConfig.dbHost,
	port: serverConfig.dbPort,
	db: 'live'
};

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
	staticCon: null,

	init: async function (cbReady) {
		await this.create();

		cbReady();
	},

	getConnection: async function () {
		return await r.connect(dbConfig);
	},

	create: async function () {
		const con = await this.getConnection();

		try {
			await r.dbCreate(this.useDb).run();
		} catch (e) {

		}

		for (const table of tables) {
			try {
				await r.tableCreate(table).run();
			} catch (e) {
				if (!e.message.includes('already exists'))
					_.log(e);
			}
		}

		con.close();
	},

	getAsync: async function ({
		table,
		key,
		isArray,
		noDefault
	}) {
		const con = await this.getConnection();

		let res = await r.table(table)
			.get(key)
			.run();

		if (res)
			return res.value;
		else if (isArray && !noDefault)
			return [];

		con.close();

		return res;
	},

	getAllAsync: async function ({
		table,
		key,
		isArray,
		noDefault
	}) {
		const con = await this.getConnection();

		let res = await r.table(table)
			.run();

		if (res)
			return res;
		else if (isArray && !noDefault)
			return [];

		con.close();

		return res;
	},

	setAsync: async function ({
		table,
		key: id,
		value,
		conflict = 'update'
	}) {
		try {
			await r.table(table)
				.insert({
					id,
					value
				}, {
					conflict
				})
				.run();
		} catch (e) {
			this.logError(e, table, id);
		}
	},

	deleteAsync: async function ({
		key,
		table
	}) {
		const con = await this.getConnection();

		await r.table(table)
			.get(key)
			.delete()
			.run();
	},

	subscribe: function (table) {
		return r.table(table)
			.changes()
			.run();
	},

	append: async function ({
		table,
		key,
		value,
		field
	}) {
		try {
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
				.run();
		} catch (e) {
			this.logError(e, table, key);
		}
	},

	exists: async function ({
		table,
		key
	}) {
		const con = await this.getConnection();

		let res = await r.table(table)
			.get(key)
			.run();

		return !!res;
	},

	logError: async function (error, table, key) {
		try {
			const errorValue = `${error.toString()} | ${error.stack.toString()} | ${table} | ${key}`;

			await this.setAsync({
				key: new Date(),
				table: 'error',
				value: errorValue
			});
		} catch (e) {}

		process.send({
			event: 'onCrashed'
		});
	}
};
