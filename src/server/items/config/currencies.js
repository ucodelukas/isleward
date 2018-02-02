define([

], function (

) {
	return {
		currencies: {
			'Unstable Idol': {
				quantity: 1,
				quality: 1,
				description: 'Rerolls the stats on an item',
				material: true,
				sprite: [1, 8],
				action: 'reroll'
			},
			'Ascendant Idol': {
				quantity: 1,
				quality: 2,
				description: `Increases the level of an item`,
				material: true,
				sprite: [3, 8],
				action: 'relevel'
			},
			'Dragon-Glass Idol': {
				quantity: 1,
				quality: 3,
				description: `Rerolls an item's slot`,
				material: true,
				sprite: [6, 8],
				action: 'reslot'
			},
			'Bone Idol': {
				quantity: 1,
				quality: 3,
				description: `Rescales a weapon's damage`,
				material: true,
				sprite: [7, 8],
				action: 'reforge'
			}
		},

		chance: {
			'Unstable Idol': 37,
			'Ascendant Idol': 15,
			'Dragon-Glass Idol': 5,
			'Bone Idol': 6
		},

		getCurrencyFromAction: function (action) {
			var currencies = this.currencies;
			var pick = Object.keys(currencies).find(o => (currencies[o].action == action));

			return extend(true, {
				name: pick
			}, currencies[pick])
		}
	};
});
