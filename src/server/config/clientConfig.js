let events = require('../misc/events');

const config = {
	resourceList: [],
	uiList: [],
	contextMenuActions: {
		player: [],
		npc: []
	}
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetResourceList', config.resourceList);
		events.emit('onBeforeGetUiList', config.uiList);
		events.emit('onBeforeGetContextMenuActions', config.contextMenuActions);
	},

	getClientConfig: function (msg) {
		msg.callback(config);
	}
};
