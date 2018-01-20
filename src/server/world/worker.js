var requirejs = require('requirejs');

requirejs.config({
	baseUrl: '',
	nodeRequire: require
});

global.io = true;
var instancer = null;

requirejs([
	'extend',
	'misc/helpers',
	'components/components',
	'world/instancer',
	'security/io',
	'misc/mods',
	'mtx/mtx',
	'config/animations',
	'config/skins',
	'config/factions',
	'config/classes',
	'config/spellsConfig',
	'config/spells',
	'items/config/types'
], function (
	extend,
	helpers,
	components,
	_instancer,
	io,
	mods,
	mtx,
	animations,
	skins,
	factions,
	classes,
	spellsConfig,
	spells,
	itemTypes
) {
	var onDbReady = function () {
		var oldExtend = extend;
		global.extend = function () {
			try {
				oldExtend.apply(null, arguments);
				return arguments[1];
			} catch (e) {
				console.log(arguments);
				throw e;
			}
		};

		global._ = helpers;
		global.instancer = _instancer;
		require('../misc/random');

		instancer = _instancer;

		components.init(onCpnsReady);

		setInterval(function () {
			global.gc();
		}, 60000);

		process.on('uncaughtException', function (e) {
			if (e.toString().indexOf('ERR_IPC_CHANNEL_CLOSED') > -1)
				return;

			console.log('Error Logged: ' + e.toString());

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

	var onCpnsReady = function () {
		mods.init(onModsReady);
	};

	var onModsReady = function () {
		factions.init();
		skins.init();
		mtx.init();
		animations.init();
		classes.init();
		spellsConfig.init();
		spells.init();
		itemTypes.init();

		process.send({
			method: 'onReady'
		});
	};

	io.init(onDbReady);
});

process.on('message', (m) => {
	if (m.module) {
		var instances = instancer.instances;
		var iLen = instances.length;
		for (var i = 0; i < iLen; i++) {
			var objects = instances[i].objects.objects;
			var oLen = objects.length;
			var found = false;
			for (var j = 0; j < oLen; j++) {
				var object = objects[j];

				if (object.name == m.args[0]) {
					var module = object.instance[m.module];
					module[m.method].apply(module, m.args);

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
