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
		io.getAllAsync = this.getAllAsync.bind(this);
		io.setAsync = this.setAsync.bind(this);
		io.deleteAsync = this.deleteAsync.bind(this);

		io.subscribe = this.subscribe.bind(this);
		io.append = this.append.bind(this);
		io.exists = this.exists.bind(this);
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
		let recurse = (o, i = 0) => {
			if (!o)
				return;

			Object.entries(o).forEach(([k, v]) => {
				if (typeof(v) === 'object') {
					//console.log((k + '>').padStart(i));
					recurse(v, i++);
				} else if (typeof(v) !== 'string' && isNaN(v)) 
					console.log((k + v).padStart(i));
					//console.log();
			});
		};

		recurse(value);

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
			.update({
				[field]: r.row('value').append(...value)
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
