define([
	'items/generator',
	'items/salvager',
	'items/enchanter',
	'objects/objects',
	'config/classes',
	'mtx/mtx',
	'config/factions',
	'misc/events',
	'items/itemEffects'
], function (
	generator,
	salvager,
	enchanter,
	objects,
	classes,
	mtx,
	factions,
	events,
	itemEffects
) {
	return {
		type: 'inventory',

		inventorySize: 50,
		items: [],

		blueprint: null,

		init: function (blueprint, isTransfer) {
			var items = blueprint.items || [];
			var iLen = items.length;

			//Spells should be sorted so they're EQ'd in the right order
			items.sort(function (a, b) {
				var aId = (a.spellId != null) ? ~~a.spellId : 9999;
				var bId = (b.spellId != null) ? ~~b.spellId : 9999;
				return (aId - bId);
			});

			for (var i = 0; i < iLen; i++) {
				var item = items[i];
				if ((item.pos >= this.inventorySize) || (item.eq))
					delete item.pos;

				while (item.name.indexOf(`''`) > -1) {
					item.name = item.name.replace(`''`, `'`);
				}
			}

			this.hookItemEvents(items);

			for (var i = 0; i < iLen; i++) {
				var item = items[i];
				var pos = item.pos;

				var newItem = this.getItem(item, true, true);
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

		hookItemEvents: function (items) {
			var items = items || this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];

				if (item.effects) {
					item.effects.forEach(function (e) {
						if (e.mtx) {
							var mtxUrl = mtx.get(e.mtx);
							var mtxModule = require(mtxUrl);

							e.events = mtxModule.events;
						} else if (e.factionId) {
							var faction = factions.getFaction(e.factionId);
							var statGenerator = faction.uniqueStat;
							statGenerator.generate(item);
						} else {
							var effectUrl = itemEffects.get(e.type);
							var effectModule = require(effectUrl);

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

		//Client Actions

		enchantItem: function (msg) {
			var item = this.findItem(msg.itemId);
			if ((!item) || (!item.slot) || (item.eq) || (item.noAugment) || ((msg.action == 'scour') && (item.power == 0))) {
				this.resolveCallback(msg);
				return;
			}

			enchanter.enchant(this.obj, item, msg);
		},

		getEnchantMaterials: function (msg) {
			var result = [];
			var item = this.findItem(msg.itemId);
			if ((item) && (item.slot))
				result = enchanter.getEnchantMaterials(item, msg.action);

			this.resolveCallback(msg, result);
		},

		learnAbility: function (itemId, runeSlot) {
			if (itemId.itemId != null) {
				var msg = itemId;
				itemId = msg.itemId;
				runeSlot = msg.slot;
			}

			var item = this.findItem(itemId);
			if (!item)
				return;
			else if (!item.spell) {
				item.eq = false;
				return;
			}

			var learnMsg = {
				success: true,
				item: item
			};
			this.obj.fireEvent('beforeLearnAbility', learnMsg);
			if (!learnMsg.success) {
				this.obj.instance.syncer.queue('onGetMessages', {
					id: this.obj.id,
					messages: [{
						class: 'q0',
						message: learnMsg.msg || 'you cannot learn that ability',
						type: 'info'
					}]
				}, [this.obj.serverId]);

				return;
			}

			var spellbook = this.obj.spellbook;

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

			var currentEq = this.items.find(i => (i.runeSlot == runeSlot));
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
			var item = this.findItem(itemId);
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
			var item = this.findItem(msg.itemId);
			if (!item)
				return;
			else if ((!item.quantity) || (item.quantity <= msg.stackSize) || (msg.stackSize < 1))
				return;

			var newItem = extend(true, {}, item);
			item.quantity -= msg.stackSize;
			newItem.quantity = msg.stackSize;

			this.getItem(newItem, true, true);

			this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
		},

		combineStacks: function (msg) {
			var fromItem = this.findItem(msg.fromId);
			var toItem = this.findItem(msg.toId);

			if ((!fromItem) || (!toItem))
				return;
			else if ((!fromItem.quantity) || (!toItem.quantity))
				return;

			toItem.quantity += fromItem.quantity;
			this.obj.syncer.setArray(true, 'inventory', 'getItems', toItem);
			this.destroyItem(fromItem.id, null, true);
		},

		useItem: function (itemId) {
			var item = this.findItem(itemId);
			if (!item)
				return;

			if (item.cdMax) {
				if (item.cd) {
					process.send({
						method: 'events',
						data: {
							'onGetAnnouncement': [{
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

			var result = {};
			events.emit('onBeforeUseItem', this.obj, item, result);

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

			var item = this.findItem(itemId);
			if (!item)
				return;
			else if (!item.spell) {
				item.eq = false;
				return;
			}

			var spellbook = this.obj.spellbook;
			spellbook.removeSpellById(item.runeSlot);
			delete item.eq;
			delete item.runeSlot;
			if (!item.slot)
				this.setItemPosition(itemId);
			this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
		},

		stashItem: function (id) {
			var item = this.findItem(id);
			if ((!item) || (item.quest) || (item.noStash))
				return;

			delete item.pos;

			var stash = this.obj.stash;
			if (!stash.active)
				return;

			var clonedItem = extend(true, {}, item);
			this.destroyItem(id, null, true);
			stash.deposit(clonedItem);
		},

		salvageItem: function (id) {
			var item = this.findItem(id);
			if ((!item) || (item.material) || (item.quest) || (item.noSalvage) || (item.eq))
				return;

			var messages = [];

			var items = salvager.salvage(item);
			var iLen = items.length;

			if (!iLen)
				return;

			for (var i = 0; i < iLen; i++) {
				var material = items[i];

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
			var item = this.findItem(id);
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
			var item = this.findItem(id);
			if ((!item) || (item.noDrop) || (item.quest))
				return;

			delete item.pos;

			//Find close open position
			var x = this.obj.x;
			var y = this.obj.y;
			var dropCell = this.obj.instance.physics.getOpenCellInArea(x - 1, y - 1, x + 1, y + 1);
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
				var item = this.findItem(m.id);
				if (!item)
					return;

				item.pos = m.pos;
			}, this);
		},

		mailItem: function (msg) {
			var item = this.findItem(msg.itemId);
			if ((!item) || (item.noDrop) || (item.quest)) {
				this.resolveCallback(msg);
				return;
			}

			delete item.pos;

			var io = require('security/io');
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

		setItemPosition: function (id) {
			var item = this.findItem(id);
			if (!item)
				return;

			var iSize = this.inventorySize;
			for (var i = 0; i < iSize; i++) {
				if (!this.items.some(j => (j.pos == i))) {
					item.pos = i;
					break;
				}
			}
		},

		resolveCallback: function (msg, result) {
			var callbackId = (msg.callbackId != null) ? msg.callbackId : msg;
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
			var hasWeapon = this.items.some(function (i) {
				return (
					(i.spell) &&
					(i.spell.rolls) &&
					(i.spell.rolls.damage != null) &&
					((i.slot == 'twoHanded') || (i.slot == 'oneHanded'))
				);
			});

			if (!hasWeapon) {
				var item = generator.generate({
					type: classes.weapons[this.obj.class],
					quality: 0,
					spellQuality: 'basic'
				});
				item.eq = true;
				item.noSalvage = true;
				this.getItem(item);
			}

			classes.spells[this.obj.class].forEach(function (spellName) {
				var hasSpell = this.items.some(function (i) {
					return (
						(i.spell) &&
						(i.spell.name.toLowerCase() == spellName)
					);
				});

				if (!hasSpell) {
					var item = generator.generate({
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

			var bagCell = 50;

			var topQuality = 0;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var quality = items[i].quality;
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

			var obj = this.obj.instance.objects.buildObjects([{
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
				var nonEqItems = this.items.filter(f => !f.eq).length;
				return (nonEqItems < this.inventorySize);
			} else
				return true;
		},

		getItem: function (item, hideMessage, noStack) {
			events.emit('onBeforeGetItem', item, this.obj);

			//We need to know if a mob dropped it for quest purposes
			var fromMob = item.fromMob;

			if (item.quality == null)
				item.quality = 0;

			//Players can't have fromMob items in their inventory but bags can (dropped by a mob)
			if (this.obj.player)
				delete item.fromMob;

			//Store the quantity to send to the player
			var quantity = item.quantity;

			var exists = false;
			if (((item.material) || (item.quest) || (item.quantity)) && (!item.noStack) && (!item.uses) && (!noStack)) {
				var existItem = this.items.find(i => (i.name == item.name));
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
				var id = 0;
				var items = this.items;
				var iLen = items.length;

				if (!this.hasSpace()) {
					if (!hideMessage) {
						this.obj.instance.syncer.queue('onGetMessages', {
							id: this.obj.id,
							messages: [{
								class: 'q0',
								message: 'you bags are too full to loot any more items',
								type: 'info'
							}]
						}, [this.obj.serverId]);
					}

					return false;
				}

				for (var i = 0; i < iLen; i++) {
					var fItem = items[i];
					if (fItem.id >= id) {
						id = fItem.id + 1;
					}
				}
				item.id = id;

				if (item.eq)
					delete item.pos;

				if ((item.pos == null) && (!item.eq)) {
					var pos = iLen;
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
				var messages = [];

				var msg = item.name;
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
				var stats = Object.keys(item.stats);
				var sLen = stats.length
				for (var i = 0; i < sLen; i++) {
					var s = stats[i];
					var val = item.stats[s];
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
						var mtxUrl = mtx.get(e.mtx);
						var mtxModule = require(mtxUrl);

						e.events = mtxModule.events;
					} else if (e.type) {
						var effectUrl = itemEffects.get(e.type);
						var effectModule = require(effectUrl);

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

					//Don't do this check if we don't have a reputation cpn. That means this is most likely a bag
					if ((reputation) && (result.factions)) {
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
			var playerObject = this.obj.instance.objects.find(o => o.serverId == ownerId);
			if (!playerObject)
				return;

			//Get player's spells' statTypes
			var stats = [];
			playerObject.spellbook.spells.forEach(function (s) {
				var spellStatType = s.statType;
				if (!(spellStatType instanceof Array))
					spellStatType = [spellStatType];
				spellStatType.forEach(function (ss) {
					if (stats.indexOf(ss) == -1)
						stats.push(ss);
				});
			});

			var items = this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				delete items[i].eq;
				delete items[i].pos;
			}

			var blueprint = this.blueprint;

			var savedItems = extend(true, [], this.items);
			var instancedItems = extend(true, [], this.items);
			this.items = [];

			var dropEvent = {
				chanceMultiplier: 1,
				source: this.obj
			};
			playerObject.fireEvent('beforeGenerateLoot', dropEvent);

			if ((!blueprint.noRandom) || (blueprint.alsoRandom)) {
				var magicFind = (blueprint.magicFind || 0);
				var bonusMagicFind = killSource.stats.values.magicFind;

				var rolls = blueprint.rolls;
				var itemQuantity = killSource.stats.values.itemQuantity;
				rolls += ~~(itemQuantity / 100);
				if ((Math.random() * 100) < (itemQuantity % 100))
					rolls++;

				for (var i = 0; i < rolls; i++) {
					if (Math.random() * 100 >= (blueprint.chance || 35) * dropEvent.chanceMultiplier)
						continue;

					var itemBlueprint = {
						level: this.obj.stats.values.level,
						magicFind: magicFind,
						bonusMagicFind: bonusMagicFind
					};

					useItem = generator.generate(itemBlueprint);

					this.getItem(useItem);
				}
			}

			if (blueprint.noRandom) {
				var blueprints = blueprint.blueprints;
				for (var i = 0; i < blueprints.length; i++) {
					var drop = blueprints[i];
					if ((blueprint.chance) && (~~(Math.random() * 100) >= blueprint.chance * dropEvent.chanceMultiplier))
						continue;
					else if ((drop.maxLevel) && (drop.maxLevel < killSource.stats.values.level))
						continue;
					else if ((drop.chance) && (~~(Math.random() * 100) >= drop.chance * dropEvent.chanceMultiplier)) {
						continue;
					}

					drop.level = drop.level || this.obj.stats.values.level;
					drop.magicFind = magicFind;

					var item = drop;
					if ((!item.quest) && (item.type != 'key'))
						item = generator.generate(drop);

					if (!item.slot)
						delete item.level;

					this.getItem(item, true);
				}
			}

			playerObject.fireEvent('beforeTargetDeath', this.obj, this.items);
			events.emit('onBeforeDropBag', this.obj, this.items, killSource);

			if (this.items.length > 0)
				this.createBag(this.obj.x, this.obj.y, this.items, ownerId);

			this.items = savedItems;
		},

		giveItems: function (obj, hideMessage) {
			var objInventory = obj.inventory;

			var messages = [];

			var items = this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];

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
			var items = this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];

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
			var items = this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];

				if ((!item.eq) && (!item.active))
					continue;

				var effects = item.effects;
				if (!effects)
					continue;

				var eLen = effects.length;
				for (var j = 0; j < eLen; j++) {
					var effect = effects[j];

					var effectEvent = effect.events[event];
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

		save: function () {
			return {
				type: 'inventory',
				items: this.items
			};
		},

		simplify: function (self) {
			if (!self)
				return null;

			var reputation = this.obj.reputation;

			return {
				type: 'inventory',
				items: this.items
					.map(function (i) {
						var item = extend(true, {}, i);

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
								var faction = reputation.getBlueprint(f.id);
								var factionTier = reputation.getTier(f.id);

								var noEquip = null;
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
			var items = this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];
				if (!item.cd)
					continue;

				item.cd--;

				this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
			}
		}
	};
});
