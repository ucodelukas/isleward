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
							/*worth: {
								currency: `Candy Corn`,
								amount: 1800
							},*/
							worth: 1,
							factions: [{
								id: 'pumpkinSailor',
								tier: 1
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
								amount: 500
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
								amount: 500
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
								amount: 500
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
								amount: 500
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
