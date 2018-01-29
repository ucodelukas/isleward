define([
	'items/generators/stats',
	'items/generators/slots',
	'items/generators/types',
	'items/generators/spellbook',
	'items/salvager',
	'items/config/currencies',
	'items/config/slots',
	'items/generator'
], function (
	generatorStats,
	generatorSlots,
	generatorTypes,
	generatorSpells,
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

			config.materials.forEach(function (m) {
				var invMaterial = inventory.items.find(i => i.name == m.name);
				inventory.destroyItem(invMaterial.id, m.quantity);
			});

			if (msg.action == 'reroll') {
				delete msg.addStatMsgs;
				delete item.enchantedStats;
				if ((item.stats) && (item.stats.lvlRequire)) {
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
				if (item.effects)
					return;

				var newItem = generator.generate({
					slot: configSlots.getRandomSlot(item.slot),
					level: item.level,
					quality: item.quality,
					stats: Object.keys(item.stats || {})
				});

				delete item.spritesheet;
				delete item.stats;
				delete item.spell;

				extend(true, item, newItem);
			} else if (msg.action == 'reforge') {
				if (!item.spell)
					return;

				var spellName = item.spell.name.toLowerCase();
				delete item.spell;
				generatorSpells.generate(item, {
					spellName: spellName
				});
			} else {
				var newPower = (item.power || 0) + 1;
				if (newPower > 3) {
					inventory.resolveCallback(msg);
					return;
				}

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
				statCount: 1,

			}, result);
		},

		getEnchantMaterials: function (item, action) {
			var result = null;

			var powerLevel = item.power || 0;
			powerLevel = Math.min(powerLevel, 9);
			var mult = [2, 3, 5][powerLevel];

			if (action == 'reroll')
				result = [configCurrencies.getCurrencyName('reroll')];
			else if (action == 'relevel')
				result = [configCurrencies.getCurrencyName('relevel')];
			else if (action == 'reslot')
				result = [configCurrencies.getCurrencyName[('reslot')]];
			else if (action == 'reforge')
				result = [configCurrencies.getCurrencyName('reforge')];
			else {
				result = salvager
					.salvage(item, true)
					.forEach(r => r.quantity = Math.max(1, ~~(r.quantity * mult * 10)));
			}

			return {
				materials: result
			};
		}
	};
});
