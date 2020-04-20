global.extend = require('../misc/clone');
global.io = require('../db/io');
global._ = require('../misc/helpers');
global.consts = require('../config/consts');
global.instancer = require('./instancer');
global.eventManager = require('../events/events');

let components = require('../components/components');
let mods = require('../misc/mods');
let mtx = require('../mtx/mtx');
let animations = require('../config/animations');
let skins = require('../config/skins');
let factions = require('../config/factions');
let classes = require('../config/spirits');
let spellsConfig = require('../config/spellsConfig');
let spells = require('../config/spells');
let mapList = require('../config/maps/mapList');
let sheets = require('../security/sheets');
let itemEffects = require('../items/itemEffects');

const itemTypes = require('../items/config/types');
const itemPrefixes = require('../items/config/prefixes');
const itemSuffixes = require('../items/config/suffixes');

let onCpnsReady = function () {
	factions.init();
	skins.init();
	mtx.init();
	animations.init();
	classes.init();
	spellsConfig.init();
	spells.init();

	itemTypes.init();
	itemPrefixes.init();
	itemSuffixes.init();

	mapList.init();
	sheets.init();
	itemEffects.init();

	process.send({
		method: 'onReady'
	});
};

let onModsReady = function () {
	components.init(onCpnsReady);
};

const onCrash = async e => {
	if (e.toString().indexOf('ERR_IPC_CHANNEL_CLOSED') > -1)
		return;

	_.log('Error Logged: ' + e.toString());
	_.log(e.stack);

	await io.setAsync({
		key: new Date(),
		table: 'error',
		value: e.toString() + ' | ' + e.stack.toString()
	});

	process.send({
		event: 'onCrashed'
	});
};

let onDbReady = function () {
	require('../misc/random');

	mods.init(onModsReady);

	process.on('uncaughtException', onCrash);
	process.on('unhandledRejection', onCrash);
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
	} else if (m.threadModule)
		global[m.threadModule][m.method](m.data);
	else if (m.method)
		instancer[m.method](m.args);
});
