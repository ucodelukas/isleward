define([

], function (

) {
	return {
		currencies: {
			'Unstable Totem': {
				name: 'Unstable Totem',
				quantity: 1,
				quality: 1,
				description: 'Rerolls the stats on an item',
				material: true,
				sprite: [1, 8]
			},
			'Ascendant Totem': {
				name: 'Ascendant Totem',
				quantity: 1,
				quality: 2,
				description: `Rerolls the level of an item`,
				material: true,
				sprite: [3, 8]
			},
			"Gambler's Totem": {
				name: "Gambler's Totem",
				quantity: 1,
				quality: 3,
				description: `Rerolls an item's slot`,
				material: true,
				sprite: [6, 8]
			},
			"Brawler's Totem": {
				name: "Brawler's Totem",
				quantity: 1,
				quality: 3,
				description: `Rerolls a weapon's ability`,
				material: true,
				sprite: [7, 8]
			}
		},

		chance: {
			'Unstable Totem': 37,
			'Ascendant Totem': 15,
			"Gambler's Totem": 5,
			"Brawler's Totem": 6
		}
	};
});
