let fileLister = require('../misc/fileLister');
let events = require('../misc/events');
let util = require('util');

let cbDone = null;

module.exports = {
	waiting: {},

	init: function (_cbDone) {
		cbDone = _cbDone;
		let modList = fileLister.getFolderList('mods');

		modList.forEach(function (m) {
			this.waiting[m] = 0;
			let mod = require('../mods/' + m + '/index');
			this.onGetMod(m, mod);
		}, this);
	},

	onGetMod: function (name, mod) {
		mod.events = events;
		mod.folderName = 'server/mods/' + name;
		mod.relativeFolderName = 'mods/' + name;

		let list = (mod.extraScripts || []);
		let lLen = list.length;
		this.waiting[name] = lLen;

		for (let i = 0; i < lLen; i++) {
			let extra = require('../mods/' + name + '/' + list[i]);
			this.onGetExtra.bind(name, mod, extra);
		}

		if (this.waiting[name] == 0) {
			mod.init();
			delete this.waiting[name];

			if (Object.keys(this.waiting).length == 0)
				cbDone();
		}
	},

	onGetExtra: function (name, mod, extra) {
		extra.folderName = 'server/mods/' + name;

		this.waiting[name]--;
		if (this.waiting[name] == 0) {
			mod.init();
			delete this.waiting[name];

			if (Object.keys(this.waiting).length == 0)
				cbDone();
		}
	}
};
