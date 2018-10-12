let firebase = require('firebase');
let fConfig = require('./firebaseConfig');

module.exports = {
	db: null,
	io: null,

	init: async function (io, convert) {
		this.io = io;

		firebase.initializeApp(fConfig);
		this.db = firebase.database();

		if (!process.send && convert)
			await this.convert();

		this.bindHandlers();
	},

	bindHandlers: function () {
		this.io.process = () => {};

		this.io.get = this.get.bind(this);
		this.io.set = this.set.bind(this);

		this.io.getAsync = this.getAsync.bind(this);
		this.io.setAsync = this.setAsync.bind(this);

		this.io.getAllAsync = this.getAllAsync.bind(this);
		this.io.deleteAsync = this.deleteAsync.bind(this);

		this.io.on = this.on.bind(this);
	},

	convert: async function () {
		let tables = Object.keys(io.tables);
		for (table of tables) {
			if (await this.tableExists(table))
				continue;

			await this.createTable(table);
		}

		const options = {
			login: {
				noParse: true
			},
			mail: {
				noParse: true
			},
			error: {
				noParse: true
			}
		};

		for (table of tables) {
			console.log(`Converting ${table}`);
			let records = await io.getAllAsync({
				table: table,
				...options[table]
			});

			console.log(`${records.length} records`);
			for (record of records) 
				await this.write(table, record.key, record.value);
		}
	},

	tableExists: async function (table) {
		let res = await this.db.ref(`/${table}/{placeholder}/`).once('value');
		return (res.val() === 1);
	},

	createTable: async function (table) {
		await this.db.ref(`/${table}/`).set({
			'{placeholder}': 1
		});
	},

	on: async function (options) {
		this.db.ref(options.path).on('value', res => {
			options.callback(res.val());
		});
	},

	get: async function (options) {
		let res = await this.db.ref(`/${options.field}/${options.ent}`).once('value'); 

		if (options.callback)
			options.callback(res.val());
	},

	set: async function (options) {
		await this.db.ref(`/${options.field}/${options.ent}`).set(options.value);

		if (options.callback)
			options.callback();
	},

	getAsync: async function (options) {
		let res = (await this.db.ref(`/${options.table}/${options.key}`).once('value')).val();
		if (!res && !options.noDefault && !options.noParse) 
			res = options.isArray ? [] : {};
		else if (typeof(res) === 'string' && !options.noParse)
			res = JSON.parse(res);

		return res;
	},

	setAsync: async function (options) {
		await this.db.ref(`/${options.table}/${options.key}`).set(options.value);
	},

	getAllAsync: async function (options) {
		let res = await this.db.ref(`/${options.table}`).once('value');
		res = res.val(); 
		res = Object.keys(res).map(r => {
			return {
				key: r,
				value: res[r]
			};
		});

		return res;
	},

	deleteAsync: async function (options) {
		await this.db.ref(`/${options.table}/${options.key}`).remove();
	},

	read: async function (table, key) {
		let res = await this.db.ref(`/${table}/${key}`).once('value');
		return res.val();
	},

	write: async function (table, key, value) {
		await this.db.ref(`/${table}/${key}`).set(value);
	}
};
