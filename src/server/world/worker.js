global.io = true;

let extend = require('extend');
let helpers = require('misc/helpers');
let components = require('components/components');
let instancer = require('world/instancer');
let io = require('security/io');
let mods = require('misc/mods');
let mtx = require('mtx/mtx');
let animations = require('config/animations');
let skins = require('config/skins');
let factions = require('config/factions');
let classes = require('config/spirits');
let spellsConfig = require('config/spellsConfig');
let spells = require('config/spells');
let itemTypes = require('items/config/types');
let sheets = require('security/sheets');

let onCpnsReady = function () {
	factions.init();
	skins.init();
	mtx.init();
	animations.init();
	classes.init();
	spellsConfig.init();
	spells.init();
	itemTypes.init();
	sheets.init();

	process.send({
		method: 'onReady'
	});
};

let onModsReady = function () {
	components.init(onCpnsReady);
};

let onDbReady = function () {
	global.extend = extend;
	global._ = helpers;
	global.instancer = instancer;
	require('../misc/random');

	mods.init(onModsReady);

	setInterval(function () {
		global.gc();
	}, 60000);

	process.on('uncaughtException', function (e) {
		if (e.toString().indexOf('ERR_IPC_CHANNEL_CLOSED') > -1)
			return;

		console.log('Error Logged: ' + e.toString());
		console.log(e.stack);

		io.set({
			ent: new Date(),
			field: 'error',
			value: e.toString() + ' | ' + e.stack.toString(),
			callback: function () {
				process.send({
					event: 'onCrashed'
				});
			}
		});
	});
};

io.init(onDbReady);

process.on('message', m => {
	if (m.module) {
		let instances = instancer.instances;
		let iLen = instances.length;
		for (let i = 0; i < iLen; i++) {
			let objects = instances[i].objects.objects;
			let oLen = objects.length;
			let found = false;
			for (let j = 0; j < oLen; j++) {
				let object = objects[j];

				if (object.name === m.args[0]) {
					let mod = object.instance[m.module];
					mod[m.method].apply(mod, m.args);

					found = true;
					break;
				}
			}
			if (found)
				break;
		}
	} else if (m.method)
		instancer[m.method](m.args);
});
