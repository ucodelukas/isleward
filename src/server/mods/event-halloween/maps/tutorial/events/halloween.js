define([
	'mtx/mtx'
], function(
	mtx
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

					var item = {
						name: 'Summon Pumpkin Skeleton',
						type: 'mtx',
						effects: [{
							mtx: 'summonPumpkinSkeleton'
						}],
						spritesheet: `${this.event.config.folderName}/images/items.png`,
						sprite: [3, 0]
					};

					var mtxUrl = mtx.get(item.effects[0].mtx);
					var mtxModule = require(mtxUrl);
					
					item.effects[0].events = mtxModule.events;

					gatherResult.items.push(item);
				}
			}
		}]
	};
});