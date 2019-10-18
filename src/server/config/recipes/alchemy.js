module.exports = [{
	name: 'Minor Healing Potion',
	description: 'Does not affect emotional scars.',
	item: {
		name: 'Minor Healing Potion',
		type: 'consumable',
		sprite: [0, 1],
		description: 'Does not affect emotional scars.',
		worth: 0,
		noSalvage: true,
		noAugment: true,
		uses: 1,
		cdMax: 85,
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
}, {
	id: 'runeAmbush',
	name: 'Stinky Oil',
	description: 'Makes your weapon both stinkier, and hurtier.',
	default: false,
	item: {
		name: 'Stinky Oil',
		type: 'consumable',
		sprite: [0, 1],
		description: 'Makes your weapon both stinkier, and hurtier.',
		worth: 0,
		noSalvage: true,
		noAugment: true,
		uses: 1,
		cdMax: 85,
		effects: [{
			type: 'augmentWeapon',
			rolls: {
				duration: 500
			}
		}]
	},
	materials: [{
		name: 'Stink Carp',
		quantity: 3
	}, {
		name: 'Empty Vial',
		quantity: 1
	}]
}];
