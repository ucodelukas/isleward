define([
	'items/generators/stats',
	'items/generators/slots',
	'items/generators/types',
	'items/salvager',
	'items/config/currencies',
	'items/config/slots',
	'items/generator'
], function (
	generatorStats,
	generatorSlots,
	generatorTypes,
	salvager,
	configCurrencies,
	configSlots,
	generator
) {
	return {
		enchant: function (obj, item, msg) {
			var inventory = obj.inventory;
			var config = this.getEnchantMaterials(item, msg.action);

			var success = true;
			config.materials.forEach(function (m) {
				var hasMaterial = inventory.items.find(i => i.name == m.name);
				if (hasMaterial)
					hasMaterial = hasMaterial.quantity >= m.quantity;
				if (!hasMaterial)
					success = false;
			});

			if (!success) {
				inventory.resolveCallback(msg);
				return;
			}

			var result = {
				item: item,
				addStatMsgs: []
			};
			result.success = (Math.random() * 100) < config.successChance;

			config.materials.forEach(function (m) {
				var invMaterial = inventory.items.find(i => i.name == m.name);
				inventory.destroyItem(invMaterial.id, m.quantity);
			});

			if (msg.action == 'reroll') {
				delete msg.addStatMsgs;
				delete item.enchantedStats;
				if (item.stats.lvlRequire) {
					item.level += item.stats.lvlRequire;
					delete item.originalLevel;
				}

				delete item.power;

				item.stats = {};
				var bpt = {
					slot: item.slot,
					type: item.type,
					sprite: item.sprite,
					spritesheet: item.spritesheet
				};
				generatorSlots.generate(item, bpt);
				generatorTypes.generate(item, bpt);
				generatorStats.generate(item, bpt);
			} else if (msg.action == 'relevel') {
				var offset = ((~~(Math.random() * 2) * 2) - 1) * (1 + ~~(Math.random() * 2));
				if (item.level == 1)
					offset = Math.abs(offset);
				item.level = Math.max(1, item.level + offset);
			} else if (msg.action == 'reslot') {
				var newItem = generator.generate({
					slot: configSlots.getRandomSlot(item.slot),
					level: item.level,
					quality: item.quality,
					stats: Object.keys(item.stats)
				});

				delete item.stats;
				delete item.spell;

				extend(true, item, newItem);
			} else {
				var newPower = (item.power || 0) + 1;
				item.power = newPower;

				if ((result.success) && (msg.action != 'scour'))
					this.addStat(item, result);
				else if (item.enchantedStats) {
					for (var p in item.enchantedStats) {
						var value = item.enchantedStats[p];

						if (item.stats[p]) {
							result.addStatMsgs.push({
								stat: p,
								value: -value
							});
							item.stats[p] -= value;
							if (item.stats[p] <= 0)
								delete item.stats[p];

							if (p == 'lvlRequire') {
								item.level += value;
								delete item.originalLevel;
							}
						}
					}

					delete item.enchantedStats;
					delete item.power;
				}
			}

			obj.syncer.setArray(true, 'inventory', 'getItems', item);

			inventory.resolveCallback(msg, result);
		},

		addStat: function (item, result) {
			generatorStats.generate(item, {
				statCount: 1
			}, result);
		},

		getEnchantMaterials: function (item, action) {
			var result = salvager.salvage(item, true);

			var powerLevel = item.power || 0;
			powerLevel = Math.min(powerLevel, 9);
			var mult = [2, 3, 5, 8, 12, 17, 23, 30, 38, 47][powerLevel];
			if (action == 'scour')
				mult *= 0.2;

			result.forEach(r => r.quantity = Math.max(1, ~~(r.quantity * mult)));

			var successChance = [100, 60, 35, 15, 7, 3, 2, 1, 1, 1][powerLevel];
			if (action == 'scour') {
				successChance = 100;
				if (powerLevel == 0)
					result = [];
			} else if (action == 'reroll') {
				successChance = 100;
				result = [configCurrencies.currencies['Unstable Totem']];
			} else if (action == 'relevel') {
				successChance = 100;
				result = [configCurrencies.currencies['Ascendant Totem']];
			} else if (action == 'reslot') {
				successChance = 100;
				result = [configCurrencies.currencies["Gambler's Totem"]];
			}

			return {
				materials: result,
				successChance: successChance
			};
		}
	};
});
