define([
	'items/config/prefixes',
	'items/config/suffixes'
], function(
	prefixes,
	suffixes
) {
	return {
		generators: [
			'basic', ['basic'],
			['gPrefix', 'gSuffix'],
			['gPrefix', 'gSuffix'],
			['gPrefix', 'gSuffix']
		],
		prefixes: {
			hpMax: 'Healthy',
			regenHp: 'Regenerating',
			manaMax: `Caster's`,
			regenMana: 'Tapping',
			str: 'Brutal',
			int: 'Wise',
			dex: 'Agile',
			addArmor: 'Plated',
			addCritChance: 'Precise',
			addCritMultiplier: 'Piercing',
			magicFind: `Seeker's`,
			sprintChance: `Traveler's`,
			dmgPercent: 'Powerful',
			allAttributes: 'Hybrid',
			elementArcanePercent: 'Volatile',
			elementFrostPercent: 'Frigid',
			elementFirePercent: 'Burning',
			elementHolyPercent: 'Righteous',
			elementPhysicalPercent: `Brawler's`,
			elementPoisonPercent: 'Bubbling',

			elementArcaneResist: 'Protective',
			elementFrostResist: 'Protective',
			elementFireResist: 'Protective',
			elementHolyResist: 'Protective',
			elementPhysicalResist: `Protective`,
			elementPoisonResist: 'Protective',
			elementAllResist: 'Protective',

			xpIncrease: `Scholar's`,
			lvlRequire: 'Elementary'
		},
		suffixes: {
			hpMax: 'Health',
			regenHp: 'Regeneration',
			manaMax: 'Mana',
			regenMana: 'Orbs',
			str: 'the Titan',
			int: 'Angels',
			dex: 'the Assassin',
			addArmor: 'the Fortress',
			addCritChance: 'Pain',
			addCritMultiplier: 'Ferocity',
			magicFind: 'Luck',
			sprintChance: 'Haste',
			dmgPercent: 'Power',
			allAttributes: 'Divergence',
			elementArcanePercent: 'the Magi',
			elementFrostPercent: 'Winter',
			elementFirePercent: 'the Inferno',
			elementHolyPercent: 'the Gods',
			elementPhysicalPercent: 'Combat',
			elementPoisonPercent: 'Poison',

			elementArcaneResist: 'Arcane Resistance',
			elementFrostResist: 'Frost Resistance',
			elementFireResist: 'Fire Resistance',
			elementHolyResist: 'Holy Resistance',
			elementPhysicalResist: `Physical Resistance`,
			elementPoisonResist: 'Poison Resistance',
			elementAllResist: 'Arcane Resistance',

			xpIncrease: 'Experience',
			lvlRequire: 'Ease'
		},
		generate: function(item, blueprint) {
			if (blueprint.name) {
				item.name = blueprint.name;
				return;
			} else if (blueprint.noName) {
				item.name = item.type;
				return;
			}

			var gen = this.generators[item.quality];
			if (!(gen instanceof Array))
				gen = [gen];

			gen.forEach(g => this.types[g].call(this, item, blueprint));
		},
		types: {
			basic: function(item, blueprint) {
				item.name = item.type;
			},
			prefix: function(item, blueprint) {
				var maxStat = '';
				var maxValue = 0;
				for (var s in item.stats) {
					if ((item.stats[s] > maxValue) && (this.prefixes[s])) {
						maxValue = item.stats[s];
						maxStat = s;
					}
				}

				item.name = this.prefixes[maxStat] + ' ' + item.name;
			},
			suffix: function(item, blueprint) {
				var stats = [];
				for (var s in item.stats) {
					if (this.suffixes[s])
						stats.push({
							stat: s,
							value: item.stats[s]
						});
				}
				stats.sort((a, b) => b.value - a.value);

				var useIndex = 1;
				if (useIndex >= stats.length)
					useIndex = 0;

				item.name = item.name + ' of ' + this.suffixes[stats[useIndex].stat];
			},
			gPrefix: function(item, blueprint) {
				var list = prefixes.generic.concat(prefixes.slots[item.slot] || []);

				if (item.stats.armor)
					list = list.concat(prefixes.armor);
				else if (item.slot == 'twoHanded')
					list = list.concat(prefixes.weapons);

				var pick = list[~~(Math.random() * list.length)];
				item.name = pick[0].toUpperCase() + pick.substr(1);

				if (item.name.indexOf('%') > -1) {
					var replacer = (Math.random() < 0.5) ? `'s` : '';
					item.name = item.name.split('%').join(replacer);
				}
			},
			gSuffix: function(item, blueprint) {
				var list = null;

				if (item.slot == 'tool') {
					list = suffixes.slots.tool;
				} else {
					list = suffixes.generic.concat(suffixes.slots[item.slot] || []);

					if (item.stats.armor)
						list = list.concat(suffixes.armor);
					else if (item.slot == 'twoHanded')
						list = list.concat(suffixes.weapons);
				}

				var pick = list[~~(Math.random() * list.length)];
				item.name += ' ' + pick[0].toUpperCase() + pick.substr(1);
			}
		}
	};
});