define([
	'./statsFishingRod'
], function (
	statsFishingRod
) {
	return {
		generators: {
			dmgPercent: function (item, level, blueprint, perfection, calcPerfection) {
				var max = (level / 2);

				if (calcPerfection)
					return (calcPerfection / max);
				else if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.dmgPercent || 1);
				else
					return max * perfection * (blueprint.statMult.dmgPercent || 1);
			},

			elementDmgPercent: function (item, level, blueprint, perfection, calcPerfection) {
				var max = (level / 6.7);

				if (calcPerfection)
					return (calcPerfection / max);
				else if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.elementDmgPercent || 1);
				else
					return max * perfection * (blueprint.statMult.elementDmgPercent || 1);
			},

			addCritMultiplier: function (item, level, blueprint, perfection, calcPerfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				var max = (level * 15) * div;

				if (calcPerfection)
					return (calcPerfection / max);
				else if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.addCritMultiplier || 1);
				else
					return max * perfection * (blueprint.statMult.addCritMultiplier || 1);
			},

			addCritChance: function (item, level, blueprint, perfection, calcPerfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				var max = (level - 3) * 50 * div;

				if (calcPerfection)
					return (calcPerfection / max);
				else if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.addCritChance || 1);
				else
					return max * perfection * (blueprint.statMult.addCritChance || 1);
			},

			vit: function (item, level, blueprint, perfection, calcPerfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				var max = ((-0.6340155 + (13.68923 * level) - (0.34383 * Math.pow(level, 2)) + (0.06754871 * Math.pow(level, 3)) + (0.000174046 * Math.pow(level, 4)) + (0.000007675887 * Math.pow(level, 5))) / 10) * div;

				if (calcPerfection)
					return (calcPerfection / max);
				else if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.vit || 1);
				else
					return max * perfection * (blueprint.statMult.vit || 1);
			},

			mainStat: function (item, level, blueprint, perfection, calcPerfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				var min = (level / 15) * div;
				var max = (level * 5) * div;

				if (calcPerfection)
					return ((calcPerfection - min) / (max - min));
				else if (perfection == null)
					return random.norm(min, max) * (blueprint.statMult.mainStat || 1);
				else
					return (min + ((max - min) * perfection)) * (blueprint.statMult.mainStat || 1);
			},
			armor: function (item, level, blueprint, perfection, calcPerfection) {
				var min = (level * 20);
				var max = (level * 50);

				if (calcPerfection)
					return ((calcPerfection - min) / (max - min));
				else if (perfection == null)
					return random.norm(min, max) * blueprint.statMult.armor;
				else
					return (min + ((max - min) * perfection)) * (blueprint.statMult.armor || 1);
			},
			elementResist: function (item, level, blueprint, perfection, calcPerfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				if (calcPerfection)
					return (calcPerfection / 100);
				else if (perfection == null)
					return random.norm(1, 100) * (blueprint.statMult.elementResist || 1) * div;
				else
					return (1 + (99 * perfection)) * (blueprint.statMult.elementResist || 1) * div;
			},
			regenHp: function (item, level, blueprint, perfection, calcPerfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				var max = (-0.05426729 + (3.477385 * level) - (0.03890282 * Math.pow(level, 2)) + (0.009244822 * Math.pow(level, 3)) + (0.0001700915 * Math.pow(level, 4)) - (0.00000138085 * Math.pow(level, 5))) * div;

				if (calcPerfection)
					return (calcPerfection / max);
				else if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.regenHp || 1);
				else
					return max * perfection * (blueprint.statMult.regenHp || 1);
			},
			lvlRequire: function (item, level, blueprint, perfection, calcPerfection) {
				var max = ~~(level / 2);

				if (calcPerfection)
					return (calcPerfection / max);
				else if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.lvlRequire || 1);
				else
					return max * perfection * (blueprint.statMult.lvlRequire || 1);
			}
		},

		stats: {
			vit: {
				generator: 'vit'
			},
			regenHp: {
				generator: 'regenHp'
			},

			manaMax: {
				min: 1,
				max: 8
			},

			regenMana: {
				min: 1,
				max: 5
			},

			lvlRequire: {
				level: {
					min: 5
				},
				generator: 'lvlRequire'
			},

			str: {
				generator: 'mainStat'
			},
			int: {
				generator: 'mainStat'
			},
			dex: {
				generator: 'mainStat'
			},

			elementAllResist: {
				level: {
					min: 25
				},
				generator: 'elementResist'
			},
			elementArcaneResist: {
				level: {
					min: 15
				},
				generator: 'elementResist'
			},
			elementFrostResist: {
				level: {
					min: 15
				},
				generator: 'elementResist'
			},
			elementFireResist: {
				level: {
					min: 15
				},
				generator: 'elementResist'
			},
			elementHolyResist: {
				level: {
					min: 15
				},
				generator: 'elementResist'
			},
			elementPoisonResist: {
				level: {
					min: 15
				},
				generator: 'elementResist'
			},
			elementAllResist: {
				level: {
					min: 15
				},
				generator: 'elementResist'
			},

			dmgPercent: {
				ignore: true,
				generator: 'dmgPercent'
			},
			elementArcanePercent: {
				level: {
					min: 10
				},
				ignore: true,
				generator: 'elementDmgPercent'
			},
			elementFrostPercent: {
				level: {
					min: 10
				},
				ignore: true,
				generator: 'elementDmgPercent'
			},
			elementFirePercent: {
				level: {
					min: 10
				},
				ignore: true,
				generator: 'elementDmgPercent'
			},
			elementHolyPercent: {
				level: {
					min: 10
				},
				ignore: true,
				generator: 'elementDmgPercent'
			},
			elementPoisonPercent: {
				level: {
					min: 10
				},
				ignore: true,
				generator: 'elementDmgPercent'
			},
			allAttributes: {
				generator: 'mainStat',
				ignore: true
			},

			attackSpeed: {
				min: 1,
				max: 8.75,
				ignore: true
			},

			castSpeed: {
				min: 1,
				max: 8.75,
				ignore: true
			},

			armor: {
				generator: 'armor',
				ignore: true
			},

			blockAttackChance: {
				min: 1,
				max: 10,
				ignore: true
			},

			blockSpellChance: {
				min: 1,
				max: 10,
				ignore: true
			},

			addCritChance: {
				generator: 'addCritChance',
				level: {
					min: 7
				}
			},
			addCritMultiplier: {
				generator: 'addCritMultiplier',
				level: {
					min: 12
				}
			},

			magicFind: {
				min: 1,
				max: 15
			},

			itemQuantity: {
				min: 2,
				max: 27
			},

			xpIncrease: {
				min: 1,
				max: 6
			},

			sprintChance: {
				min: 1,
				max: 20,
				ignore: true
			}
		},

		slots: {
			feet: {
				sprintChance: {
					min: 1,
					max: 20
				}
			},

			offHand: {

			},

			trinket: {
				attackSpeed: {
					min: 1,
					max: 8.75,
				},
				castSpeed: {
					min: 1,
					max: 8.75,
				}
			},

			finger: {
				elementArcanePercent: {
					generator: 'elementDmgPercent'
				},
				elementFrostPercent: {
					generator: 'elementDmgPercent'
				},
				elementFirePercent: {
					generator: 'elementDmgPercent'
				},
				elementHolyPercent: {
					generator: 'elementDmgPercent'
				},
				elementPoisonPercent: {
					generator: 'elementDmgPercent'
				},
				allAttributes: {
					generator: 'mainStat'
				},
				attackSpeed: {
					min: 1,
					max: 8.75
				},
				castSpeed: {
					min: 1,
					max: 8.75
				}
			},

			neck: {
				dmgPercent: {
					generator: 'dmgPercent'
				},
				elementArcanePercent: {
					generator: 'elementDmgPercent'
				},
				elementFrostPercent: {
					generator: 'elementDmgPercent'
				},
				elementFirePercent: {
					generator: 'elementDmgPercent'
				},
				elementHolyPercent: {
					generator: 'elementDmgPercent'
				},
				elementPoisonPercent: {
					generator: 'elementDmgPercent'
				},
				allAttributes: {
					generator: 'mainStat'
				},
				attackSpeed: {
					min: 1,
					max: 8.75
				},
				castSpeed: {
					min: 1,
					max: 8.75
				}
			}
		},

		generate: function (item, blueprint, result) {
			if (item.slot == 'tool') {
				statsFishingRod.generate(item, blueprint, result);
				return;
			}

			if (!blueprint.statCount)
				item.stats = {};

			if (blueprint.noStats)
				return;

			//If we enchant something we don't add armor
			if (!blueprint.statMult)
				blueprint.statMult = {};
			for (var s in blueprint.statMult) {
				if (blueprint.statMult[s] > 0)
					this.buildStat(item, blueprint, s);
			}

			var statCount = blueprint.statCount || (item.quality + 1);

			if (blueprint.forceStats) {
				for (var i = 0; i < Math.min(statCount, blueprint.forceStats.length); i++) {
					var choice = blueprint.forceStats[i];
					this.buildStat(item, blueprint, choice, result);
					statCount--;
				}
			}

			if (blueprint.stats) {
				var useStats = extend(true, [], blueprint.stats);
				var addStats = Math.min(statCount, blueprint.stats.length);
				for (var i = 0; i < addStats; i++) {
					var choice = useStats[~~(Math.random() * useStats.length)];
					useStats.spliceFirstWhere(s => s == choice);
					this.buildStat(item, blueprint, choice, result);
					statCount--;
				}
			}

			for (var i = 0; i < statCount; i++) {
				this.buildStat(item, blueprint, null, result);
			}

			for (var s in item.stats) {
				item.stats[s] = Math.ceil(item.stats[s]);
				if (item.stats[s] == 0)
					delete item.stats[s];
			}
		},

		buildStat: function (item, blueprint, stat, result) {
			var slotStats = this.slots[item.slot] || {};
			var statOptions = extend(true, {}, this.stats, slotStats || {});

			for (var p in statOptions) {
				if ((!slotStats[p]) || (slotStats[p].ignore))
					continue;

				delete statOptions[p].ignore;
			}

			var statBlueprint = null;

			var value = null;
			if ((stat) && (stat.indexOf('|') > -1)) {
				var split = stat.split('|');
				stat = split[0];
				value = split[1];
			}

			if ((!stat) || (!statOptions[stat])) {
				var options = Object.keys(statOptions).filter(function (s) {
					var o = statOptions[s];
					if (o.ignore)
						return false;
					else if ((o.level) && (o.level.min) && (item.level < o.level.min))
						return false;
					else
						return true;
				});

				stat = options[~~(Math.random() * options.length)];
				statBlueprint = statOptions[stat];
			} else
				statBlueprint = statOptions[stat];

			if (!value) {
				if (statBlueprint.generator) {
					var level = item.originalLevel || item.level;
					value = Math.ceil(this.generators[statBlueprint.generator](item, level, blueprint, blueprint.perfection));
				} else if (!blueprint.perfection)
					value = Math.ceil(random.norm(statBlueprint.min, statBlueprint.max));
				else
					value = statBlueprint.min + ((statBlueprint.max - statBlueprint.min) * blueprint.perfection);
			}

			if ((result) && (result.addStatMsgs)) {
				result.addStatMsgs.push({
					stat: stat,
					value: value
				});

				if (!item.enchantedStats)
					item.enchantedStats = {};
				if (item.enchantedStats[stat])
					item.enchantedStats[stat] += value;
				else
					item.enchantedStats[stat] = value;
			}

			if (stat == 'lvlRequire') {
				if (!item.originalLevel)
					item.originalLevel = item.level;

				item.level -= value;
				if (item.level < 1)
					item.level = 1;
			}

			if (item.stats[stat])
				value += item.stats[stat];

			item.stats[stat] = value;
		},

		rescale: function (item, level) {
			var stats = item.stats;
			var nStats = extend(true, {}, stats);
			var bpt = {
				statMult: {}
			};

			for (var p in stats) {
				var generator = this.stats[p].generator;
				if (!generator)
					continue;
				else if (['lvlRequire'].indexOf(p) > -1)
					continue;

				generator = this.generators[generator];

				var perfection = generator(item, item.originalLevel || item.level, bpt, null, stats[p]);
				nStats[p] = Math.ceil(generator(item, level, bpt, perfection));
			}

			return nStats;
		}
	};
});
