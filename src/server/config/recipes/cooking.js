module.exports = [{
	item: {
		name: 'Carp on a Stick',
		type: 'consumable',
		sprite: [0, 9],
		description: 'It\'s a fish on a stick, what more do you want to know?',
		worth: 0,
		noSalvage: true,
		noAugment: true,
		uses: 1,
		effects: [{
			type: 'gainStat',
			stat: 'hp',
			amount: '100%'
		}]
	},
	materials: [{
		nameLike: 'Sun Carp',
		quantity: 1,
		weightMultiplier: 1
	}, {
		name: 'Skewering Stick',
		quantity: 1
	}]
}];
