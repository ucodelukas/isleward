define([
	'items/generators/level',
	'items/generators/quality',
	'items/generators/slots',
	'items/generators/types',
	'items/generators/stats',
	'items/generators/names',
	'items/generators/worth',
	'items/generators/quantity',
	'items/generators/spellbook',
	'items/salvager'
], function(
	g1, g2, g3, g4, g5, g6, g7, g8,
	g9
) {
	var generators = [].slice.apply(arguments, [0, 7]);
	var materialGenerators = [g6, g8];
	var spellGenerators = [g1, g9];

	var generator = {
		spellChance: 0.075,
		generate: function(blueprint) {
			var hadBlueprint = !!blueprint;
			blueprint = blueprint || {};

			var item = {};

			if ((!blueprint.slot) && (!blueprint.noSpell)) {
				var isSpell = blueprint.spell;
				if ((!isSpell) && ((!hadBlueprint) || ((!blueprint.type) && (!blueprint.slot) && (!blueprint.stats))))
					isSpell = Math.random() < this.spellChance;
			}

			if (blueprint.isSpell)
				isSpell = true;

			if (isSpell)
				spellGenerators.forEach(g => g.generate(item, blueprint));
			else if (blueprint.material) {
				item.material = true;
				item.sprite = blueprint.sprite;
				item.noDrop = blueprint.noDrop;
				item.noSalvage = blueprint.noSalvage;
				item.noDestroy = blueprint.noDestroy;
				materialGenerators.forEach(g => g.generate(item, blueprint));
			} else if (blueprint.type == 'mtx') {
				item = extend(true, {}, blueprint);
				delete item.chance;
			} else {
				generators.forEach(g => g.generate(item, blueprint));
				if (blueprint.spellName)
					g8.generate(item, blueprint);
			}

			if (blueprint.noSalvage)
				item.noSalvage = true;

			return item;
		},

		removeStat: function(item, stat) {
			if (!stat) {
				stat = Object.keys(item.stats)
					.filter(s => (s != 'armor'));

				stat = stat[~~(Math.random() * stat.length)];
			}

			delete item.stats[stat];
		},

		pickRandomSlot: function() {
			var item = {};
			var blueprint = {};
			g3.generate(item, blueprint);

			return item.slot;
		}
	};

	return generator;
});