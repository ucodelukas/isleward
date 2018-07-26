let generatorStats = require('./stats');

module.exports = {
	minSlotPerfection: 0.1,
	maxSlotPerfection: 1,
	minLevelMult: 0.3,
	maxLevelMult: 1,

	generate: function (item, blueprint) {
		if (!blueprint.attrRequire)
			return;

		if (!item.requires)
			item.requires = [];

		let tempItem = {
			quality: 0,
			level: item.level,
			stats: {}
		};

		let perfection = ~~(11 * (this.minSlotPerfection + (Math.random() * (this.maxSlotPerfection - this.minSlotPerfection))));

		generatorStats.generate(tempItem, {
			forceStats: [blueprint.attrRequire],
			perfection: perfection
		});

		let statValue = tempItem.stats[Object.keys(tempItem.stats)[0]];
		statValue += ~~(item.level * (this.minLevelMult + ~~(Math.random() * (this.maxLevelMult - this.minLevelMult))));
		statValue = Math.ceil(((item.level - 1) / 20) * statValue);
		if (statValue <= 0) {
			item.requires = null;
			return;
		}

		item.requires.push({
			stat: blueprint.attrRequire,
			value: statValue
		});
	}
};
