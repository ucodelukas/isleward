define([
	'./statsFishingRod'
], function (
	statsFishingRod
) {
	return {
		generators: {
			hpMax: function (item, level, blueprint, perfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				if (item.slot)
					var max = ((level * 15) + level) * div;

				if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.hpMax || 1);
				else
					return max * perfection * (blueprint.statMult.hpMax || 1);
			},
			mainStat: function (item, level, blueprint, perfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				var min = ((level * 6.05) - ((level - 1) * 1.2)) * div;
				var max = ((level * 14.9) + ((level - 1) * 31.49)) * div;

				if (perfection == null)
					return random.norm(min, max) * (blueprint.statMult.mainStat || 1);
				else
					return (min + ((max - min) * perfection)) * (blueprint.statMult.mainStat || 1);
			},
			armor: function (item, level, blueprint, perfection) {
				var min = (level * 20);
				var max = (level * 51.2);

				if (perfection == null)
					return random.norm(min, max) * blueprint.statMult.armor;
				else
					return (min + ((max - min) * perfection)) * (blueprint.statMult.armor || 1);
			},
			elementResist: function (item, level, blueprint, perfection) {
				if (perfection == null)
					return random.norm(1, 7.5) * (blueprint.statMult.elementResist || 1);
				else
					return (1 + (6.5 * perfection)) * (blueprint.statMult.elementResist || 1);
			},
			regenHp: function (item, level, blueprint, perfection) {
				var div = 1 / 11;
				if (item.slot == 'twoHanded')
					div *= 2;

				var max = (((10 + (level * 200)) / 20) / 2) * div;

				if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.regenHp || 1);
				else
					return max * perfection * (blueprint.statMult.regenHp || 1);
			},
			lvlRequire: function (item, level, blueprint, perfection) {
				var max = ~~(level / 2);

				if (perfection == null)
					return random.norm(1, max) * (blueprint.statMult.lvlRequire || 1);
				else
					return max * perfection * (blueprint.statMult.lvlRequire || 1);
			}
		},

		stats: {
			hpMax: {
				generator: 'hpMax'
			},
			regenHp: {
				generator: 'regenHp'
			},

			manaMax: {
				min: 1,
				max: 5
			},

			regenMana: {
				min: 1,
				max: 7
			},

			lvlRequire: {
				level: {
					min: 2
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

			elementArcaneResist: {
				generator: 'elementResist'
			},
			elementFrostResist: {
				generator: 'elementResist'
			},
			elementFireResist: {
				generator: 'elementResist'
			},
			elementHolyResist: {
				generator: 'elementResist'
			},
			elementPhysicalResist: {
				generator: 'elementResist'
			},
			elementPoisonResist: {
				generator: 'elementResist'
			},
			elementAllResist: {
				generator: 'elementResist'
			},

			dmgPercent: {
				min: 1,
				max: 5,
				ignore: true
			},
			elementArcanePercent: {
				min: 1,
				max: 5,
				ignore: true
			},
			elementFrostPercent: {
				min: 1,
				max: 5,
				ignore: true
			},
			elementFirePercent: {
				min: 1,
				max: 5,
				ignore: true
			},
			elementHolyPercent: {
				min: 1,
				max: 5,
				ignore: true
			},
			elementPhysicalPercent: {
				min: 1,
				max: 5,
				ignore: true
			},
			elementPoisonPercent: {
				min: 1,
				max: 5,
				ignore: true
			},
			allAttributes: {
				generator: 'mainStat',
				ignore: true
			},

			attackSpeed: {
				min: 1,
				max: 7,
				ignore: true
			},

			castSpeed: {
				min: 1,
				max: 7,
				ignore: true
			},

			armor: {
				generator: 'armor',
				ignore: true
			},

			addCritChance: {
				min: 1,
				max: 90
			},
			addCritMultiplier: {
				min: 5,
				max: 50
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
			}
		},

		slots: {
			feet: {
				sprintChance: {
					min: 1,
					max: 20
				}
			},

			trinket: {
				attackSpeed: {
					min: 1,
					max: 7
				},
				castSpeed: {
					min: 1,
					max: 7
				}
			},

			finger: {
				dmgPercent: {
					min: 1,
					max: 5
				},
				elementArcanePercent: {
					min: 1,
					max: 5
				},
				elementFrostPercent: {
					min: 1,
					max: 5
				},
				elementFirePercent: {
					min: 1,
					max: 5
				},
				elementHolyPercent: {
					min: 1,
					max: 5
				},
				elementPhysicalPercent: {
					min: 1,
					max: 5
				},
				elementPoisonPercent: {
					min: 1,
					max: 5
				},
				allAttributes: {
					generator: 'mainStat'
				},
				attackSpeed: {
					min: 1,
					max: 7
				},
				castSpeed: {
					min: 1,
					max: 7
				}
			},

			neck: {
				dmgPercent: {
					min: 1,
					max: 10
				},
				elementArcanePercent: {
					min: 1,
					max: 10
				},
				elementFrostPercent: {
					min: 1,
					max: 10
				},
				elementFirePercent: {
					min: 1,
					max: 10
				},
				elementHolyPercent: {
					min: 1,
					max: 10
				},
				elementPhysicalPercent: {
					min: 1,
					max: 10
				},
				elementPoisonPercent: {
					min: 1,
					max: 10
				},
				allAttributes: {
					generator: 'mainStat'
				},
				attackSpeed: {
					min: 1,
					max: 7
				},
				castSpeed: {
					min: 1,
					max: 7
				}
			}
		},
		mainStatChance: 0.7,

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
			if (blueprint.statMult.armor)
				this.buildStat(item, blueprint, 'armor');

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
		}
	};
});
