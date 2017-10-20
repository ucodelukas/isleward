define([

], function (

) {
	return {
		name: `Beware Lord Squash`,
		description: `Lord Squash haunts the south-western shore. Stop him in the name of the Pumpkin Sailor.`,
		distance: -1,
		cron: '* * * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'spawnMob',
			spawnRect: {
				x: 45,
				y: 88
			},
			mobs: [{
				name: 'Lord Squash',
				level: 5,
				attackable: true,
				cell: 0,
				sheetName: `server/mods/event-halloween/images/bosses.png`,
				id: 'lordSquash',
				hpMult: 20,
				dmgMult: 0.25,
				grantRep: {
					pumpkinSailor: 2500
				},
				pos: {
					x: 0,
					y: 0
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
					particles: {
						scale: {
							start: {
								min: 6,
								max: 18
							},
							end: {
								min: 2,
								max: 8
							}
						},
						color: {
							start: ['fc66f7', 'a24eff'],
							end: ['393268', '933159']
						},
						chance: 0.65,
						randomScale: true,
						randomColor: true,
					}
				}]
			}]
		}, {
			type: 'killMob',
			mobs: ['lordSquash']
		}]
	};
});
