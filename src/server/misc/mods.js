const fileLister = require('../misc/fileLister');
const events = require('../misc/events');

module.exports = {
	init: function () {
		const modList = fileLister.getFolderList('mods');

		modList.forEach(m => {
			const mod = require('../mods/' + m + '/index');
			this.onGetMod(m, mod);
		});
	},

	onGetMod: function (name, mod) {
		if (mod.disabled)
			return;

		const isMapThread = !!process.send;
		mod.isMapThread = isMapThread;

		mod.events = events;
		mod.folderName = 'server/mods/' + name;
		mod.relativeFolderName = 'mods/' + name;

		let list = (mod.extraScripts || []);
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let extra = require('../mods/' + name + '/' + list[i]);
			this.onGetExtra(name, mod, extra);
		}

		if (isMapThread && typeof mod.initMap === 'function')
			mod.initMap();
		else if (!isMapThread && typeof mod.initMain === 'function')
			mod.initMain();

		if (typeof mod.init === 'function')
			mod.init();
	},

	onGetExtra: function (name, mod, extra) {
		extra.folderName = 'server/mods/' + name;
	}
};
