var balance = {
	mobs: {
		violetSerpent: {
			level: 5,
			slowTtl: 20,
			slowCd: 50,
			slowChance: 0.85
		},
		scarletSerpent: {
			level: 5
		},
		viridianSerpent: {
			level: 5
		}
	}
};

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

		'violet serpent': {
			level: balance.mobs.violetSerpent.level,

			spells: [{
				type: 'melee',
				element: 'poison'
			}, {
				statMult: 0.2,
				element: 'poison',
				cdMax: balance.mobs.violetSerpent.slowCd,
				type: 'projectile',
				row: 5,
				col: 4,
				applyEffect: {
					type: 'slowed',
					chance: balance.mobs.violetSerpent.slowChance,
					ttl: balance.mobs.violetSerpent.slowTtl
				},
				particles: {
					color: {
						start: ['a24eff', '7a3ad3'],
						end: ['7a3ad3', '533399']
					},
					scale: {
						start: {
							min: 2,
							max: 12
						},
						end: {
							min: 0,
							max: 6
						}
					},
					lifetime: {
						min: 2,
						max: 4
					},
					alpha: {
						start: 0.7,
						end: 0
					},
					speed: {
						start: {
							min: 4,
							max: 24
						},
						end: {
							min: 0,
							max: 12
						}
					},
					startRotation: {
						min: 0,
						max: 360
					},
					rotationSpeed: {
						min: 0,
						max: 360
					},
					randomScale: true,
					randomColor: true,
					randomSpeed: true,
					chance: 0.55,
					spawnType: 'circle',
					spawnCircle: {
						x: 0,
						y: 0,
						r: 8
					}
				}
			}]
		},

		'scarlet serpent': {
			level: balance.mobs.scarletSerpent.level,

			spells: [{
				type: 'melee',
				element: 'poison'
			}, {
				type: 'charge',
				targetFurthest: true,
				stunDuration: 0,
				statMult: 0.1
			}]
		},

		'viridian serpent': {
			level: balance.mobs.viridianSerpent.level,

			spells: [{
				type: 'melee',
				element: 'poison'
			}, {
				type: 'charge',
				targetFurthest: true,
				stunDuration: 0,
				statMult: 0.1
			}]
		},
	}
};
