module.exports = [{
	item: {
		name: 'Minor Healing Potion',
		type: 'consumable',
		sprite: [0, 1],
		description: 'Does not affect emotional scars.',
		worth: 0,
		noSalvage: true,
		noAugment: true,
		uses: 1,
		effects: [{
			type: 'gainStat',
			rolls: {
				stat: 'hp',
				amount: '50%'
			}
		}]
	},
	materials: [{
		name: 'Skyblossom',
		quantity: 3
	}, {
		name: 'Empty Vial',
		quantity: 1
	}]
}];
