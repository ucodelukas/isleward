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
					count: 10,
					sheetName: 'server/mods/event-xmas/images/mobs.png',
					cell: 0,
					name: 'Rude Holf'
				}
			},
			'titan crab': {
				rare: {
					count: 10,
					sheetName: 'server/mods/event-xmas/images/mobs.png',
					cell: 1,
					name: 'Frost Crab'
				}
			}
		}
	};
});
