define([
	'fs'
], function (
	fs
) {
	return {
		db: null,
		file: '../../data/storage.db',
		exists: false,

		tables: {
			character: null,
			characterList: null,
			stash: null,
			skins: null,
			login: null,
			playerLevels: null,
			customMap: null,
			mail: null,
			customChannels: null,
			error: null
		},

		tableKeys: {
			playerLevels: {
				key: 'VARCHAR(50)',
				level: 'INT',
				value: 'TEXT'
			}
		},

		init: function (cbReady) {
			var sqlite = require('sqlite3').verbose();
			this.exists = fs.existsSync(this.file);
			this.db = new sqlite.Database(this.file, this.onDbCreated.bind(this, cbReady));
		},
		onDbCreated: function (cbReady) {
			var db = this.db;
			var tables = this.tables;
			var scope = this;
			db.serialize(function () {
				for (var t in tables) {

					var fields = `key VARCHAR(50), value TEXT`;
					var keys = scope.tableKeys[t];
					if (keys) {
						fields = '';
						for (var k in keys) {
							fields += `${k} ${keys[k]},`;
						}
						fields = fields.substr(0, fields.length - 1);
					}

					db.run(`
						CREATE TABLE ${t} (${fields})
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
			var key = options.ent;
			var table = options.field;

			var query = `SELECT * FROM ${table}`;

			var filter = options.filter;
			if (filter) {
				query += ` WHERE`;

				filter.forEach(function (f) {
					query += ` ${f.field} ${f.operator} ${value}`;
				});
			} else if (key) {
				query += ` WHERE key = '${key}'`;
			}

			var order = options.order;
			if (order) {
				query += ` ORDER BY`;

				for (var p in order) {
					query += ` ${p} ${order[p]}`;
				}
			}

			query += ` LIMIT ${options.limit || 1}`;

			var offset = options.offset;
			if (offset)
				query += ` OFFSET ${offset}`;

			options.query = query;

			if (key)
				this.db.get(options.query, this.done.bind(this, options));
			else
				this.db.all(options.query, this.done.bind(this, options));
		},

		//ent, field
		count: function (options) {
			var key = options.ent;
			var table = options.field;

			var query = `SELECT COUNT(*) FROM ${table}`;

			var filter = options.filter;
			if (filter) {
				query += ` WHERE`;

				filter.forEach(function (f) {
					query += ` ${f.field} ${f.operator} ${value}`;
				});
			} else {
				query += ` WHERE key = '${key}'`;
			}

			query += ` LIMIT ${options.limit || 1}`;

			var offset = options.offset;
			if (offset)
				query += ` OFFSET ${offset}`;

			options.query = query;

			this.db.get(options.query, this.done.bind(this, options));
		},

		delete: function (options) {
			var key = options.ent;
			var table = options.field;

			options.query = `DELETE FROM ${table} WHERE key = '${key}'`;

			this.db.run(options.query, this.done.bind(this, options));
		},

		//ent, field, value
		set: function (options) {
			var key = options.ent;
			var table = options.field;

			this.db.get(`SELECT 1 FROM ${table} where key = '${key}'`, this.doesExist.bind(this, options));
		},
		doesExist: function (options, err, result) {
			var key = options.ent;
			var table = options.field;

			var query = `INSERT INTO ${table} (key, value) VALUES('${key}', '${options.value}')`;
			var extraFields = options.extraFields;
			if (extraFields) {
				extraFields.key = key;
				extraFields.value = options.value;

				var fields = Object.keys(extraFields)
					.join(',');

				var values = Object.keys(extraFields)
					.map(p => `'${extraFields[p]}'`)
					.join(',');

				query = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
			}

			if (result)
				query = `UPDATE ${table} SET value = '${options.value}' WHERE key = '${key}'`;

			this.db.run(query, this.done.bind(this, options));
		},

		done: function (options, err, result) {
			result = result || {
				value: null
			};
			if (!result.hasOwnProperty('value')) {
				result = {
					value: result
				};
			}

			if (options.callback)
				options.callback(result.value);
		}
	};
});
