module.exports = [{
	id: 'runeWhirlwind',
	name: 'Rune of Whirlwind',
	default: false,
	description: 'Wiggle-wiggly woo-woo.',
	item: {
		name: 'Rune of Whirlwind',
		generate: true,
		spell: true,
		spellName: 'whirlwind'
	},
	materials: [{
		name: 'Muddy Runestone',
		quantity: 1
	}, {
		name: 'Eagle Feather',
		quantity: 1
	}]
}, {
	id: 'runeAmbush',
	name: 'Rune of Ambush',
	default: false,
	description: 'Wiggle-wiggly woo-woo.',
	item: {
		name: 'Rune of Ambush',
		generate: true,
		spell: true,
		spellName: 'ambush'
	},
	materials: [{
		name: 'Muddy Runestone',
		quantity: 1
	}, {
		name: 'Rat Claw',
		quantity: 1
	}]
}];
