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
				type: 'melee'
			}, {
				type: 'whirlwind',
				range: 2
			}, {
				type: 'summonSkeleton',
				killMinionsOnDeath: false,
				killMinionsBeforeSummon: false,
				needLos: false,
				count: 4,
				sheetName: 'mobs',
				cdMax: 30,
				cell: 16,
				hpPercent: 10,
				positions: [[30, 30], [40, 30], [30, 40], [40, 40]]
			}, {
				type: 'charge',
				castOnEnd: 1,
				cdMax: 30,
				targetRandom: true
			}, {
				type: 'fireblast',
				range: 2,
				damage: 0.01,
				pushback: 2,
				procCast: true
			}]
		},

		bandit: {
			faction: 'hostile',
			grantRep: {
				fjolgard: 18
			},
			level: 11,

			rare: {
				count: 0
			}
		},

		whiskers: {
			level: 13,
			faction: 'hostile',
			grantRep: {
				fjolgard: 22
			},

			rare: {
				count: 0
			}
		},

		'bera the blade': {
			faction: 'hostile',
			grantRep: {
				fjolgard: 25
			},
			level: 14,

			regular: {

			},

			rare: {
				count: 0
			}
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
