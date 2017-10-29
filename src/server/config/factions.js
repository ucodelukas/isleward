define([
	'misc/events'
], function(
	events
) {
	return {
		mappings: {

		},

		init: function() {
			events.emit('onBeforeGetFactions', this.mappings);
		},

		getFaction: function(id) {
			var mapping = this.mappings[id];
			if (mapping)
				return require(mapping);
			else
				return require('config/factions/' + id);
		}
	};
});