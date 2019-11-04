module.exports = {
	name: 'Sewer',
	level: [11, 13],

	mobs: {
		default: {
			faction: 'fjolgard',
			deathRep: -5
		},

		rat: {
			faction: 'fjolgard',
			grantRep: {
				fjolgard: 6
			},
			level: 11,

			regular: {
				drops: {
					chance: 200,
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						name: 'Rat Claw',
						material: true,
						sprite: [3, 0],
						spritesheet: 'images/materials.png'
					}]
				}
			}
		},

		stinktooth: {
			faction: 'fjolgard',
			grantRep: {
				fjolgard: 15
			},
			level: 13,

			regular: {

			},

			rare: {
				count: 0
			},

			spells: [{
				type: 'whirlwind',
				range: 1
			}, {
				type: 'whirlwind',
				range: 1
			}]
		}
	},
	objects: {
		'stink carp school': {
			max: 3000,
			type: 'fish',
			quantity: [1, 3]
		}
	}
};
