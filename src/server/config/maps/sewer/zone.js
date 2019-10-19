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
					rolls: 2,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 2,
						type: 'key',
						noSalvage: true,
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1],
						quantity: 1
					}, {
						chance: 200,
						name: 'Muddy Runestone',
						material: true,
						sprite: [6, 0],
						spritesheet: 'images/materials.png'
					}, {
						chance: 100,
						type: 'recipe',
						name: 'Recipe: Noxious Oil',
						profession: 'alchemy',
						teaches: 'noxiousOil'
					}]
				}
			},

			rare: {
				count: 0
			}
		},

		stinktooth: {
			faction: 'fjolgard',
			grantRep: {
				fjolgard: 15
			},
			level: 13,

			regular: {
				drops: {
					rolls: 1,
					noRandom: true,
					chance: 100,
					alsoRandom: true,
					blueprints: [{
						chance: 0.5,
						type: 'key',
						noSalvage: true,
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1],
						quantity: 1
					}, {
						chance: 100,
						type: 'recipe',
						name: 'Recipe: Rune of Whirlwind',
						profession: 'etching',
						teaches: 'runeWhirlwind'
					}]
				}
			},

			rare: {
				chance: 4,
				name: 'Steelclaw',
				cell: 59
			}
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
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 100,
						type: 'key',
						noSalvage: true,
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1],
						quantity: 1
					}, {
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
		banditdoor: {
			properties: {
				cpnDoor: {}
			}
		},
		vaultdoor: {
			properties: {
				cpnDoor: {}
			}
		},

		etchbench: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['ff4252', 'ff4252'],
									end: ['a82841', 'a82841']
								},
								scale: {
									start: {
										min: 2,
										max: 10
									},
									end: {
										min: 0,
										max: 2
									}
								},
								speed: {
									start: {
										min: 4,
										max: 16
									},
									end: {
										min: 2,
										max: 8
									}
								},
								lifetime: {
									min: 1,
									max: 4
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.2,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -15,
									y: -28,
									w: 30,
									h: 8
								}
							}
						};
					}
				},
				cpnWorkbench: {
					type: 'etching'
				}
			}
		},

		treasure: {
			cron: '0 2 * * *'
		}
	}
};
