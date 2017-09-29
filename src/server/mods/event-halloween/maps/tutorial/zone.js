define([
	
], function(
	
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
			'captain squash': {
				level: 25,
				walkDistance: 0,
				regular: {
					drops: {
						chance: 75,
						rolls: 1
					}
				},
				rare: {
					count: 0
				}
			}
		}
	};
});