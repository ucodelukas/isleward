define([
	'mods/feature-cards/cards'
], function (
	cards
) {
	return {
		name: 'Feature: Cards',

		extraScripts: [
			'cards'
		],

		init: function () {
			cards.init();

			this.events.on('onBeforeDropBag', this.onBeforeDropBag.bind(this));
			this.events.on('onGetCardSetReward', this.onGetCardSetReward.bind(this));
			this.events.on('onBeforeGetItem', this.onBeforeGetItem.bind(this));
		},

		onBeforeDropBag: function (dropper, items, looter) {
			if (!looter.player)
				return;

			var dropEvent = {
				chanceMultiplier: 1,
				source: dropper
			};
			looter.fireEvent('beforeGenerateLoot', dropEvent);
			if (Math.random() >= dropEvent.chanceMultiplier)
				return;

			var res = cards.getCard(looter, dropper);
			if (!res)
				return;

			items.push(res);
		},

		onBeforeGetItem: function (item, obj) {
			if ((!obj.player) && (item.type != 'Reward Card'))
				return;

			cards.fixCard(item);
		},

		onGetCardSetReward: function (set, obj) {
			var reward = cards.getReward(obj, set);
			if (!reward.push)
				reward = [reward];

			reward.forEach(r => obj.inventory.getItem(r));
		}
	};
});
