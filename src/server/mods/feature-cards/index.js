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

			var res = cards.getCard(dropper);
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
			var reward = cards.getReward(set);

			console.log(reward);

			obj.inventory.getItem(reward);
		}
	};
});
