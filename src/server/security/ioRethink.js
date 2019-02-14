let r = require('rethinkdb');

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
	useDb: 'dev',

	init: async function () {
		this.connection = await r.connect({
			host: 'localhost',
			port: 28015
		});

		await this.connection.use(this.useDb);
		await this.create();

		this.bindHandlers();
	},

	create: async function () {
		try {
			await r.dbCreate('dev').run(this.connection);
		} catch (e) {

		}

		for (const table of tables) {
			try {
				await r.tableCreate(table).run(this.connection);
			} catch (e) {
				if (!e.msg.includes('already exists'))
					console.log(e);
			}
		}
	},

	bindHandlers: function () {
		io.getAsync = this.getAsync.bind(this);
		io.setAsync = this.setAsync.bind(this);
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

	setAsync: async function ({
		table,
		key: id,
		value
	}) {
		await r.table(table)
			.insert({
				id,
				value
			}, {
				conflict: 'update'
			})
			.run(this.connection);
	}
};
