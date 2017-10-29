define([
	'js/system/events'
], function(
	events
) {
	return {
		type: 'social',

		customChannels: null,

		init: function() {
			events.emit('onGetCustomChatChannels', this.customChannels);
		}
	};
});