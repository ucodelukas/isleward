define([

], function (

) {
	return {
		init: function () {
			this.events.on('onBeforeGetResourceList', this.onBeforeGetResourceList.bind(this));
			this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
		},

		onBeforeGetResourceList: function (list) {
			list.push(`${this.folderName}/images/mobs.png`);
		},

		onAfterGetZone: function (zone, config) {
			try {
				var modZone = require(this.relativeFolderName + '/maps/' + zone + '/zone.js');
				extend(true, config, modZone);
			} catch (e) {}
		}
	};
});
