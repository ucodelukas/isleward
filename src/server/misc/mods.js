let fileLister = require('../misc/fileLister');
let events = require('../misc/events');

let cbDone = null;

module.exports = {
	init: function (_cbDone) {
		cbDone = _cbDone;
		let modList = fileLister.getFolderList('mods');

		modList.forEach(function (m) {
			let mod = require('../mods/' + m + '/index');
			this.onGetMod(m, mod);
		}, this);

		cbDone();
	},

	onGetMod: function (name, mod) {
		mod.events = events;
		mod.folderName = 'server/mods/' + name;
		mod.relativeFolderName = 'mods/' + name;

		let list = (mod.extraScripts || []);
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let extra = require('../mods/' + name + '/' + list[i]);
			this.onGetExtra(name, mod, extra);
		}
	},

	onGetExtra: function (name, mod, extra) {
		extra.folderName = 'server/mods/' + name;
	}
};
