let globals = require('./globals');
let server = require('./server');
let atlas = require('./world/atlas');
let components = require('./components/components');
let leaderboard = require('./leaderboard/leaderboard');
let io = require('./security/io');
let mods = require('./misc/mods');
let mtx = require('./mtx/mtx');
let animations = require('./config/animations');
let skins = require('./config/skins');
let factions = require('./config/factions');
let classes = require('./config/spirits');
let spellsConfig = require('./config/spellsConfig');
let spells = require('./config/spells');
let itemTypes = require('./items/config/types');
let recipes = require('./config/recipes/recipes');
let sheets = require('./security/sheets');

let startup = {
	init: function () {
		io.init(this.onDbReady.bind(this));
	},

	onDbReady: function () {
		setInterval(function () {
			global.gc();
		}, 60000);

		process.on('uncaughtException', this.onError.bind(this));

		animations.init();
		mods.init(this.onModsLoaded.bind(this));
	},

	onModsLoaded: function () {
		globals.init();
		classes.init();
		spellsConfig.init();
		spells.init();
		recipes.init();
		itemTypes.init();
		components.init(this.onComponentsReady.bind(this));
	},

	onComponentsReady: function () {
		skins.init();
		factions.init();
		server.init(this.onServerReady.bind(this));
	},

	onServerReady: function () {
		atlas.init();
		leaderboard.init();
		sheets.init();
	},

	onError: function (e) {
		console.log(e);
		if (e.toString().indexOf('ERR_IPC_CHANNEL_CLOSED') > -1)
			return;

		console.log('Error Logged: ' + e.toString());

		io.set({
			ent: new Date(),
			field: 'error',
			value: e.toString() + ' | ' + e.stack.toString(),
			callback: function () {
				process.exit();
			}
		});
	}
};

startup.init();
