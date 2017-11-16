define([

], function (

) {
	return {
		resources: {
			'Festive Gift': {
				type: 'herb',
				max: 4
			},
			'Giant Gift': {
				type: 'herb',
				max: 1
			}
		},
		mobs: {
			elk: {
				rare: {
					chance: 5,
					count: 1,
					sheetName: 'server/mods/event-xmas/images/mobs.png',
					cell: 0,
					name: 'Rude Holf'
				}
			},
			'titan crab': {
				rare: {
					chance: 5,
					count: 1,
					sheetName: 'server/mods/event-xmas/images/mobs.png',
					cell: 1,
					name: 'Frost Crab'
				}
			}
		},
		objects: {
			shopfather: {
				properties: {
					cpnNotice: {
						actions: {
							enter: {
								cpn: 'dialogue',
								method: 'talk',
								args: [{
									targetName: 'father giftybags'
								}]
							},
							exit: {
								cpn: 'dialogue',
								method: 'stopTalk'
							}
						}
					}
				}
			},
			snow: {
				components: {
					cpnParticles: {
						simplify: function () {
							return {
								type: 'particles',
								blueprint: {
									color: {
										start: ['fafcfc', 'fafcfc'],
										end: ['fafcfc', 'fafcfc']
									},
									scale: {
										start: {
											min: 4,
											max: 8
										},
										end: {
											min: 4,
											max: 4
										}
									},
									speed: {
										start: {
											min: 10,
											max: 10
										},
										end: {
											min: 10,
											max: 10
										}
									},
									lifetime: {
										min: 30,
										max: 30
									},
									alpha: {
										start: 0.45,
										end: 0,
									},
									rotation: 90,
									randomScale: true,
									randomSpeed: true,
									chance: 0.04,
									randomColor: true,
									spawnType: 'rect',
									direction: {
										x: 0.1,
										y: -1
									},
									spawnRect: {
										x: 0,
										y: 0,
										w: 240,
										h: 40
									}
								}
							}
						}
					}
				}
			},
			lights: {
				components: {
					cpnParticles: {
						simplify: function () {
							return {
								type: 'particles',
								blueprint: {
									color: {
										start: ['ff4252', '80f643', 'db5538', 'faac45', 'a24eff', 'fc66f7'],
										end: ['ff4252', '80f643', 'db5538', 'faac45', 'a24eff', 'fc66f7']
									},
									scale: {
										start: {
											min: 10,
											max: 6
										},
										end: {
											min: 4,
											max: 6
										}
									},
									speed: {
										start: {
											min: 0,
											max: 0
										},
										end: {
											min: 0,
											max: 0
										}
									},
									lifetime: {
										min: 3,
										max: 3
									},
									alpha: {
										start: 1,
										end: 1
									},
									randomScale: true,
									randomSpeed: true,
									frequency: 1,
									randomColor: true,
									spawnType: 'rect',
									blendMode: 'add',
									spawnRect: {
										x: -15,
										y: -20,
										w: 30,
										h: 15
									}
								}
							}
						}
					}
				}
			},
			vlights: {
				components: {
					cpnParticles: {
						simplify: function () {
							return {
								type: 'particles',
								blueprint: {
									color: {
										start: ['ff4252', '80f643', 'db5538', 'faac45', 'a24eff', 'fc66f7'],
										end: ['ff4252', '80f643', 'db5538', 'faac45', 'a24eff', 'fc66f7']
									},
									scale: {
										start: {
											min: 10,
											max: 6
										},
										end: {
											min: 4,
											max: 6
										}
									},
									speed: {
										start: {
											min: 0,
											max: 0
										},
										end: {
											min: 0,
											max: 0
										}
									},
									lifetime: {
										min: 3,
										max: 3
									},
									alpha: {
										start: 1,
										end: 1
									},
									randomScale: true,
									randomSpeed: true,
									frequency: 1,
									randomColor: true,
									spawnType: 'rect',
									blendMode: 'add',
									spawnRect: {
										x: -20,
										y: -15,
										w: 15,
										h: 30
									}
								}
							}
						}
					}
				}
			}
		}
	};
});
