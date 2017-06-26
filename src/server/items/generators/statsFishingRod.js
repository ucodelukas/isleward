define([

], function(

) {
	return {
		generators: {
			catchChance: function(item, blueprint) {
				return random.expNorm(0, 70);
			},

			catchSpeed: function(item, blueprint) {
				return random.expNorm(0, 150);
			},

			fishRarity: function(item, blueprint) {
				return random.expNorm(0, 100);
			},

			fishWeight: function(item, blueprint) {
				return random.expNorm(0, 75);
			}
		},

		generate: function(item, blueprint) {
			var statCount = blueprint.statCount || (item.quality + 1);
			var stats = Object.keys(this.generators);

			if (!item.stats)
				item.stats = {};

			for (var i = 0; i < statCount; i++) {
				var stat = stats[~~(Math.random() * stats.length)];

				var value = Math.ceil(this.generators[stat].call(this, item, blueprint));

				if (!item.stats[stat])
					item.stats[stat] = 0;

				item.stats[stat] += value;
			}
		}
	};
});