define([
	'js/system/events'
], function (
	events
) {
	return {
		type: 'social',

		customChannels: null,

		init: function () {
			if (this.customChannels)
				events.emit('onGetCustomChatChannels', this.customChannels);
		}
	};
});
