const baseRecipes = {
	carp: {
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
				rolls: {
					stat: 'hp',
					amount: 50
				}
			}]
		},
		materials: [{
			quantity: 1
		}, {
			name: 'Skewering Stick',
			quantity: 1
		}]
	}
};

module.exports = [
	extend(true, {}, baseRecipes.carp, {
		item: {
			name: 'Carp on a Stick'
		},
		materials: [{
			name: 'Sun Carp'
		}]
	}),
	extend(true, {}, baseRecipes.carp, {
		item: {
			name: 'Big Carp on a Stick'
		},
		materials: [{
			name: 'Big Sun Carp'
		}]
	}),
	extend(true, {}, baseRecipes.carp, {
		item: {
			name: 'Gaint Carp on a Stick'
		},
		materials: [{
			name: 'Gaint Sun Carp'
		}]
	}),
	extend(true, {}, baseRecipes.carp, {
		item: {
			name: 'Trophy Carp on a Stick'
		},
		materials: [{
			name: 'Trophy Sun Carp'
		}]
	}),
	extend(true, {}, baseRecipes.carp, {
		item: {
			name: 'Fabled Carp on a Stick'
		},
		materials: [{
			name: 'Fabled Sun Carp'
		}]
	})
];
