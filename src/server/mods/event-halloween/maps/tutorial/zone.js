define([

], function (

) {
	return {
		resources: {
			'Tiny Pumpkin': {
				type: 'herb',
				max: 3
			},
			Pumpkin: {
				type: 'herb',
				max: 2
			},
			'Giant Pumpkin': {
				type: 'herb',
				max: 1
			}
		},
		mobs: {
			'the pumpkin sailor': {
				level: 25,
				walkDistance: 0,
				attackable: false,
				regular: {
					drops: {
						chance: 75,
						rolls: 1
					}
				},
				rare: {
					count: 0
				},

				properties: {
					cpnTrade: {
						items: {
							min: 0,
							max: 0
						},
						forceItems: [{
							type: 'skin',
							id: 'pumpkin-head necromancer',
							worth: 100,
							factions: [{
								id: 'pumpkinSailor',
								tier: 7
							}]
						}, {
							name: `Signet of Witching`,
							spritesheet: `server/mods/event-halloween/images/items.png`,
							sprite: [0, 0],
							slot: 'finger',
							type: 'Ring',
							level: '10',
							quality: 3,
							worth: {
								currency: `Candy Corn`,
								amount: 350
							},
							stats: {
								int: 50,
								regenMana: 8
							}

						}, {
							name: `Banshee's Will`,
							spritesheet: `server/mods/event-halloween/images/items.png`,
							sprite: [0, 0],
							slot: 'finger',
							type: 'Ring',
							level: '10',
							quality: 3,
							worth: {
								currency: `Candy Corn`,
								amount: 350
							},
							stats: {
								str: 25,
								int: 25,
								regenHp: 10
							}

						}, {
							name: `Black Cat's Grace`,
							spritesheet: `server/mods/event-halloween/images/items.png`,
							sprite: [0, 0],
							slot: 'finger',
							type: 'Ring',
							level: '10',
							quality: 3,
							worth: {
								currency: `Candy Corn`,
								amount: 350
							},
							stats: {
								dex: 50,
								addCritChance: 90
							}

						}, {
							name: `Dead Man's Band`,
							spritesheet: `server/mods/event-halloween/images/items.png`,
							sprite: [0, 0],
							slot: 'finger',
							type: 'Ring',
							level: '10',
							quality: 3,
							worth: {
								currency: `Candy Corn`,
								amount: 350
							},
							stats: {
								str: 50,
								armor: 350
							}

						}],
						level: {
							min: 1,
							max: 5
						},
						markup: {
							buy: 0.25,
							sell: 2.5
						}
					}
				}
			},
			blabby: {
				walkDistance: 0,

				regular: {
					drops: {
						noRandom: true,
						chance: 100,
						blueprints: [{
							chance: 100,
							name: 'Candy Corn',
							material: true,
							sprite: [2, 0],
							quantity: [1, 20]
						}, {
							chance: 1,
							name: 'Summon Pumpkin Skeleton',
							type: 'mtx',
							effects: [{
								mtx: 'summonPumpkinSkeleton'
							}],
							spritesheet: `server/mods/event-halloween/images/items.png`,
							sprite: [3, 0],
							noDrop: true,
							noDestroy: true,
							noSalvage: true
						}, {
							chance: 1,
							name: 'Haunted Ice Spear',
							type: 'mtx',
							effects: [{
								mtx: 'hauntedIceSpear'
							}],
							spritesheet: `server/mods/event-halloween/images/items.png`,
							sprite: [3, 0],
							noDrop: true,
							noDestroy: true,
							noSalvage: true
						}]
					}
				},

				rare: {
					count: 0
				},

				components: {
					cpnParticles: {
						simplify: function () {
							return {
								type: 'particles',
								blueprint: {
									color: {
										start: ['80f643', '80f643'],
										end: ['4ac441', '4ac441']
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
									chance: 0.35,
									randomColor: true,
									spawnType: 'rect',
									spawnRect: {
										x: -15,
										y: 0,
										w: 30,
										h: 8
									}
								}
							}
						}
					}
				}
			}
		},
		objects: {
			shopcaptain: {
				properties: {
					cpnNotice: {
						actions: {
							enter: {
								cpn: 'dialogue',
								method: 'talk',
								args: [{
									targetName: 'the pumpkin sailor'
								}]
							},
							exit: {
								cpn: 'dialogue',
								method: 'stopTalk'
							}
						}
					}
				}
			}
		}
	};
});
