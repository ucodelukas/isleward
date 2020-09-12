const fileLister = require('../misc/fileLister');
const events = require('../misc/events');

module.exports = {
	init: async function () {
		const modList = fileLister.getFolderList('mods');

		for (const m of modList) {
			const mod = require('../mods/' + m + '/index');
			await this.onGetMod(m, mod);
		}
	},

	onGetMod: async function (name, mod) {
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

		if (typeof mod.init === 'function')
			await mod.init();

		if (isMapThread && typeof mod.initMapThread === 'function')
			await mod.initMapThread();
		else if (!isMapThread && typeof mod.initMainThread === 'function')
			await mod.initMainThread();
	},

	onGetExtra: function (name, mod, extra) {
		extra.folderName = 'server/mods/' + name;
	}
};
