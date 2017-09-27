define([
	
], function(

) {
	return {
		name: 'Halloween',
		description: `Snappadoowap.`,
		distance: -1,
		cron: '* * * * *',

		events: {
			
		},

		helpers: {
			
		},

		phases: [{
			type: 'hookEvents',
			endMark: 3428,
			auto: true,
			events: {
				beforeGatherResource: function(gatherResult, gatherer) {
					var itemName = gatherResult.blueprint.itemName;
					if ((!itemName) || (itemName.toLowerCase() != 'candy corn'))
						return;

					gatherResult.items.push({
						name: 'Loopy Woopy',
						slot: 'waist',
						type: 'belt',
						level: 1,
						spritesheet: `${this.event.config.folderName}/images/items.png`,
						sprite: [0, 0],
						stats: {
							vit: 5
						}
					});
				}
			}
		}]
	};
});