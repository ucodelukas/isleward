const balance = {
	rat: {
		clawChance: 3
	},
	giantRat: {
		clawChance: 5
	},
	enragedRat: {
		clawChance: 80
	},
	stinktooth: {
		runestoneChance: 10,
		recipeChance: 3,
		shankChance: 0.2
	},
	bandit: {
		keyChance: 1
	},
	direRat: {
		clawChance: 7
	},
	bera: {
		recipeChance: 3,
		keyChance: 3
	}
};

module.exports = {
	name: 'The Fjolgard Sewer',
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
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: balance.rat.clawChance,
						name: 'Rat Claw',
						material: true,
						sprite: [3, 0],
						spritesheet: 'images/materials.png'
					}]
				}
			},

			rare: {
				name: 'Enraged Rat',
				cell: 24,

				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: balance.enragedRat.clawChance,
						name: 'Rat Claw',
						material: true,
						sprite: [3, 0],
						spritesheet: 'images/materials.png'
					}]
				}
			}
		},

		'giant rat': {
			faction: 'fjolgard',
			grantRep: {
				fjolgard: 6
			},
			level: 12,

			regular: {
				hpMult: 2,
				dmgMult: 1.2,

				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: balance.giantRat.clawChance,
						name: 'Rat Claw',
						material: true,
						sprite: [3, 0],
						spritesheet: 'images/materials.png'
					}]
				}
			},

			rare: {
				count: 0
			}
		},

		stinktooth: {
			faction: 'hostile',
			grantRep: {
				fjolgard: 15
			},
			level: 13,
			spawnCd: 1714,

			regular: {
				hpMult: 10,
				dmgMult: 3,

				drops: {
					rolls: 3,
					chance: 100,
					noRandom: true,
					alsoRandom: true,
					magicFind: [2000, 125],
					blueprints: [{
						chance: balance.stinktooth.shankChance,
						name: 'Putrid Shank',
						level: 13,
						quality: 4,
						slot: 'oneHanded',
						type: 'Dagger',
						spritesheet: '../../../images/legendaryItems.png',
						sprite: [0, 1],
						implicitStat: {
							stat: 'lifeOnHit',
							value: [5, 20]
						},
						effects: [{
							type: 'castSpellOnHit',
							rolls: {
								i_chance: [5, 20],
								spell: 'smokeBomb'
							}
						}]
					}, {
						chance: balance.stinktooth.recipeChance,
						type: 'recipe',
						name: 'Recipe: Rune of Whirlwind',
						profession: 'etching',
						teaches: 'runeWhirlwind'
					}, {
						chance: balance.stinktooth.runestoneChance,
						name: 'Muddy Runestone',
						material: true,
						sprite: [6, 0],
						spritesheet: 'images/materials.png'
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
				cdMax: 40
			}, {
				type: 'summonSkeleton',
				killMinionsOnDeath: false,
				killMinionsBeforeSummon: false,
				minionsDieOnAggroClear: true,
				needLos: false,
				sheetName: 'mobs',
				cdMax: 60,
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
					dmgPercent: 0.175,
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

			regular: {
				drops: {
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: balance.bandit.keyChance,
						type: 'key',
						noSalvage: true,
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1],
						quantity: 1
					}]
				}
			},

			rare: {
				name: 'Cutthroat'
			}
		},

		'dire rat': {
			level: 13,
			walkDistance: 0,
			faction: 'hostile',
			noQuest: true,
			grantRep: {
				fjolgard: 22
			},

			regular: {
				hpMult: 5,
				dmgMult: 1.2,

				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: balance.direRat.clawChance,
						name: 'Rat Claw',
						material: true,
						sprite: [3, 0],
						spritesheet: 'images/materials.png'
					}]
				}
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
			walkDistance: 0,

			regular: {
				hpMult: 3,
				dmgMult: 1.5,

				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: balance.bera.recipeChance,
						type: 'recipe',
						name: 'Recipe: Rune of Ambush',
						profession: 'etching',
						teaches: 'runeAmbush'
					}, {
						chance: balance.bera.keyChance,
						type: 'key',
						noSalvage: true,
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1],
						quantity: 1
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

		sewerdoor: {
			properties: {
				cpnDoor: {
					autoClose: 171,
					locked: true,
					key: 'rustedSewer',
					destroyKey: true
				}
			}
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
