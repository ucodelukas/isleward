let events = require('../../misc/events');

let config = [
	'cave',
	'estuary',
	'sewer',
	'fjolarok',
	'dungeon'
];

module.exports = {
	init: function () {
		events.emit('onBeforeGetMapList', config);
		this.mapList = config;
	}
};
