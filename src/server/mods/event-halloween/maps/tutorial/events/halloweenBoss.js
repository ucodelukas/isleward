define([

], function (

) {
	return {
		name: `Beware Lord Squash`,
		description: `Snappadoowap.`,
		distance: -1,
		cron: '0 */4 * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'spawnMob',
			spawnRect: {
				x: 45,
				y: 87
			},
			mobs: [{
				name: 'Lord Squash',
				level: 12,
				attackable: true,
				cell: 1,
				sheetName: `mods/halloween/images/bigMobs.png`,
				id: 'lordSquash',
				hpMult: 10,
				dmgMult: 2,
				pos: {
					x: 0,
					y: 0
				}
			}]
		}]
	};
});
