let generatorStats = require('../items/generators/stats');

module.exports = {
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

		let stats = this.obj.stats.values;

		let item = this.obj.inventory.findItem(itemId);
		if (!item)
			return;
		else if ((!item.slot) || (item.material) || (item.quest) || (item.ability) || (!this.obj.inventory.canEquipItem(item))) {
			item.eq = false;
			return;
		}

		let currentEqId = this.eq[item.slot];
		if (currentEqId == null) {
			this.equip(itemId);
			return true;
		}
	},

	equip: function (itemId) {
		let slot = null;
		if (typeof (itemId) === 'object') {
			slot = itemId.slot;
			itemId = itemId.itemId;
		}

		let item = this.obj.inventory.findItem(itemId);
		if (!item)
			return;
		else if ((!item.slot) || (item.material) || (item.quest) || (item.ability) || (!this.obj.inventory.canEquipItem(item))) {
			item.eq = false;
			return;
		}

		if (!slot)
			slot = item.equipSlot || item.slot;
		if (slot === 'twoHanded') {
			let currentEqId = this.eq.offHand;
			if (currentEqId != null)
				this.unequip(currentEqId);

			slot = 'oneHanded';
		} else if (slot === 'offHand') {
			let currentEqId = this.eq.oneHanded;
			if (currentEqId != null) {
				let currentEq = this.obj.inventory.findItem(currentEqId);
				if ((currentEq != null) && (currentEq.slot === 'twoHanded'))
					this.unequip(currentEqId);
			}
		}

		let equipMsg = {
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

		if (slot === 'finger') {
			let f1 = (this.eq['finger-1'] != null);
			let f2 = (this.eq['finger-2'] != null);

			if ((f1) && (f2))
				slot = 'finger-1';
			else if (!f1)
				slot = 'finger-1';
			else if (!f2)
				slot = 'finger-2';
		}

		let spellId = null;
		let currentEqId = this.eq[slot];
		let currentEq = this.obj.inventory.findItem(currentEqId);
		if (currentEq === item)
			return;
		if (currentEqId != null) {
			spellId = currentEq.spellId;
			this.unequip(currentEqId);
		}

		let stats = item.stats;
		for (let s in stats) {
			let val = stats[s];

			this.obj.stats.addStat(s, val);
		}

		(item.implicitStats || []).forEach(function (s) {
			this.obj.stats.addStat(s.stat, s.value);
		}, this);

		item.eq = true;
		this.eq[slot] = itemId;
		item.equipSlot = slot;

		this.obj.spellbook.calcDps();

		if ((!this.obj.mob) || (item.ability)) {
			if (item.spell)
				this.obj.inventory.learnAbility(itemId, item.runeSlot);
			else {
				let result = item;
				if (item.effects) {
					result = extend(true, {}, item);
					result.effects = result.effects.map(e => ({
						factionId: e.factionId,
						text: e.text,
						properties: e.properties
					}));
					let reputation = this.obj.reputation;

					if (result.factions) {
						result.factions = result.factions.map(function (f) {
							let faction = reputation.getBlueprint(f.id);
							let factionTier = reputation.getTier(f.id);

							let noEquip = null;
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
		let item = itemId;
		let slot = null;
		if (typeof (itemId) === 'object') {
			slot = itemId.slot;
			itemId = itemId.itemId;
		}

		if (item.id == null)
			item = this.obj.inventory.findItem(itemId);

		if (!item)
			return;

		let stats = item.stats;

		delete item.eq;
		delete this.eq[item.equipSlot];
		delete item.equipSlot;

		for (let s in stats) {
			let val = stats[s];

			this.obj.stats.addStat(s, -val);
		}

		(item.implicitStats || []).forEach(function (s) {
			this.obj.stats.addStat(s.stat, -s.value);
		}, this);

		this.obj.inventory.setItemPosition(itemId);

		if (item.spell) {
			item.eq = true;
			this.obj.inventory.unlearnAbility(itemId, item.runeSlot);
		} else if (!item.effects)
			this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
		else {
			let result = extend(true, {}, item);
			result.effects = result.effects.map(e => ({
				factionId: e.factionId,
				text: e.text,
				properties: e.properties
			}));
			let reputation = this.obj.reputation;

			if (result.factions) {
				result.factions = result.factions.map(function (f) {
					let faction = reputation.getBlueprint(f.id);
					let factionTier = reputation.getTier(f.id);

					let noEquip = null;
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

		this.obj.spellbook.calcDps();

		this.obj.fireEvent('afterUnequipItem', item);
	},
	unequipAll: function () {
		let eq = this.eq;
		Object.keys(this.eq).forEach(function (slot) {
			this.unequip(eq[slot]);
		}, this);
	},

	unequipAttrRqrGear: function () {
		let inventory = this.obj.inventory;

		let eq = this.eq;
		Object.keys(this.eq).forEach(function (slot) {
			let itemId = eq[slot];
			let item = inventory.findItem(itemId);
			if (!item)
				return;

			let errors = inventory.equipItemErrors(item);
			if (errors.length > 0) {
				this.unequip(itemId);

				let message = ({
					int: `You suddenly feel too stupid to wear your ${item.name}`,
					str: `Your weak body can no longer equip your ${item.name}`,
					dex: `Your sluggish physique cannot possibly equip your ${item.name}`
				})[errors[0]];

				this.obj.instance.syncer.queue('onGetMessages', {
					id: this.obj.id,
					messages: [{
						class: 'color-redA',
						message: message,
						type: 'rep'
					}]
				}, [this.obj.serverId]);
			}
		}, this);
	},

	unequipFactionGear: function (factionId, tier) {
		let inventory = this.obj.inventory;

		let eq = this.eq;
		Object.keys(this.eq).forEach(function (slot) {
			let itemId = eq[slot];
			let item = inventory.findItem(itemId);

			let factions = item.factions;
			if (!factions)
				return;

			let findFaction = factions.find(f => f.id === factionId);
			if (!findFaction)
				return;

			if (findFaction.tier > tier) {
				this.unequip(itemId);

				this.obj.instance.syncer.queue('onGetMessages', {
					id: this.obj.id,
					messages: [{
						class: 'color-redA',
						message: 'You unequip your ' + item.name + ' as it zaps you.',
						type: 'rep'
					}]
				}, [this.obj.serverId]);
			}
		}, this);
	}
};
