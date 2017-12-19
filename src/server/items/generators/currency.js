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
			var pick = chances[~~(Math.random() * chances.length)];
			item.name = pick;

			extend(true, item, configCurrencies.currencies[pick]);
		}
	};

	return generator;
});
