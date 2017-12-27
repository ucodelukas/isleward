define([
	'../config/slots',
	'../config/types'
], function (
	configSlots,
	configTypes
) {
	var chances = [];
	for (var c in configSlots.chance) {
		var rolls = configSlots.chance[c];
		for (var i = 0; i < rolls; i++) {
			chances.push(c);
		}
	}

	var generator = {
		generate: function (item, blueprint) {
			if (blueprint.slot)
				item.slot = blueprint.slot;
			else if (blueprint.type)
				item.slot = Object.keys(configTypes.types).find(c => configTypes.types[c][blueprint.type]);
			else
				item.slot = chances[~~(Math.random() * chances.length)];

			if (!blueprint.statMult)
				blueprint.statMult = {};
			if (!blueprint.statMult.armor)
				blueprint.statMult.armor = configSlots.armorMult[item.slot];
		}
	};

	return generator;
});
