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
						name: 'Summon Pumpkin Skeleton',
						type: 'rune effect',
						mtx: 'summonPumpkinSkeleton',
						spritesheet: `${this.event.config.folderName}/images/items.png`,
						sprite: [0, 0]
					});
				}
			}
		}]
	};
});