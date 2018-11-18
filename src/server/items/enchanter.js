let generatorStats = require('./generators/stats');
let generatorSlots = require('./generators/slots');
let generatorTypes = require('./generators/types');
let generatorSpells = require('./generators/spellbook');
let salvager = require('./salvager');
let configCurrencies = require('./config/currencies');
let configSlots = require('./config/slots');
let configTypes = require('./config/types');
let generator = require('./generator');

module.exports = {
	enchant: function (obj, item, msg) {
		let inventory = obj.inventory;
		let config = this.getEnchantMaterials(item, msg.action);

		let success = true;
		config.materials.forEach(function (m) {
			let hasMaterial = inventory.items.find(i => i.name === m.name);
			if (hasMaterial)
				hasMaterial = hasMaterial.quantity >= m.quantity;
			if (!hasMaterial)
				success = false;
		});

		if (!success) {
			inventory.resolveCallback(msg);
			return;
		}

		let result = {
			item: item,
			addStatMsgs: []
		};

		config.materials.forEach(function (m) {
			let invMaterial = inventory.items.find(i => i.name === m.name);
			inventory.destroyItem(invMaterial.id, m.quantity);
		});

		if (msg.action === 'reroll') {
			let enchantedStats = item.enchantedStats || {};
			delete item.enchantedStats;
			delete msg.addStatMsgs;

			if ((item.stats) && (item.stats.lvlRequire)) {
				item.level += item.stats.lvlRequire;
				delete item.originalLevel;
			}

			item.stats = {};
			let bpt = {
				slot: item.slot,
				type: item.type,
				sprite: item.sprite,
				spritesheet: item.spritesheet
			};
			generatorSlots.generate(item, bpt);
			generatorTypes.generate(item, bpt);
			generatorStats.generate(item, bpt);

			for (let p in enchantedStats) {
				if (!item.stats[p])
					item.stats[p] = 0;

				item.stats[p] += enchantedStats[p];

				if (p === 'lvlRequire') {
					item.level -= enchantedStats[p];
					if (item.level < 1)
						item.level = 1;
				}
			}
			item.enchantedStats = enchantedStats;
		} else if (msg.action === 'relevel') {
			if (item.slot === 'tool')
				return;

			let offset = 1 + ~~(Math.random() * 2);

			if (!item.originalLevel)
				item.level = Math.min(20, item.level + offset);
			else {
				offset = Math.min(20 - item.originalLevel, offset);
				item.originalLevel = Math.min(20, item.originalLevel + offset);
				item.level = Math.min(20, item.level + offset);
			}
		} else if (msg.action === 'reslot') {
			if (item.effects || item.slot === 'tool')
				return;

			if (item.originalLevel)
				item.level = item.originalLevel;

			let enchantedStats = item.enchantedStats || {};
			delete item.enchantedStats;
			delete msg.addStatMsgs;

			let possibleStats = Object.keys(item.stats || {});

			let newItem = generator.generate({
				slot: configSlots.getRandomSlot(item.slot),
				level: item.level,
				quality: item.quality,
				stats: possibleStats,
				implicitStat: (configTypes.types[item.slot][item.type] || {}).implicitStat
			});

			delete item.spritesheet;
			delete item.stats;
			delete item.spell;
			delete item.implicitStats;

			for (let p in enchantedStats) {
				if (!newItem.stats[p])
					newItem.stats[p] = 0;

				newItem.stats[p] += enchantedStats[p];

				if (p === 'lvlRequire') {
					newItem.level -= enchantedStats[p];
					if (newItem.level < 1)
						newItem.level = 1;
				}
			}
			newItem.enchantedStats = enchantedStats;

			extend(item, newItem);
		} else if (msg.action === 'reforge') {
			if (!item.spell)
				return;

			let spellName = item.spell.name.toLowerCase();
			let oldSpell = item.spell;
			delete item.spell;

			generatorSpells.generate(item, {
				spellName: spellName
			});
			item.spell = extend(oldSpell, item.spell);
		} else if (msg.action === 'scour') {
			if (!item.power)
				return;

			for (let p in item.enchantedStats) {
				let value = item.enchantedStats[p];

				if (item.stats[p]) {
					result.addStatMsgs.push({
						stat: p,
						value: -value
					});
					item.stats[p] -= value;
					if (item.stats[p] <= 0)
						delete item.stats[p];

					if (p === 'lvlRequire') {
						item.level = Math.min(20, item.level + value);
						delete item.originalLevel;
					}
				}
			}

			delete item.enchantedStats;
			delete item.power;
		} else {
			let newPower = (item.power || 0) + 1;
			if (newPower > 3) {
				inventory.resolveCallback(msg);
				return;
			}

			item.power = newPower;
			this.addStat(item, result);
		}

		obj.syncer.setArray(true, 'inventory', 'getItems', inventory.simplifyItem(item));

		inventory.resolveCallback(msg, result);
	},

	addStat: function (item, result) {
		generatorStats.generate(item, {
			statCount: 1
		}, result);
	},

	getEnchantMaterials: function (item, action) {
		let result = null;

		if (action === 'reroll')
			result = [configCurrencies.getCurrencyFromAction('reroll')];
		else if (action === 'relevel')
			result = [configCurrencies.getCurrencyFromAction('relevel')];
		else if (action === 'reslot')
			result = [configCurrencies.getCurrencyFromAction('reslot')];
		else if (action === 'reforge')
			result = [configCurrencies.getCurrencyFromAction('reforge')];
		else if (action === 'scour')
			result = [configCurrencies.getCurrencyFromAction('scour')];
		else {
			let powerLevel = item.power || 0;
			let mult = null;
			if (powerLevel < 3)
				mult = [5, 10, 20][powerLevel];
			else
				return;

			result = salvager.salvage(item, true);
			result.forEach(r => {
				r.quantity = Math.max(1, ~~(r.quantity * mult));
			});
		}

		return {
			materials: result
		};
	}
};
