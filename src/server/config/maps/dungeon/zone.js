module.exports = {
	name: 'dungeon',
	level: [18, 20],

	mobs: {
		default: {
			faction: 'hostile',
			grantRep: {
				gaekatla: 15
			},

			regular: {
				hpMult: 4,
				dmgMult: 2.2,

				drops: {
					chance: 45,
					rolls: 1,
					magicFind: 500
				}
			},

			rare: {
				hpMult: 7,
				dmgMult: 3,

				drops: {
					chance: 100,
					rolls: 1,
					magicFind: 2000
				}
			}
		},
		snekk: {
			level: 15
		},

		snekkboss: {
			level: 15,
		}
	}
};
