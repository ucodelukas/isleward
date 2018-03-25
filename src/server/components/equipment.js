define([
	'items/generators/stats'
], function (
	generatorStats
) {
	return {
		type: 'equipment',

		eq: {},
		doAutoEq: true,

		init: function (blueprint) {

		},

		transfer: function () {
			if (this.eqTransfer) {
				this.eq = this.eqTransfer;
				delete this.eqTransfer;
			}
		},

		simplify: function (self) {
			return {
				type: 'equipment',
				eq: {},
				eqTransfer: this.eq
			};
		},

		autoEquip: function (itemId) {
			if (!this.doAutoEq)
				return;

			var stats = this.obj.stats.values;

			var item = this.obj.inventory.findItem(itemId);
			if (!item)
				return;
			else if ((!item.slot) || (item.material) || (item.quest) || (item.ability) || (item.level > (stats.originalLevel || stats.level))) {
				item.eq = false;
				return;
			} else if ((item.factions) && (this.obj.player)) {
				if (!this.obj.reputation.canEquipItem(item)) {
					item.eq = false;
					return;
				}
			}

			var currentEqId = this.eq[item.slot];
			if (currentEqId == null) {
				this.equip(itemId);
				return true;
			}
		},

		equip: function (itemId) {
			var slot = null;
			if (typeof (itemId) == 'object') {
				slot = itemId.slot;
				itemId = itemId.itemId;
			}

			var level = (this.obj.stats.originalValues || this.obj.stats.values).level;
			var item = this.obj.inventory.findItem(itemId);
			if (!item)
				return;
			else if ((!item.slot) || (item.material) || (item.quest) || (item.ability) || (item.level > level)) {
				item.eq = false;
				return;
			} else if ((item.factions) && (this.obj.player)) {
				if (!this.obj.reputation.canEquipItem(item)) {
					item.eq = false;
					return;
				}
			}

			if (!slot)
				slot = item.equipSlot || item.slot;
			if (slot == 'twoHanded') {
				var currentEqId = this.eq.offHand;
				if (currentEqId != null)
					this.unequip(currentEqId);

				slot = 'oneHanded';
			} else if (slot == 'offHand') {
				var currentEqId = this.eq.oneHanded;
				if (currentEqId != null) {
					var currentEq = this.obj.inventory.findItem(currentEqId);
					if ((currentEq != null) && (currentEq.slot == 'twoHanded'))
						this.unequip(currentEqId);
				}
			}

			var equipMsg = {
				success: true,
				item: item
			};
			this.obj.fireEvent('beforeEquipItem', equipMsg);
			if (!equipMsg.success) {
				this.obj.instance.syncer.queue('onGetMessages', {
					id: this.obj.id,
					messages: [{
						class: 'color-redA',
						message: equipMsg.msg || 'you cannot equip that item',
						type: 'info'
					}]
				}, [this.obj.serverId]);

				return;
			}

			delete item.pos;
			this.obj.syncer.setArray(true, 'inventory', 'getItems', item);

			if (slot == 'finger') {
				var f1 = (this.eq['finger-1'] != null);
				var f2 = (this.eq['finger-2'] != null);

				if ((f1) && (f2))
					slot = 'finger-1';
				else if (!f1)
					slot = 'finger-1';
				else if (!f2)
					slot = 'finger-2';
			}

			var spellId = null;
			var currentEqId = this.eq[slot];
			var currentEq = this.obj.inventory.findItem(currentEqId);
			if (currentEq == item)
				return;
			if (currentEqId != null) {
				spellId = currentEq.spellId;
				this.unequip(currentEqId);
			}

			var stats = item.stats;
			if (this.obj.player) {
				var maxLevel = this.obj.instance.zone.level[1];
				if (maxLevel < item.level)
					stats = generatorStats.rescale(item, maxLevel);
			}

			for (var s in stats) {
				var val = stats[s];

				this.obj.stats.addStat(s, val);
			}

			item.eq = true;
			this.eq[slot] = itemId;
			item.equipSlot = slot;

			this.obj.spellbook.calcDps();

			if ((!this.obj.mob) || (item.ability)) {
				if (item.spell)
					this.obj.inventory.learnAbility(itemId, item.runeSlot);
				else {
					var result = item;
					if (item.effects) {
						result = extend(true, {}, item);
						result.effects = result.effects.map(e => ({
							factionId: e.factionId,
							text: e.text,
							properties: e.properties
						}));
						var reputation = this.obj.reputation;

						if (result.factions) {
							result.factions = result.factions.map(function (f) {
								var faction = reputation.getBlueprint(f.id);
								var factionTier = reputation.getTier(f.id);

								var noEquip = null;
								if (factionTier < f.tier)
									noEquip = true;

								return {
									name: faction.name,
									tier: f.tier,
									tierName: ['Hated', 'Hostile', 'Unfriendly', 'Neutral', 'Friendly', 'Honored', 'Revered', 'Exalted'][f.tier],
									noEquip: noEquip
								};
							}, this);
						}
					}

					this.obj.syncer.setArray(true, 'inventory', 'getItems', result);
				}
			}

			this.obj.fireEvent('afterEquipItem', item);
		},
		unequip: function (itemId) {
			var item = itemId;
			var slot = null;
			if (typeof (itemId) == 'object') {
				slot = itemId.slot;
				itemId = itemId.itemId;
			}

			if (item.id == null)
				item = this.obj.inventory.findItem(itemId);

			if (!item)
				return;

			var stats = item.stats;
			if (this.obj.player) {
				var maxLevel = this.obj.instance.zone.level[1];
				if (maxLevel < item.level)
					stats = generatorStats.rescale(item, maxLevel);
			}

			for (var s in stats) {
				var val = stats[s];

				this.obj.stats.addStat(s, -val);
			}

			delete item.eq;
			delete this.eq[item.equipSlot];
			delete item.equipSlot;

			this.obj.inventory.setItemPosition(itemId);

			if (item.spell) {
				item.eq = true;
				this.obj.inventory.unlearnAbility(itemId, item.runeSlot);
			} else {
				if (!item.effects)
					this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
				else {
					var result = extend(true, {}, item);
					result.effects = result.effects.map(e => ({
						factionId: e.factionId,
						text: e.text,
						properties: e.properties
					}));
					var reputation = this.obj.reputation;

					if (result.factions) {
						result.factions = result.factions.map(function (f) {
							var faction = reputation.getBlueprint(f.id);
							var factionTier = reputation.getTier(f.id);

							var noEquip = null;
							if (factionTier < f.tier)
								noEquip = true;

							return {
								name: faction.name,
								tier: f.tier,
								tierName: ['Hated', 'Hostile', 'Unfriendly', 'Neutral', 'Friendly', 'Honored', 'Revered', 'Exalted'][f.tier],
								noEquip: noEquip
							};
						}, this);
					}

					this.obj.syncer.setArray(true, 'inventory', 'getItems', result);
				}
			}

			this.obj.spellbook.calcDps();

			this.obj.fireEvent('afterUnequipItem', item);
		},
		unequipAll: function () {
			var eq = this.eq;
			Object.keys(this.eq).forEach(function (slot) {
				this.unequip(eq[slot]);
			}, this);
		},

		unequipFactionGear: function (factionId, tier) {
			var inventory = this.obj.inventory;

			var eq = this.eq;
			Object.keys(this.eq).forEach(function (slot) {
				var itemId = eq[slot];
				var item = inventory.findItem(itemId);

				var factions = item.factions;
				if (!factions)
					return;

				var findFaction = factions.find(f => f.id == factionId);
				if (!findFaction)
					return;

				if (findFaction.tier > tier) {
					this.unequip(itemId);

					this.obj.instance.syncer.queue('onGetMessages', {
						id: this.obj.id,
						messages: [{
							class: 'color-redA',
							message: 'you unequip your ' + item.name + ' as it zaps you',
							type: 'rep'
						}]
					}, [this.obj.serverId]);
				}
			}, this);
		},

		rescale: function (level) {
			var items = this.obj.inventory.items;

			var stats = {};

			var eq = this.eq;
			for (var p in eq) {
				var item = items.find(i => (i.id == eq[p]));
				if ((!item.slot) || (item.slot == 'tool')) {
					continue;
				}

				var item = items.find(i => (i.id == eq[p]));
				var nItemStats = item.stats;
				if (item.level > level)
					nItemStats = generatorStats.rescale(item, level);

				for (var s in nItemStats) {
					if (!stats[s])
						stats[s] = 0;

					stats[s] += nItemStats[s];
				}
			}

			return stats;
		}
	};
});
