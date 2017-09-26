define([
	'misc/fileLister',
	'misc/events',
	'util'
], function(
	fileLister,
	events,
	util
) {
	return {
		waiting: {},

		init: function() {
			var modList = fileLister.getFolderList('mods');

			modList.forEach(function(m) {
				require(['mods/' + m + '/index'], this.onGetMod.bind(this, m));
			}, this);
		},

		onGetMod: function(name, mod) {
			mod.events = events;
			mod.folderName = 'server/mods/' + name;
			mod.relativeFolderName = 'mods/' + name;

			var list = (mod.extraScripts || []);
			var lLen = list.length;
			this.waiting[name] = lLen;

			for (var i = 0; i < lLen; i++) {
				require(['mods/' + name + '/' + list[i]], this.onGetExtra.bind(this, name, mod));;
			}

			if (this.waiting[name] == 0)
				mod.init();
		},

		onGetExtra: function(name, mod) {
			this.waiting[name]--;
			if (this.waiting[name] == 0)
				mod.init();
		}
	};
});