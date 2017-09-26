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
		init: function() {
			var modList = fileLister.getFolderList('mods');

			modList.forEach(function(m) {
				require(['mods/' + m + '/index'], this.onGetMod.bind(this, m));
			}, this);
		},

		onGetMod: function(name, mod) {
			mod.events = events;
			mod.folderName = 'server/mods/' + m;
			mod.relativeFolderName = 'mods/' + m;

			var list = mod.extraScripts;
			if (list) {
				var lLen = list.length
				for (var i = 0; i < lLen; i++) {
					var script = util.promisify(require)(['mods/' + name + '/' + list[i]]);
					script.folderName = mod.folderName;
					script.relativeFolderName = mod.relativeFolderName;
				}
			}
			console.log(111);

			mod.init();
		}
	};
});