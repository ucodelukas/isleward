module.exports = {
	name: 'Sewer',
	level: [11, 13],

	resources: {
		Stinkcap: {
			type: 'herb',
			max: 3
		}
	},

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
					}, {
						chance: 200,
						name: 'Muddy Runestone',
						material: true,
						sprite: [6, 0],
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
						}, {
							chance: 100,
							type: 'recipe',
							name: 'Recipe: Rune of Whirlwind',
							profession: 'etching',
							teaches: 'runeWhirlwind'
						}]
					}]
				}
			},

			rare: {
				count: 0
			},

			spells: [{
				type: 'melee',
				statMult: 1,
				damage: 0.08
			}, {
				type: 'whirlwind',
				range: 2,
				damage: 0.2,
				cdMax: 50
			}, {
				type: 'summonSkeleton',
				killMinionsOnDeath: false,
				killMinionsBeforeSummon: false,
				needLos: false,
				sheetName: 'mobs',
				cdMax: 50,
				positions: [[30, 30], [40, 30], [30, 40], [40, 40]],
				summonTemplates: [{
					name: 'Biter Rat',
					cell: 16,
					hpPercent: 20,
					dmgPercent: 0.1,
					basicSpell: 'melee'
				}, {
					name: 'Spitter Rat',
					cell: 24,
					hpPercent: 10,
					dmgPercent: 0.2,
					basicSpell: 'projectile'
				}]
			}, {
				type: 'charge',
				castOnEnd: 1,
				cdMax: 50,
				targetRandom: true,
				damage: 0.3
			}, {
				type: 'fireblast',
				range: 2,
				damage: 0.001,
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
				drops: {
					chance: 100,
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 100,
						type: 'recipe',
						name: 'Recipe: Rune of Ambush',
						profession: 'etching',
						teaches: 'runeAmbush'
					}]
				}
			},

			rare: {
				count: 0
			}
		}
	},
	objects: {
		'mudfish school': {
			max: 9,
			type: 'fish',
			quantity: [6, 12]
		},

		bubbles: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['51fc9a', '80f643'],
									end: ['386646', '44cb95']
								},
								scale: {
									start: {
										min: 2,
										max: 8
									},
									end: {
										min: 2,
										max: 4
									}
								},
								speed: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 4
									}
								},
								lifetime: {
									min: 1,
									max: 3
								},
								alpha: {
									start: 0.5,
									end: 0
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.2,
								randomColor: true,
								spawnType: 'rect',
								blendMode: 'screen',
								spawnRect: {
									x: -40,
									y: -40,
									w: 80,
									h: 80
								}
							}
						};
					}
				}
			}
		},

		gas: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['c0c3cf', '80f643'],
									end: ['386646', '69696e']
								},
								scale: {
									start: {
										min: 18,
										max: 64
									},
									end: {
										min: 8,
										max: 24
									}
								},
								speed: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 4
									}
								},
								lifetime: {
									min: 4,
									max: 24
								},
								alpha: {
									start: 0.05,
									end: 0
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.02,
								randomColor: true,
								spawnType: 'rect',
								blendMode: 'screen',
								spawnRect: {
									x: -80,
									y: -80,
									w: 160,
									h: 160
								}
							}
						};
					}
				}
			}
		}
	}
};
