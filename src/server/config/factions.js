let events = require('../misc/events');

module.exports = {
	mappings: {

	},

	init: function () {
		events.emit('onBeforeGetFactions', this.mappings);
	},

	getFaction: function (id) {
		let mapping = this.mappings[id];
		if (mapping)
			return require('../' + mapping);
		return require('./factions/' + id);
	}
};
