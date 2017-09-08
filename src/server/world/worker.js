var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '',
    nodeRequire: require
});

global.io = true;
var instancer = null;

requirejs([
	'extend', 'misc/helpers', 'components/components', 'world/instancer', 'security/io', 'misc/mods', 'world/atlas'
], function(
	extend, helpers, components, _instancer, io, mods, atlas
) {
	var onDbReady = function() {
		global.extend = extend;
		global._ = helpers;
		global.atlas = atlas;
		require('../misc/random');
		
		instancer = _instancer;

		components.init(function() {
			process.send({
				method: 'onReady'
			});
		});

		mods.init();

		setInterval(function() {
			global.gc();
		}, 60000);
	};

	io.init(onDbReady);
});

process.on('message', (m) => {
	if (m.module) {
		var instances = atlas.instances;
		var iLen = instances.length;
		for (var i = 0; i < iLen; i++) {
			var objects = instances[i].objects.objects;
			var oLen = objects.length;
			var found = false;
			for (var j = 0; j < oLen; j++) {
				var object = objects[j];

				if (object.name == m.args[0]) {
					object.instance[m.method].apply(module, n.args);

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