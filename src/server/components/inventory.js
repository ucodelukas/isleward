define([
	'items/generator',
	'items/salvager',
	'items/enchanter',
	'objects/objects',
	'config/classes'
], function(
	generator,
	salvager,
	enchanter,
	objects,
	classes
) {
	return {
		type: 'inventory',

		inventorySize: 50,
		items: [],

		blueprint: null,

		init: function(blueprint, isTransfer) {
			var items = blueprint.items || [];
			var iLen = items.length;

			//Spells should be sorted so they're EQ'd in the right order
			items.sort(function(a, b) {
				var aId = (a.spellId != null) ? ~~a.spellId : 9999;
				var bId = (b.spellId != null) ? ~~b.spellId : 9999;
				return (aId - bId);
			});

			for (var i = 0; i < iLen; i++) {
				var item = items[i];

				//Hacks for old items
				if (((item.spell) && (!item.spell.rolls)) || (!item.sprite)) {
					items.splice(i, 1);
					i--;
					iLen--;
					continue;
				} else if ((item.spell) && (item.type == 'Spear')) {
					item.spell.properties = item.spell.properties || {};
					item.spell.properties.range = item.range;
				} else if (item.quantity == NaN)
					item.quantity = 1;
			}

			this.hookItemEvents(items);

			for (var i = 0; i < iLen; i++) {
				this.getItem(items[i], true);
			}

			if ((this.obj.player) && (!isTransfer))
				this.getDefaultAbilities();

			delete blueprint.items;

			this.blueprint = blueprint;
		},

		transfer: function() {
			this.hookItemEvents();
		},

		hookItemEvents: function(items) {
			var items = items || this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];

				if (item.effects) {
					item.effects.forEach(function(e) {
						var faction = require('config/factions/' + e.factionId);
						var statGenerator = faction.uniqueStat;
						statGenerator.generate(item);
					});
				}
			}

		},

		//Client Actions

		enchantItem: function(msg) {
			var item = this.findItem(msg.itemId);
			if ((!item) || (!item.slot) || (item.eq) || ((msg.action == 'scour') && (item.power == 0))) {
				this.resolveCallback(msg);
				return;
			}

			enchanter.enchant(this.obj, item, msg);
		},

		getEnchantMaterials: function(msg) {
			var result = [];
			var item = this.findItem(msg.itemId);
			if ((item) && (item.slot))
				result = enchanter.getEnchantMaterials(item, msg.action);

			this.resolveCallback(msg, result);
		},

		learnAbility: function(itemId, runeSlot) {
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

			var spellbook = this.obj.spellbook;

			if (item.slot == 'twoHanded')
				runeSlot = 0;
			else if (runeSlot == null) {
				if (!this.items.some(i => (i.runeSlot == 2)))
					runeSlot = 2;
				else
					runeSlot = 1;
			}

			var currentEq = this.items.find(i => (i.runeSlot == runeSlot));
			if (currentEq) {
				spellbook.removeSpellById(runeSlot);
				delete currentEq.eq;
				delete currentEq.runeSlot;
				this.obj.syncer.setArray(true, 'inventory', 'getItems', currentEq);
			}

			item.eq = true;
			item.runeSlot = runeSlot;
			spellbook.addSpellFromRune(item.spell, runeSlot);
			this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
		},

		unlearnAbility: function(itemId) {
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
			this.obj.syncer.setArray(true, 'inventory', 'getItems', item);
		},

		stashItem: function(id) {
			var item = this.findItem(id);
			if ((!item) || (item.quest) || (item.noSalvage))
				return;

			delete item.pos;

			var stash = this.obj.stash;
			if (!stash.active)
				return;

			var clonedItem = extend(true, {}, item);
			this.destroyItem(id);
			stash.deposit(clonedItem);
		},

		salvageItem: function(id) {
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

		destroyItem: function(id, amount) {
			var item = this.findItem(id);
			if (!item)
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

			if (this.obj.player)
				this.getDefaultAbilities();

			this.obj.fireEvent('afterDestroyItem', item, amount);

			return item;
		},

		dropItem: function(id) {
			var item = this.findItem(id);
			if (!item)
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

		moveItem: function(msgs) {
			msgs.forEach(function(m) {
				var item = this.findItem(m.id);
				if (!item)
					return;

				item.pos = m.pos;
			}, this);
		},

		//Helpers

		resolveCallback: function(msg, result) {
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

		findItem: function(id) {
			if (id == null)
				return null;

			return this.items.find(i => i.id == id);
		},

		getDefaultAbilities: function() {
			var hasWeapon = this.items.some(function(i) {
				return (
					(i.spell) &&
					(i.spell.rolls) &&
					(i.spell.rolls.damage != null) &&
					(i.slot == 'twoHanded')
				);
			});

			if (!hasWeapon) {
				var item = generator.generate({
					slot: 'twoHanded',
					type: classes.weapons[this.obj.class],
					quality: 0,
					spellQuality: 'mid'
				});
				item.eq = true;
				item.noSalvage = true;
				this.getItem(item);
			}

			classes.spells[this.obj.class].forEach(function(spellName) {
				var hasSpell = this.items.some(function(i) {
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

		createBag: function(x, y, items, ownerId) {
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
						ownerId: ownerId
					},
					cpnInventory: {
						items: extend(true, [], items)
					}
				}
			}]);

			return obj;
		},

		getItem: function(item, hideMessage) {
			//We need to know if a mob dropped it for quest purposes
			var fromMob = item.fromMob;

			if (item.quality == null)
				item.quality = 0;

			//Players can't have fromMob items in their inventory but bags can (dropped by a mob)
			if (this.obj.player)
				delete item.fromMob;

			//Store the quantity to send to the player
			var quantity = item.quantity;

			//Material?
			var exists = false;
			if (((item.material) || (item.quest)) && (item.stackable)) {
				var existItem = this.items.find(i => i.name == item.name);
				if (existItem) {
					exists = true;
					if (!existItem.quantity)
						existItem.quantity = 1;
					existItem.quantity += (item.quantity || 1);
					item = existItem;
				}
			}

			//Get next id
			if (!exists) {
				var id = 0;
				var items = this.items;
				var iLen = items.length;

				var nonEqItems = items.filter(f => !f.eq).length;

				if ((nonEqItems >= this.inventorySize) && (!hideMessage)) {
					this.obj.instance.syncer.queue('onGetMessages', {
						id: this.obj.id,
						messages: [{
							class: 'q0',
							message: 'you bags are too full to loot any more items',
							type: 'info'
						}]
					}, [this.obj.serverId]);

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
				messages.push({
					class: 'q' + item.quality,
					message: 'loot (' + msg + ')',
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
						result.factions = result.factions.map(function(f) {
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

		dropBag: function(ownerId, killSource) {
			if (!this.blueprint)
				return;

			//Only drop loot if this player is in the zone
			var playerObject = this.obj.instance.objects.find(o => o.serverId == ownerId);
			if (!playerObject)
				return;

			//Get player's spells' statTypes
			var stats = [];
			playerObject.spellbook.spells.forEach(function(s) {
				var spellStatType = s.statType;
				if (!(spellStatType instanceof Array))
					spellStatType = [spellStatType];
				spellStatType.forEach(function(ss) {
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

			if ((!blueprint.noRandom) || (blueprint.alsoRandom)) {
				var magicFind = (blueprint.magicFind || 0);
				var bonusMagicFind = killSource.stats.values.magicFind;
				for (var i = 0; i < blueprint.rolls; i++) {
					if (Math.random() * 100 >= (blueprint.chance || 35))
						continue;

					var useItem = null;
					if (Math.random() < generator.spellChance) {
						useItem = instancedItems
							.filter(item => item.ability);
						if (useItem.length > 0)
							useItem = useItem[~~(Math.random() * useItem.length)];
					}

					if (!useItem) {
						var slot = generator.pickRandomSlot();
						var useItem = instancedItems.find(item => item.slot == slot);
					}

					if (!useItem)
						useItem = instancedItems[~~(Math.random() * iLen)];
					iLen--;
					instancedItems.spliceWhere(item => item == useItem);

					//Spells don't have stats
					if (useItem.stats)
						delete useItem.stats.armor;

					var itemBlueprint = {
						level: useItem.level,
						slot: useItem.slot,
						type: useItem.type,
						spell: !!useItem.ability,
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
					if ((blueprint.chance) && (~~(Math.random() * 100) >= blueprint.chance))
						continue;

					if ((drop.maxLevel) && (drop.maxLevel < killSource.stats.values.level))
						continue;

					drop.level = drop.level || this.obj.stats.values.level;
					drop.magicFind = magicFind;

					var item = drop;
					if (!item.quest)
						item = generator.generate(drop);

					this.getItem(item, true);
				}
			}

			killSource.fireEvent('beforeTargetDeath', this.obj, this.items);

			if (this.items.length > 0)
				this.createBag(this.obj.x, this.obj.y, this.items, ownerId);

			this.items = savedItems;
		},

		giveItems: function(obj, hideMessage) {
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

		rollItems: function(party) {
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

		fireEvent: function(event, args) {
			var items = this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];
				if (!item.eq)
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

		clear: function() {
			delete this.items;
			this.items = [];
		},

		save: function() {
			return {
				type: 'inventory',
				items: this.items
			};
		},

		simplify: function(self) {
			if (!self)
				return null;

			var reputation = this.obj.reputation;

			return {
				type: 'inventory',
				items: this.items
					.map(function(i) {
						if (!i.effects)
							return i;
						else {
							var item = extend(true, {}, i);
							item.effects = item.effects.map(e => ({
								factionId: e.factionId,
								text: e.text,
								properties: e.properties
							}));
							if (item.factions) {
								item.factions = item.factions.map(function(f) {
									var faction = reputation.getBlueprint(f.id);
									var factionTier = reputation.getTier(f.id);

									var noEquip = null;
									if (factionTier < f.tier)
										noEquip = true;

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
						}
					})
			};
		}
	};
});