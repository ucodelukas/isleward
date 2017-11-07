define([

], function (

) {
	return {
		init: function () {
			this.events.on('onBeforeGetResourceList', this.onBeforeGetResourceList.bind(this));
			this.events.on('onBeforeGetEventList', this.onBeforeGetEventList.bind(this));
		},

		onBeforeGetResourceList: function (list) {
			list.push(`${this.folderName}/images/mobs.png`);
		},

		onBeforeGetEventList: function (zone, list) {
			if (zone != 'tutorial')
				return;

			list.push(this.relativeFolderName + '/maps/tutorial/events/xmas.js');
		}
	};
});
