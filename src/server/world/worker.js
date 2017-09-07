var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '',
    nodeRequire: require
});

global.io = true;
var instancer = null;

requirejs([
	'extend', 'misc/helpers', 'components/components', 'world/instancer', 'security/io', 'misc/mods', 'misc/mail'
], function(
	extend, helpers, components, _instancer, io, mods, mail
) {
	var onDbReady = function() {
		global.extend = extend;
		global._ = helpers;
		global.mail = mail;
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
		var module = global[m.module];
		module[m.method].apply(module, m.args);
	} else if (m.method)
		instancer[m.method](m.args);
});