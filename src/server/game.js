let lootRoller = require('items/lootRoller');

module.exports = {
	interval: null,
	init: function () {
		this.interval = setInterval(this.update.bind(this), 1000);
	},

	update: function () {
		lootRoller.update();
	}
};
