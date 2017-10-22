define([

], function (

) {
	return {
		name: `Beware Lord Squash`,
		description: `Lord Squash haunts the south-western shore. Stop him in the name of the Pumpkin Sailor.`,
		distance: -1,
		cron: '0 */2 * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'spawnMob',
			spawnRect: {
				x: 63,
				y: 34
			},
			mobs: [{
				name: 'Lord Squash',
				level: 10,
				attackable: true,
				cell: 0,
				sheetName: `server/mods/event-halloween/images/bosses.png`,
				id: 'lordSquash',
				hpMult: 55,
				dmgMult: 40,
				grantRep: {
					pumpkinSailor: 2000
				},
				pos: {
					x: 0,
					y: 0
				},
				drops: {
					chance: 100,
					rolls: 2,
					noRandom: true,
					blueprints: [{
						chance: 5,
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
					}, {
						chance: 100,
						name: 'Candy Corn',
						spritesheet: `server/mods/event-halloween/images/items.png`,
						material: true,
						sprite: [3, 3],
						quantity: [30, 60]
					}]
				},
				properties: {
					cpnBumpAnimation: {
						type: 'bumpAnimation',
						simplify: function () {
							return {
								type: 'bumpAnimation',
								infinite: true,
								deltaX: 0,
								deltaY: -1,
								updateCdMax: 4
							};
						}
					}
				},
				chats: {
					global: true,
					chance: 1,
					cdMax: 350,
					chats: [{
						msg: 'Souls! Souls! Delicious Souls!'
					}, {
						msg: '*Gobble Gobble Gobble*'
					}, {
						msg: 'Come, Sailor. I will be your match!'
					}]
				},
				spells: [{
					type: 'scatterPumpkinPieces'
				}, {
					type: 'projectile',
					row: 3,
					col: 4,
					shootAll: true,
					particles: {
						color: {
							start: ['51fc9a', '48edff'],
							end: ['48edff', '51fc9a']
						},
						scale: {
							start: {
								min: 2,
								max: 12
							},
							end: {
								min: 0,
								max: 6
							}
						},
						lifetime: {
							min: 2,
							max: 4
						},
						alpha: {
							start: 0.7,
							end: 0
						},
						speed: {
							start: {
								min: 4,
								max: 24
							},
							end: {
								min: 0,
								max: 12
							}
						},
						startRotation: {
							min: 0,
							max: 360
						},
						rotationSpeed: {
							min: 0,
							max: 360
						},
						randomScale: true,
						randomColor: true,
						randomSpeed: true,
						chance: 0.55,
						spawnType: 'circle',
						spawnCircle: {
							x: 0,
							y: 0,
							r: 8
						}
					}
				}]
			}]
		}, {
			type: 'killMob',
			mobs: ['lordSquash']
		}]
	};
});
