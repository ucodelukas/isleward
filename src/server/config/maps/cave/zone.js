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

		'crystal slug': {
			level: 3,
			spells: [{
				type: 'melee'
			}, {
				type: 'smokeBomb',
				radius: 1,
				duration: 3,
				selfCast: 0.25,
				statMult: 1,
				damage: 0.25,
				element: 'poison',
				cdMax: 5,
				particles: {
					scale: {
						start: {
							min: 4,
							max: 14
						},
						end: {
							min: 2,
							max: 8
						}
					},
					opacity: {
						start: 0.01,
						end: 0
					},
					lifetime: {
						min: 1,
						max: 2
					},
					speed: {
						start: 4,
						end: 0
					},
					color: {
						start: ['fc66f7', 'a24eff'],
						end: ['933159', '393268']
					},
					chance: 0.085,
					randomColor: true,
					randomScale: true,
					blendMode: 'add',
					spawnType: 'rect',
					spawnRect: {
						x: -15,
						y: -15,
						w: 30,
						h: 30
					}
				}
			}]
		},

		'cultist': {
			level: 13
		},
		'cultist biorn': {
			level: 14,
			walkDistance: 0
		},
		'cultist veleif': {
			level: 14,
			walkDistance: 0
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