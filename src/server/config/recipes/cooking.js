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
					stat: 'hp'
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

const buildRecipe = function (recipeName, itemName, effectAmount, materialName) {
	return extend(true, {}, baseRecipes[recipeName], {
		item: {
			name: itemName,
			effects: [{
				rolls: {
					amount: effectAmount
				}
			}]
		},
		materials: [{
			name: materialName
		}]
	});
};

module.exports = [
	buildRecipe('carp', 'Carp on a Stick', 10, 'Sun Carp'),
	buildRecipe('carp', 'Big Carp on a Stick', 25, 'Big Sun Carp'),
	buildRecipe('carp', 'Giant Carp on a Stick', 50, 'Giant Sun Carp'),
	buildRecipe('carp', 'Trophy Carp on a Stick', 100, 'Trophy Sun Carp'),
	buildRecipe('carp', 'Fabled Carp on a Stick', 200, 'Fabled Sun Carp')
];
