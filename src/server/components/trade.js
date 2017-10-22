define([
	'items/generator',
	'items/generators/stats',
	'config/skins'
], function (
	generator,
	statGenerator,
	skins
) {
	return {
		type: 'trade',

		items: [],
		buyback: {},

		maxBuyback: 10,

		gold: 0,

		target: null,

		markup: {
			buy: 1,
			sell: 1
		},

		init: function (blueprint) {
			this.gold = blueprint.gold;

			(blueprint.forceItems || []).forEach(function (f, i) {
				var item = extend(true, {}, f);

				var id = 0;
				this.items.forEach(function (checkItem) {
					if (checkItem.id >= id)
						id = checkItem.id + 1;
				});

				if (item.type == 'skin') {
					var skinBlueprint = skins.getBlueprint(item.id);
					item.name = skinBlueprint.name;
					item.sprite = skinBlueprint.sprite;
					item.spritesheet = skinBlueprint.spritesheet;
					id = item.id;
				}

				item.id = id;

				this.items.push(item);
			}, this);

			if (!blueprint.items)
				return;

			this.markup = blueprint.markup;

			if (blueprint.faction) {
				this.obj.extendComponent('trade', 'factionVendor', blueprint);
				return;
			}

			var itemCount = blueprint.items.min + ~~(Math.random() * (blueprint.items.max - blueprint.items.min));
			for (var i = 0; i < itemCount; i++) {
				var level = 1;
				if (blueprint.level)
					level = blueprint.level.min + ~~(Math.random() * (blueprint.level.max - blueprint.level.min));

				var item = generator.generate({
					noSpell: true,
					level: level
				});

				var id = 0;
				this.items.forEach(function (checkItem) {
					if (checkItem.id >= id)
						id = checkItem.id + 1;
				});

				item.id = id;

				this.items.push(item);
			}
		},

		startBuy: function (msg) {
			var target = msg.target;

			if ((target == null) && (!msg.targetName))
				return false;

			if ((target != null) && (target.id == null))
				target = this.obj.instance.objects.objects.find(o => o.id == target);
			else if (msg.targetName)
				target = this.obj.instance.objects.objects.find(o => ((o.name) && (o.name.toLowerCase() == msg.targetName.toLowerCase())));

			this.target = null;

			if ((!target) || (!target.trade))
				return false;

			this.target = target;

			var itemList = target.trade.getItems(this.obj);
			var markup = target.trade.markup.sell;

			if (msg.action == 'buyback') {
				itemList = target.trade.buyback[this.obj.name] || [];
				markup = target.trade.markup.buy;
			}

			this.obj.syncer.set(true, 'trade', 'buyList', {
				markup: markup,
				items: itemList,
				buyback: (msg.action == 'buyback')
			});
		},

		buySell: function (msg) {
			if (msg.action == 'buy')
				this.buy(msg);
			else if (msg.action == 'sell')
				this.sell(msg);
			else if (msg.action == 'buyback')
				this.buyback(msg);
		},

		buy: function (msg) {
			var target = this.target;
			if (!target)
				return;

			var item = null
			var targetTrade = target.trade;
			var markup = targetTrade.markup.sell;

			if (msg.action == 'buyback') {
				item = targetTrade.findBuyback(msg.itemId, this.obj.name);
				markup = targetTrade.markup.buy;
			} else
				item = targetTrade.findItem(msg.itemId, this.obj.name);

			if (!item) {
				this.resolveCallback(msg);
				return;
			}

			var canAfford = false;
			if (item.worth.currency) {
				var currencyItem = this.obj.inventory.items.find(i => (i.name == item.worth.currency));
				canAfford = ((currencyItem) && (currencyItem.quantity >= item.worth.amount));
			} else
				canAfford = this.gold >= ~~(item.worth * markup);

			if (!canAfford) {
				this.obj.instance.syncer.queue('onGetMessages', {
					id: this.obj.id,
					messages: [{
						class: 'q0',
						message: `you can't afford that item`,
						type: 'info'
					}]
				}, [this.obj.serverId]);

				this.resolveCallback(msg);
				return;
			}

			if (!targetTrade.canBuy(msg.itemId, this.obj, msg.action)) {
				this.resolveCallback(msg);
				return;
			}

			if (item.type == 'skin') {
				var haveSkin = this.obj.auth.doesOwnSkin(item.id);

				if (haveSkin) {
					this.obj.instance.syncer.queue('onGetMessages', {
						id: this.obj.id,
						messages: [{
							class: 'q0',
							message: `you have already unlocked that skin`,
							type: 'info'
						}]
					}, [this.obj.serverId]);

					this.resolveCallback(msg);
					return;
				}
			}

			if (msg.action == 'buyback')
				targetTrade.removeBuyback(msg.itemId, this.obj.name);
			else if ((item.type != 'skin') && (!item.infinite))
				targetTrade.removeItem(msg.itemId, this.obj.name);

			if (item.worth.currency) {
				var currencyItem = this.obj.inventory.items.find(i => (i.name == item.worth.currency));
				this.obj.inventory.destroyItem(currencyItem.id, item.worth.amount, true);
			} else {
				targetTrade.gold += ~~(item.worth * markup);
				this.gold -= ~~(item.worth * markup);
				this.obj.syncer.set(true, 'trade', 'gold', this.gold);
			}

			if (item.type != 'skin') {
				if (!item.infinite)
					this.obj.syncer.setArray(true, 'trade', 'removeItems', item.id);

				var clonedItem = extend(true, {}, item);
				if (item.worth.currency)
					clonedItem.worth = 0;
				if ((item.stats) && (item.stats.stats)) {
					delete clonedItem.stats;
					statGenerator.generate(clonedItem, {});
				}

				delete clonedItem.infinite;

				this.obj.inventory.getItem(clonedItem);
			} else {
				this.obj.auth.saveSkin(item.id);

				this.obj.instance.syncer.queue('onGetMessages', {
					id: this.obj.id,
					messages: [{
						class: 'q0',
						message: item.name + ' (unlocked)',
						type: 'info'
					}]
				}, [this.obj.serverId]);
			}

			//Hack to always redraw the UI (to give items the red overlay if they can't be afforded)
			this.obj.syncer.setArray(true, 'trade', 'redraw', true);

			this.resolveCallback(msg);
		},

		buyback: function (msg) {
			msg.action = 'buyback';
			this.buy(msg);
		},

		sell: function (msg) {
			var target = this.target;
			if (!target)
				return;

			var targetTrade = target.trade;

			var item = this.obj.inventory.destroyItem(msg.itemId, 1);
			if (!item)
				return;

			var worth = ~~(item.worth * targetTrade.markup.buy);

			this.gold += worth;

			this.obj.syncer.set(true, 'trade', 'gold', this.gold);
			this.obj.syncer.setArray(true, 'trade', 'removeItems', item.id);

			var buyback = this.buyback;
			var name = this.obj.name;
			if (!buyback[name])
				buyback[name] = [];

			buyback[name].push(item);
			if (buyback[name].length > this.maxBuyback)
				buyback[name].splice(0, 1);
		},

		startSell: function (msg) {
			var target = msg.target;
			var targetName = (msg.targetName || '').toLowerCase();

			if ((target == null) && (!targetName))
				return false;

			if ((target != null) && (target.id == null))
				target = this.obj.instance.objects.objects.find(o => o.id == target);
			else if (targetName != null)
				target = this.obj.instance.objects.objects.find(o => ((o.name) && (o.name.toLowerCase() == targetName)));

			this.target = null;

			if ((!target) || (!target.trade))
				return false;

			this.target = target;

			this.obj.syncer.set(true, 'trade', 'sellList', {
				markup: target.trade.markup.buy,
				items: this.obj.inventory.items.filter(i => ((i.worth > 0) && (!i.eq)))
			});
		},

		startBuyback: function (msg) {
			msg.action = 'buyback';
			this.startBuy(msg);
		},

		removeItem: function (itemId) {
			return this.items.spliceFirstWhere(i => i.id == itemId);
		},

		removeBuyback: function (itemId, name) {
			return (this.buyback[name] || []).spliceFirstWhere(i => i.id == itemId);
		},

		getItems: function (requestedBy) {
			var reputation = requestedBy.reputation;

			var items = this.items.map(function (i) {
				var item = extend(true, {}, i);

				if (item.factions) {
					item.factions = item.factions.map(function (f) {
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

				return item;
			});

			return items;
		},

		canBuy: function (itemId, requestedBy, action) {
			return true;
		},

		findItem: function (itemId, sourceName) {
			return this.items.find(i => i.id == itemId);
		},

		findBuyback: function (itemId, sourceName) {
			return (this.buyback[sourceName] || []).find(i => i.id == itemId);
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

		simplify: function (self) {
			var result = {
				type: 'trade'
			};

			if (self)
				result.gold = this.gold;

			return result;
		},

		events: {
			beforeMove: function () {
				if (!this.target)
					return;

				this.obj.syncer.set(true, 'trade', 'closeTrade', true);

				this.target = null;
			}
		}
	};
});
