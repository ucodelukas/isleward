let generator = require('items/generator');
let salvager = require('items/salvager');
let enchanter = require('items/enchanter');
let objects = require('objects/objects');
let classes = require('config/spirits');
let mtx = require('mtx/mtx');
let factions = require('config/factions');
let itemEffects = require('items/itemEffects');

module.exports = {
	//Properties
	type: 'inventory',

	inventorySize: 50,
	items: [],

	blueprint: null,

	//Base Methods

	init: function (blueprint, isTransfer) {
		let items = blueprint.items || [];
		let iLen = items.length;

		//Spells should be sorted so they're EQ'd in the right order
		items.sort(function (a, b) {
			let aId = (a.spellId != null) ? ~~a.spellId : 9999;
			let bId = (b.spellId != null) ? ~~b.spellId : 9999;
			return (aId - bId);
		});

		for (var i = 0; i < iLen; i++) {
			var item = items[i];
			if ((item.pos >= this.inventorySize) || (item.eq))
				delete item.pos;

			while (item.name.indexOf('\'\'') > -1) 
				item.name = item.name.replace('\'\'', '\'');
		}

		this.hookItemEvents(items);

		for (var i = 0; i < iLen; i++) {
			var item = items[i];
			let pos = item.pos;

			let newItem = this.getItem(item, true, true);
			newItem.pos = pos;
		}

		if ((this.obj.player) && (!isTransfer) && (this.obj.stats.values.level == 1))
			this.getDefaultAbilities();

		delete blueprint.items;

		this.blueprint = blueprint;
	},

	transfer: function () {
		this.hookItemEvents();
	},

	save: function () {
		return {
			type: 'inventory',
			items: this.items
		};
	},

	simplify: function (self) {
		if (!self)
			return null;

		let reputation = this.obj.reputation;

		return {
			type: 'inventory',
			items: this.items
				.map(function (i) {
					let item = extend(true, {}, i);

					if (item.effects) {
						item.effects = item.effects.map(e => ({
							factionId: e.factionId,
							text: e.text,
							properties: e.properties,
							mtx: e.mtx,
							type: e.type,
							rolls: e.rolls
						}));
					}

					if (item.factions) {
						item.factions = item.factions.map(function (f) {
							let faction = reputation.getBlueprint(f.id);
							let factionTier = reputation.getTier(f.id);

							let noEquip = null;
							if (factionTier < f.tier)
								noEquip = true;

							if (!faction)
								console.log(f);

							return {
								id: f.id,
								name: faction.name,
								tier: f.tier,
								tierName: ['Hated', 'Hostile', 'Unfriendly', 'Neutral', 'Friendly', 'Honored', 'Revered', 'Exalted'][f.tier],
								noEquip: noEquip
							};
						}, this);
					}

					return item;
				})
		};
	},

	update: function () {
		let items = this.items;
		let iLen = items.length;
		for (let i = 0; i < iLen; i++) {
			let item = items[i];
			if (!item.cd)
				continue;

			item.cd--;

			this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
		}
	},

	//Client Actions

	enchantItem: function (msg) {
		let item = this.findItem(msg.itemId);
		if ((!item) || (!item.slot) || (item.eq) || (item.noAugment) || ((msg.action == 'scour') && (item.power == 0))) {
			this.resolveCallback(msg);
			return;
		}

		enchanter.enchant(this.obj, item, msg);
	},

	getEnchantMaterials: function (msg) {
		let result = [];
		let item = this.findItem(msg.itemId);
		if ((item) && (item.slot))
			result = enchanter.getEnchantMaterials(item, msg.action);

		this.resolveCallback(msg, result);
	},

	learnAbility: function (itemId, runeSlot) {
		if (itemId.itemId != null) {
			let msg = itemId;
			itemId = msg.itemId;
			runeSlot = msg.slot;
		}

		let item = this.findItem(itemId);
		let statValues = this.obj.stats.values;
		if (!item)
			return;
		else if (!item.spell) {
			item.eq = false;
			return;
		} else if (item.level > statValues.level) {
			item.eq = false;
			return;
		}

		let learnMsg = {
			success: true,
			item: item
		};
		this.obj.fireEvent('beforeLearnAbility', learnMsg);
		if (!learnMsg.success) {
			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'color-redA',
					message: learnMsg.msg || 'you cannot learn that ability',
					type: 'info'
				}]
			}, [this.obj.serverId]);

			return;
		}

		let spellbook = this.obj.spellbook;

		if ((item.slot == 'twoHanded') || (item.slot == 'oneHanded'))
			runeSlot = 0;
		else if (runeSlot == null) {
			runeSlot = 4;
			for (var i = 1; i <= 4; i++) {
				if (!this.items.some(j => (j.runeSlot == i))) {
					runeSlot = i;
					break;
				}
			}
		}

		let currentEq = this.items.find(i => (i.runeSlot == runeSlot));
		if (currentEq) {
			spellbook.removeSpellById(runeSlot);
			delete currentEq.eq;
			delete currentEq.runeSlot;
			this.setItemPosition(currentEq.id);
			this.obj.syncer.setArray(true, 'inventory', 'getItems', currentEq);
		}

		item.eq = true;
		item.runeSlot = runeSlot;
		delete item.pos;

		spellbook.addSpellFromRune(item.spell, runeSlot);
		this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
	},

	activateMtx: function (itemId) {
		let item = this.findItem(itemId);
		if (!item)
			return;
		else if (item.type != 'mtx') {
			delete item.active;
			return;
		}

		item.active = !item.active;

		this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
	},

	splitStack: function (msg) {
		let item = this.findItem(msg.itemId);
		if (!item)
			return;
		else if ((!item.quantity) || (item.quantity <= msg.stackSize) || (msg.stackSize < 1))
			return;

		let newItem = extend(true, {}, item);
		item.quantity -= msg.stackSize;
		newItem.quantity = msg.stackSize;

		this.getItem(newItem, true, true);

		this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
	},

	combineStacks: function (msg) {
		let fromItem = this.findItem(msg.fromId);
		let toItem = this.findItem(msg.toId);

		if ((!fromItem) || (!toItem))
			return;
		else if ((!fromItem.quantity) || (!toItem.quantity))
			return;

		toItem.quantity += fromItem.quantity;
		this.obj.syncer.setArray(true, 'inventory', 'getItems', toItem);
		this.destroyItem(fromItem.id, null, true);
	},

	useItem: function (itemId) {
		let item = this.findItem(itemId);
		if (!item)
			return;

		if (item.cdMax) {
			if (item.cd) {
				process.send({
					method: 'events',
					data: {
						onGetAnnouncement: [{
							obj: {
								msg: 'That item is on cooldown'
							},
							to: [this.obj.serverId]
						}]
					}
				});

				return;
			}

			item.cd = item.cdMax;

			//Find similar items and put them on cooldown too
			this.items.forEach(function (i) {
				if ((i.name == item.name) && (i.cdMax == item.cdMax))
					i.cd = i.cdMax;
			});
		}

		let result = {};
		this.obj.instance.eventEmitter.emit('onBeforeUseItem', this.obj, item, result);

		if (item.type == 'consumable') {
			if (item.uses) {
				item.uses--;
				this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
				return;
			}
			this.destroyItem(itemId, 1);
		}
	},

	unlearnAbility: function (itemId) {
		if (itemId.itemId != null)
			itemId = itemId.itemId;

		let item = this.findItem(itemId);
		if (!item)
			return;
		else if (!item.spell) {
			item.eq = false;
			return;
		}

		let spellbook = this.obj.spellbook;
		spellbook.removeSpellById(item.runeSlot);
		delete item.eq;
		delete item.runeSlot;
		if (!item.slot)
			this.setItemPosition(itemId);
		this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
	},

	stashItem: function (id) {
		let item = this.findItem(id);
		if ((!item) || (item.quest) || (item.noStash))
			return;

		delete item.pos;

		let stash = this.obj.stash;
		if (!stash.active)
			return;

		let clonedItem = extend(true, {}, item);
		this.destroyItem(id, null, true);
		stash.deposit(clonedItem);
	},

	salvageItem: function (id) {
		let item = this.findItem(id);
		if ((!item) || (item.material) || (item.quest) || (item.noSalvage) || (item.eq))
			return;

		let messages = [];

		let items = salvager.salvage(item);
		let iLen = items.length;

		if (!iLen)
			return;

		for (let i = 0; i < iLen; i++) {
			let material = items[i];

			this.getItem(material, true);

			messages.push({
				class: 'q' + material.quality,
				message: 'salvage (' + material.name + ' x' + material.quantity + ')'
			});
		}

		this.obj.instance.syncer.queue('onGetMessages', {
			id: this.obj.id,
			messages: messages
		}, [this.obj.serverId]);

		this.destroyItem(id);
	},

	destroyItem: function (id, amount, force) {
		let item = this.findItem(id);
		if ((!item) || ((item.noDestroy) && (!force)))
			return;

		amount = amount || item.quantity;

		if (item.eq)
			this.obj.equipment.unequip(id);

		if ((item.quantity) && (amount)) {
			item.quantity -= amount;
			if (item.quantity <= 0) {
				this.items.spliceWhere(i => i.id == id);
				this.obj.syncer.setArray(true, 'inventory', 'destroyItems', id);
			} else
				this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
		} else {
			this.items.spliceWhere(i => i.id == id);
			this.obj.syncer.setArray(true, 'inventory', 'destroyItems', id);
		}

		this.obj.fireEvent('afterDestroyItem', item, amount);

		return item;
	},

	dropItem: function (id) {
		let item = this.findItem(id);
		if ((!item) || (item.noDrop) || (item.quest))
			return;

		delete item.pos;

		//Find close open position
		let x = this.obj.x;
		let y = this.obj.y;
		let dropCell = this.obj.instance.physics.getOpenCellInArea(x - 1, y - 1, x + 1, y + 1);
		if (!dropCell)
			return;

		if (item.eq)
			this.obj.equipment.unequip(id);

		this.items.spliceWhere(i => i.id == id);

		this.obj.syncer.setArray(true, 'inventory', 'destroyItems', id);

		this.createBag(dropCell.x, dropCell.y, [item]);
	},

	moveItem: function (msgs) {
		msgs.forEach(function (m) {
			let item = this.findItem(m.id);
			if (!item)
				return;

			item.pos = m.pos;
		}, this);
	},

	mailItem: function (msg) {
		let item = this.findItem(msg.itemId);
		if ((!item) || (item.noDrop) || (item.quest)) {
			this.resolveCallback(msg);
			return;
		}

		delete item.pos;

		let io = require('security/io');
		io.get({
			ent: msg.recipient,
			field: 'character',
			callback: this.onCheckCharExists.bind(this, msg, item)
		});
	},

	onCheckCharExists: function (msg, item, res) {
		if (!res) {
			this.resolveCallback(msg, 'Recipient does not exist');
			return;
		}

		this.obj.instance.mail.sendMail(msg.recipient, [extend(true, {}, item)]);

		this.destroyItem(item.id);

		this.resolveCallback(msg);
	},

	//Helpers

	hookItemEvents: function (items) {
		var items = items || this.items;
		let iLen = items.length;
		for (let i = 0; i < iLen; i++) {
			var item = items[i];

			if (item.effects) {
				item.effects.forEach(function (e) {
					if (e.mtx) {
						let mtxUrl = mtx.get(e.mtx);
						let mtxModule = require(mtxUrl);

						e.events = mtxModule.events;
					} else if (e.factionId) {
						let faction = factions.getFaction(e.factionId);
						let statGenerator = faction.uniqueStat;
						statGenerator.generate(item);
					} else {
						let effectUrl = itemEffects.get(e.type);
						let effectModule = require(effectUrl);

						e.events = effectModule.events;
					}
				});
			}

			if ((item.pos == null) && (!item.eq)) {
				var pos = i;
				for (var j = 0; j < iLen; j++) {
					if (!items.some(fj => (fj.pos == j))) {
						pos = j;
						break;
					}
				}
				item.pos = pos;
			} else if ((!item.eq) && (items.some(ii => ((ii != item) && (ii.pos == item.pos))))) {
				var pos = item.pos;
				for (var j = 0; j < iLen; j++) {
					if (!items.some(fi => ((fi != item) && (fi.pos == j)))) {
						pos = j;
						break;
					}
				}
				item.pos = pos;
			}
		}
	},

	setItemPosition: function (id) {
		let item = this.findItem(id);
		if (!item)
			return;

		let iSize = this.inventorySize;
		for (var i = 0; i < iSize; i++) {
			if (!this.items.some(j => (j.pos == i))) {
				item.pos = i;
				break;
			}
		}
	},

	resolveCallback: function (msg, result) {
		let callbackId = (msg.callbackId != null) ? msg.callbackId : msg;
		result = result || [];

		if (callbackId == null)
			return;

		this.obj.instance.syncer.queue('serverModule', {
			module: 'atlas',
			method: 'resolveCallback',
			msg: {
				id: callbackId,
				result: result
			}
		});
	},

	findItem: function (id) {
		if (id == null)
			return null;

		return this.items.find(i => i.id == id);
	},

	getDefaultAbilities: function () {
		let hasWeapon = this.items.some(function (i) {
			return (
				(i.spell) &&
				(i.spell.rolls) &&
				(i.spell.rolls.damage != null) &&
				((i.slot == 'twoHanded') || (i.slot == 'oneHanded'))
			);
		});

		if (!hasWeapon) {
			let item = generator.generate({
				type: classes.weapons[this.obj.class],
				quality: 0,
				spellQuality: 'basic'
			});
			item.eq = true;
			item.noSalvage = true;
			this.getItem(item);
		}

		classes.spells[this.obj.class].forEach(function (spellName) {
			let hasSpell = this.items.some(function (i) {
				return (
					(i.spell) &&
					(i.spell.name.toLowerCase() == spellName)
				);
			});

			if (!hasSpell) {
				let item = generator.generate({
					spell: true,
					spellQuality: 'basic',
					spellName: spellName
				});
				item.eq = true;
				item.noSalvage = true;
				this.getItem(item);
			}
		}, this);
	},

	createBag: function (x, y, items, ownerId) {
		if (ownerId == null)
			ownerId = -1;

		let bagCell = 50;

		let topQuality = 0;
		let iLen = items.length;
		for (let i = 0; i < iLen; i++) {
			let quality = items[i].quality;
			items[i].fromMob = !!this.obj.mob;
			if (quality > topQuality)
				topQuality = quality;
		}

		if (topQuality == 0)
			bagCell = 50;
		else if (topQuality == 1)
			bagCell = 51;
		else if (topQuality == 2)
			bagCell = 128;
		else if (topQuality == 3)
			bagCell = 52;
		else
			bagCell = 53;

		let obj = this.obj.instance.objects.buildObjects([{
			sheetName: 'objects',
			cell: bagCell,
			x: x,
			y: y,
			properties: {
				cpnChest: {
					ownerId: ownerId,
					ttl: this.obj.instance.instanced ? -1 : 1710
				},
				cpnInventory: {
					items: extend(true, [], items)
				}
			}
		}]);

		return obj;
	},

	hasSpace: function () {
		if (this.inventorySize != -1) {
			let nonEqItems = this.items.filter(f => !f.eq).length;
			return (nonEqItems < this.inventorySize);
		} return true;
	},

	getItem: function (item, hideMessage, noStack) {
		this.obj.instance.eventEmitter.emit('onBeforeGetItem', item, this.obj);

		//We need to know if a mob dropped it for quest purposes
		let fromMob = item.fromMob;

		if (item.quality == null)
			item.quality = 0;

		//Players can't have fromMob items in their inventory but bags can (dropped by a mob)
		if (this.obj.player)
			delete item.fromMob;

		//Store the quantity to send to the player
		let quantity = item.quantity;

		let exists = false;
		if (((item.material) || (item.quest) || (item.quantity)) && (!item.noStack) && (!item.uses) && (!noStack)) {
			let existItem = this.items.find(i => (i.name == item.name));
			if (existItem) {
				exists = true;
				if (!existItem.quantity)
					existItem.quantity = 1;

				existItem.quantity += (item.quantity || 1);
				item = existItem;
			}
		}

		if (!exists)
			delete item.pos;

		//Get next id
		if (!exists) {
			let id = 0;
			let items = this.items;
			let iLen = items.length;

			if (!this.hasSpace()) {
				if (!hideMessage) {
					this.obj.instance.syncer.queue('onGetMessages', {
						id: this.obj.id,
						messages: [{
							class: 'color-redA',
							message: 'your bags are too full to loot any more items',
							type: 'info'
						}]
					}, [this.obj.serverId]);
				}

				return false;
			}

			for (var i = 0; i < iLen; i++) {
				let fItem = items[i];
				if (fItem.id >= id) 
					id = fItem.id + 1;
			}
			item.id = id;

			if (item.eq)
				delete item.pos;

			if ((item.pos == null) && (!item.eq)) {
				let pos = iLen;
				for (var i = 0; i < iLen; i++) {
					if (!items.some(fi => (fi.pos == i))) {
						pos = i;
						break;
					}
				}
				item.pos = pos;
			}
		}

		if ((this.obj.player) && (!hideMessage)) {
			let messages = [];

			let msg = item.name;
			if (quantity)
				msg += ' x' + quantity;
			else if ((item.stats) && (item.stats.weight))
				msg += ` ${item.stats.weight}lb`;
			messages.push({
				class: 'q' + item.quality,
				message: 'loot: {' + msg + '}',
				item: item,
				type: 'loot'
			});

			this.obj.instance.syncer.queue('onGetDamage', {
				id: this.obj.id,
				event: true,
				text: 'loot'
			});

			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: messages
			}, [this.obj.serverId]);
		}

		//TODO: Remove later, just for test
		if (item.stats) {
			let stats = Object.keys(item.stats);
			let sLen = stats.length;
			for (var i = 0; i < sLen; i++) {
				let s = stats[i];
				let val = item.stats[s];
				if (s == 'maxHp') {
					delete item.stats[s];
					item.stats.hpMax = val;
				} else if (s == 'maxMana') {
					delete item.stats[s];
					item.stats.manaMax = val;
				}
			}
		}

		if (item.effects) {
			item.effects.forEach(function (e) {
				if (e.mtx) {
					let mtxUrl = mtx.get(e.mtx);
					let mtxModule = require(mtxUrl);

					e.events = mtxModule.events;
				} else if (e.type) {
					let effectUrl = itemEffects.get(e.type);
					let effectModule = require(effectUrl);

					e.text = effectModule.events.onGetText(item);

					e.events = effectModule.events;
				}
			});
		}

		if (!exists)
			this.items.push(item);

		if (item.eq) {
			if (item.ability)
				this.learnAbility(item.id, item.runeSlot);
			else
				this.obj.equipment.equip(item.id);
		} else if (!item.effects)
			this.obj.syncer.setArray(true, 'inventory', 'getItems', item, true);
		else {
			let result = extend(true, {}, item);
			result.effects = result.effects.map(e => ({
				factionId: e.factionId,
				text: e.text,
				properties: e.properties
			}));

			let reputation = this.obj.reputation;

			//Don't do this check if we don't have a reputation cpn. That means this is most likely a bag
			if ((reputation) && (result.factions)) {
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

			this.obj.syncer.setArray(true, 'inventory', 'getItems', result, true);
		}

		if (!hideMessage) {
			if (fromMob)
				this.obj.fireEvent('afterLootMobItem', item);
		}

		return item;
	},

	dropBag: function (ownerId, killSource) {
		if (!this.blueprint)
			return;

		//Only drop loot if this player is in the zone
		let playerObject = this.obj.instance.objects.find(o => o.serverId == ownerId);
		if (!playerObject)
			return;

		//Get player's spells' statTypes
		let stats = [];
		playerObject.spellbook.spells.forEach(function (s) {
			let spellStatType = s.statType;
			if (!(spellStatType instanceof Array))
				spellStatType = [spellStatType];
			spellStatType.forEach(function (ss) {
				if (stats.indexOf(ss) == -1)
					stats.push(ss);
			});
		});

		let items = this.items;
		let iLen = items.length;
		for (var i = 0; i < iLen; i++) {
			delete items[i].eq;
			delete items[i].pos;
		}

		let blueprint = this.blueprint;

		let savedItems = extend(true, [], this.items);
		let instancedItems = extend(true, [], this.items);
		this.items = [];

		let dropEvent = {
			chanceMultiplier: 1,
			source: this.obj
		};
		playerObject.fireEvent('beforeGenerateLoot', dropEvent);

		if ((!blueprint.noRandom) || (blueprint.alsoRandom)) {
			var magicFind = (blueprint.magicFind || 0);
			let bonusMagicFind = killSource.stats.values.magicFind;

			let rolls = blueprint.rolls;
			let itemQuantity = killSource.stats.values.itemQuantity;
			rolls += ~~(itemQuantity / 100);
			if ((Math.random() * 100) < (itemQuantity % 100))
				rolls++;

			for (var i = 0; i < rolls; i++) {
				if (Math.random() * 100 >= (blueprint.chance || 35) * dropEvent.chanceMultiplier)
					continue;

				let itemBlueprint = {
					level: this.obj.stats.values.level,
					magicFind: magicFind,
					bonusMagicFind: bonusMagicFind
				};

				let statValues = this.obj.stats.values;
				useItem = generator.generate(itemBlueprint, statValues.level);

				this.getItem(useItem);
			}
		}

		if (blueprint.noRandom) {
			let blueprints = blueprint.blueprints;
			for (var i = 0; i < blueprints.length; i++) {
				let drop = blueprints[i];
				if ((blueprint.chance) && (~~(Math.random() * 100) >= blueprint.chance * dropEvent.chanceMultiplier))
					continue;
				else if ((drop.maxLevel) && (drop.maxLevel < killSource.stats.values.level))
					continue;
				else if ((drop.chance) && (~~(Math.random() * 100) >= drop.chance * dropEvent.chanceMultiplier)) 
					continue;

				drop.level = drop.level || this.obj.stats.values.level;
				drop.magicFind = magicFind;

				let item = drop;
				if ((!item.quest) && (item.type != 'key'))
					item = generator.generate(drop);

				if (!item.slot)
					delete item.level;

				this.getItem(item, true);
			}
		}

		playerObject.fireEvent('beforeTargetDeath', this.obj, this.items);
		this.obj.instance.eventEmitter.emit('onBeforeDropBag', this.obj, this.items, killSource);

		if (this.items.length > 0)
			this.createBag(this.obj.x, this.obj.y, this.items, ownerId);

		this.items = savedItems;
	},

	giveItems: function (obj, hideMessage) {
		let objInventory = obj.inventory;

		let messages = [];

		let items = this.items;
		let iLen = items.length;
		for (let i = 0; i < iLen; i++) {
			let item = items[i];

			if (objInventory.getItem(item, hideMessage)) {
				items.splice(i, 1);
				i--;
				iLen--;
			} else
				return false;
		}

		return true;
	},

	rollItems: function (party) {
		let items = this.items;
		let iLen = items.length;
		for (let i = 0; i < iLen; i++) {
			let item = items[i];

			this.obj.instance.syncer.queue('serverModule', {
				module: 'lootRoller',
				method: 'enqueue',
				msg: {
					party: party,
					item: item
				}
			});
		}

		this.items = [];
	},

	fireEvent: function (event, args) {
		let items = this.items;
		let iLen = items.length;
		for (let i = 0; i < iLen; i++) {
			let item = items[i];

			if ((!item.eq) && (!item.active))
				continue;

			let effects = item.effects;
			if (!effects)
				continue;

			let eLen = effects.length;
			for (let j = 0; j < eLen; j++) {
				let effect = effects[j];

				let effectEvent = effect.events[event];
				if (!effectEvent)
					continue;

				effectEvent.apply(this.obj, [item, ...args]);
			}
		}
	},

	clear: function () {
		delete this.items;
		this.items = [];
	},

	equipItemErrors: function (item) {
		let errors = [];

		if (!this.obj.player)
			return [];

		let stats = this.obj.stats.values;

		if (item.level > stats.level)
			errors.push('level');

		if ((item.requires) && (stats[item.requires[0].stat] < item.requires[0].value))
			errors.push(item.requires[0].stat);

		if (item.factions) {
			if (item.factions.some(function (f) {
				return f.noEquip;
			}))
				errors.push('faction');
		}

		return errors;
	},

	canEquipItem: function (item) {
		return (this.equipItemErrors(item).length == 0);
	}
};
