const events = require('../misc/events');
const tos = require('./tos');

const config = {
	logoPath: null,
	resourceList: [],
	uiList: [],
	contextMenuActions: {
		player: [],
		npc: []
	},
	tos
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetClientConfig', config);

		//Deprecated
		events.emit('onBeforeGetResourceList', config.resourceList);
		events.emit('onBeforeGetUiList', config.uiList);
		events.emit('onBeforeGetContextMenuActions', config.contextMenuActions);
		events.emit('onBeforeGetTermsOfService', config.tos);
	},

	getClientConfig: function (msg) {
		msg.callback(config);
	}
};
