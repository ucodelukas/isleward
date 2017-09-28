var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '',
    nodeRequire: require
});

global.io = true;
var instancer = null;

requirejs([
	'extend', 'misc/helpers', 'components/components', 'world/instancer', 'security/io', 'misc/mods', 'mtx/mtx'
], function(
	extend, helpers, components, _instancer, io, mods, mtx
) {
	var onDbReady = function() {
		global.extend = extend;
		global._ = helpers;
		require('../misc/random');
		
		instancer = _instancer;

		components.init(onCpnsReady);

		setInterval(function() {
			global.gc();
		}, 60000);
	};

	var onCpnsReady = function() {
		mods.init(onModsReady);
	};

	var onModsReady = function() {
		mtx.init();
		process.send({
			method: 'onReady'
		});
	};

	io.init(onDbReady);
});

process.on('message', (m) => {
	if (m.method) {
		instancer[m.method](m.args);
	}
});