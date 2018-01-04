module.exports = {
	name: 'Sewer',
	level: 8,

	mobs: {
		default: {
			faction: 'fjolgard',
			deathRep: -5
		},

		'rat': {
			faction: 'flolgard',
			grantRep: {
				fjolgard: 6
			},
			level: 10,

			regular: {
				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 8,
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

		'stinktooth': {
			faction: 'flolgard',
			grantRep: {
				fjolgard: 15
			},
			level: 12,

			regular: {
				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 2.5,
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
		}
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
