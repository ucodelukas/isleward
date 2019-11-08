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
			faction: 'hostile',
			grantRep: {
				fjolgard: 15
			},
			level: 13,

			regular: {
				hpMult: 10,
				dmgMult: 3,

				drops: {
					chance: 100,
					rolls: 3,
					noRandom: true,
					alsoRandom: true,
					magicFind: [2000, 125],
					blueprints: [{
						name: 'Putrid shank',
						level: 13,
						quality: 4,
						slot: 'oneHanded',
						type: 'Dagger',
						implicitStat: {
							stat: 'lifeOnHit',
							value: [5, 20]
						},
						effects: [{
							type: 'castSpellOnHit',
							rolls: {
								i_chance: [20, 60],
								spell: 'smokeBomb'
							}
						}]
					}]
				}
			},

			rare: {
				count: 0
			},

			spells: [{
				type: 'whirlwind',
				range: 2
			}, {
				type: 'charge',
				castOnEnd: 3
			}, {
				type: 'summonSkeleton',
				killMinionsOnDeath: false,
				killMinionsBeforeSummon: false,
				needLos: false,
				count: 4,
				sheetName: 'mobs',
				cell: 16,
				positions: [[30, 30], [40, 30], [30, 40], [40, 40]]
			}, {
				type: 'fireblast',
				range: 2,
				procCast: true
			}]
		}
	},
	objects: {
		'stink carp school': {
			max: 1,
			type: 'fish',
			quantity: [1, 3]
		}
	}
};
