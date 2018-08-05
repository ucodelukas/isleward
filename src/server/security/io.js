let fs = require('fs');

module.exports = {
	db: null,
	file: '../../data/storage.db',
	exists: false,

	tables: {
		character: null,
		characterList: null,
		stash: null,
		skins: null,
		login: null,
		leaderboard: null,
		customMap: null,
		mail: null,
		customChannels: null,
		error: null,
		modLog: null,
		accountInfo: null
	},

	init: function (cbReady) {
		let sqlite = require('sqlite3').verbose();
		this.exists = fs.existsSync(this.file);
		this.db = new sqlite.Database(this.file, this.onDbCreated.bind(this, cbReady));
	},
	onDbCreated: function (cbReady) {
		let db = this.db;
		let tables = this.tables;
		let scope = this;
		db.serialize(function () {
			for (let t in tables) {
				db.run(`
					CREATE TABLE ${t} (key VARCHAR(50), value TEXT)
				`, scope.onTableCreated.bind(scope));
			}

			cbReady();
		}, this);

		this.exists = true;
	},
	onTableCreated: function () {

	},

	//ent, field
	get: function (options) {
		let key = options.ent;
		let table = options.field;

		options.query = `SELECT * FROM ${table} WHERE key = '${key}' LIMIT 1`;

		this.db.get(options.query, this.done.bind(this, options));
	},

	delete: function (options) {
		let key = options.ent;
		let table = options.field;

		options.query = `DELETE FROM ${table} WHERE key = '${key}'`;

		this.db.run(options.query, this.done.bind(this, options));
	},

	//ent, field, value
	set: function (options) {
		let key = options.ent;
		let table = options.field;

		this.db.get(`SELECT 1 FROM ${table} where key = '${key}'`, this.doesExist.bind(this, options));
	},
	doesExist: function (options, err, result) {
		let key = options.ent;
		let table = options.field;

		let query = `INSERT INTO ${table} (key, value) VALUES('${key}', '${options.value}')`;

		if (result)
			query = `UPDATE ${table} SET value = '${options.value}' WHERE key = '${key}'`;

		this.db.run(query, this.done.bind(this, options));
	},

	done: function (options, err, result) {
		result = result || {
			value: null
		};

		if (options.callback)
			options.callback(result.value);
	}
};
