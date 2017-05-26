module.exports = {
	name: 'estuary',
	level: 20,
	addLevel: 0,
	resources: {},
	mobs: {
		default: {
			faction: 2,
			grantRep: {
				gaekatla: 3
			},

			regular: {
				dmgMult: 8,

				drops: {
					chance: 45,
					rolls: 1,
					magicFind: 70
				}
			}	
		},
		'cultist': {
			level: 7
		},
		'zealot': {
			level: 10
		},
		'cult leader': {
			level: 15,
			walkDistance: 0
		}
	},
	objects: {
		pinktile: {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['fc66f7', 'a24eff'],
									end: ['933159', '393268']
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
								chance: 0.04,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -20,
									y: -20,
									w: 60,
									h: 60
								}
							}
						}
					}
				}
			}
		}
	}
};