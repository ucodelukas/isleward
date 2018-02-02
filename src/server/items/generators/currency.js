define([
	'../config/currencies'
], function (
	configCurrencies
) {
	var chances = [];
	for (var c in configCurrencies.chance) {
		var rolls = configCurrencies.chance[c];
		for (var i = 0; i < rolls; i++) {
			chances.push(c);
		}
	}

	var generator = {
		generate: function (item, blueprint) {
			var pick = null;

			if (!blueprint.name)
				pick = chances[~~(Math.random() * chances.length)];
			else
				pick = Object.keys(configCurrencies.currencies).find(c => (c.toLowerCase().indexOf(blueprint.name.toLowerCase()) > -1));

			item.name = pick;
			extend(true, item, configCurrencies.currencies[pick]);
		}
	};

	return generator;
});
