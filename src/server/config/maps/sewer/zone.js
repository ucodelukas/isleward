module.exports = {
	name: 'Sewer',
	level: [11, 13],

	mobs: {
		default: {
			faction: 'fjolgard',
			deathRep: -5
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
