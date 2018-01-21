module.exports = {
	name: 'Sewer',
	level: 8,

	mobs: {
		default: {
			faction: 'fjolgard',
			deathRep: -5
		},

		rat: {
			faction: 'flolgard',
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
						chance: 5,
						type: 'key',
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1]
					}]
				}
			},

			rare: {
				count: 0
			}
		},

		stinktooth: {
			faction: 'flolgard',
			grantRep: {
				fjolgard: 15
			},
			level: 13,

			regular: {
				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 1.5,
						type: 'key',
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1]
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
			faction: 'flolgard',
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

			rare: {
				count: 0
			}
		},

		'bera the blade': {
			faction: 'flolgard',
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
						name: 'Rusted Key',
						keyId: 'rustedSewer',
						singleUse: true,
						sprite: [12, 1]
					}]
				}
			},

			rare: {
				count: 0
			}
		},
	},
	objects: {
		sewerdoor: {
			properties: {
				cpnDoor: {
					locked: true,
					key: 'rustedSewer',
					destroyKey: true
				}
			}
		},
		sewerdoor: {
			properties: {
				cpnDoor: {
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
		}
	}
};
