const hpMult = 8;
const dmgMult = 1.5;

let balance = {
	hpMult: hpMult,
	dmgMult: dmgMult,

	mobs: {
		rare: {
			dmgMult: 1.25,
			wandChance: 1000
		},

		albinoSerpent: {
			name: 'Albino Serpent',
			cell: 82,
			count: 100,
			chance: 100,
			hpMult: hpMult * 1.5,
			dmgMult: dmgMult * 1.5,

			drops: {
				noRandom: true,
				alsoRandom: true,
				blueprints: [{
					chance: 100,
					name: 'Gaekatlan Offshoot',
					level: 20,
					quality: 4,
					slot: 'oneHanded',
					type: 'Wand',
					sprite: [8, 6],
					implicitStat: {
						stat: 'lifeOnHit',
						value: [5, 20]
					},
					effects: [{
						type: 'doubleProjectile',
						rolls: {
							i_chance: [5, 25],
							spellName: 'Magic Missile'
						}
					}]
				}]
			}
		},

		violetSerpent: {
			level: 20,
			hpMult: hpMult * 1,

			meleeDmg: 0.02,
			meleeCd: 5,
			meleeElement: null,
			slowDmg: 0.2,
			slowTtl: 20,
			slowCd: 50,
			slowChance: 0.5,
			slowElement: 'poison'
		},

		scarletSerpent: {
			level: 20,
			hpMult: hpMult * 1.25,

			meleeDmg: 0.035,
			meleeCd: 5,
			meleeElement: null,
			chargeDmg: 0.4,
			chargeCd: 25,
			chargeElement: null,
			chargeStunDuration: 0
		},

		viridianSerpent: {
			level: 20,
			hpMult: hpMult * 0.75,

			spitCd: 9,
			spitDmg: 0.12,
			spitDotDuration: 11,
			spitDotAmount: 20,
			spitElement: 'poison',
			poolDuration: 40,
			poolDmg: 0.01,
			poolElement: 'poison'
		}
	}
};

module.exports = {
	name: 'dungeon',
	level: [18, 20],

	mobs: {
		default: {
			faction: 'hostile',
			walkDistance: 0,
			grantRep: {
				gaekatla: 15
			},

			spells: [{
				type: 'melee',
				statMult: 1
			}],

			regular: {
				hpMult: balance.hpMult,
				dmgMult: balance.dmgMult,

				drops: {
					chance: 45,
					rolls: 1,
					magicFind: 500
				}
			},

			rare: {
				hpMult: balance.hpMult * 1.25,
				dmgMult: balance.dmgMult * 1.25
			}
		},

		'violet serpent': {
			level: balance.mobs.violetSerpent.level,

			regular: {
				hpMult: balance.mobs.violetSerpent.hpMult
			},

			rare: balance.mobs.albinoSerpent,

			spells: [{
				type: 'melee',
				element: balance.mobs.violetSerpent.meleeElement,
				damage: balance.mobs.violetSerpent.meleeDmg,
				cdMax: balance.mobs.violetSerpent.meleeCd
			}, {
				damage: balance.mobs.violetSerpent.slowDmg,
				element: balance.mobs.violetSerpent.slowElement,
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

			regular: {
				hpMult: balance.mobs.scarletSerpent.hpMult
			},

			rare: balance.mobs.albinoSerpent,

			spells: [{
				type: 'melee',
				element: balance.mobs.scarletSerpent.meleeElement,
				damage: balance.mobs.scarletSerpent.meleeDmg,
				cdMax: balance.mobs.scarletSerpent.meleeCd
			}, {
				type: 'charge',
				targetFurthest: true,
				element: balance.mobs.scarletSerpent.chargeElement,
				stunDuration: balance.mobs.scarletSerpent.chargeStunDuration,
				damage: balance.mobs.scarletSerpent.chargeDmg,
				cdMax: balance.mobs.scarletSerpent.chargeCd
			}]
		},

		'viridian serpent': {
			level: balance.mobs.viridianSerpent.level,

			regular: {
				hpMult: balance.mobs.viridianSerpent.hpMult
			},

			rare: balance.mobs.albinoSerpent,

			spells: [{
				type: 'smokeBomb',
				element: balance.mobs.viridianSerpent.poolElement,
				castOnDeath: true,
				duration: balance.mobs.viridianSerpent.poolDuration,
				damage: balance.mobs.viridianSerpent.poolDmg
			}, {
				damage: balance.mobs.viridianSerpent.spitDmg,
				element: balance.mobs.viridianSerpent.spitElement,
				cdMax: balance.mobs.viridianSerpent.spitCd,
				type: 'projectile',
				row: 5,
				col: 4,
				applyEffect: {
					type: 'lifeDrain',
					element: 'poison',
					ttl: balance.mobs.viridianSerpent.spitDotDuration,
					amount: balance.mobs.viridianSerpent.spitDotAmount
				},
				targetRandom: true,
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
		}
	},

	objects: {
		greencandle: {
			components: {
				cpnLight: {
					simplify: function () {
						return {
							type: 'light',
							blueprint: {
								color: {
									start: ['80f643'],
									end: ['4ac441', '51fc9a', 'd07840']
								},
								lifetime: {
									min: 2,
									max: 6
								}
							}
						};
					}
				}
			}
		}
	}
};
