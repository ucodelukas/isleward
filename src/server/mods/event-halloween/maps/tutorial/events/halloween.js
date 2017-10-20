define([
	'mtx/mtx',

], function (
	mtx
) {
	var dropsConfig = {
		//mtx
		summonPumpkinSkeleton: {
			name: 'Summon Pumpkin Skeleton',
			type: 'mtx',
			effects: [{
				mtx: 'summonPumpkinSkeleton'
			}],
			spritesheet: `FOLDERNAME/images/items.png`,
			sprite: [3, 0],
			noDrop: true,
			noDestroy: true,
			noSalvage: true
		},

		hauntedIceSpear: {
			name: 'Haunted Ice Spear',
			type: 'mtx',
			effects: [{
				mtx: 'hauntedIceSpear'
			}],
			spritesheet: `FOLDERNAME/images/items.png`,
			sprite: [3, 0],
			noDrop: true,
			noDestroy: true,
			noSalvage: true
		}
	};

	var gatherDrops = {
		summonPumpkinSkeleton: 0.001,
		hauntedIceSpear: 0.001
	};

	return {
		name: `Soul's Moor`,
		description: `The Pumpkin Sailor has returned to the shores of the living.`,
		distance: -1,
		cron: '* * * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'hookEvents',
			events: {
				beforeGatherResource: function (gatherResult, gatherer) {
					var itemName = gatherResult.blueprint.itemName;
					if ((!itemName) || (itemName.toLowerCase() != 'candy corn'))
						return;

					gatherer.reputation.getReputation('pumpkinSailor', 10);

					for (var g in gatherDrops) {
						if (Math.random() < gatherDrops[g]) {
							var drop = extend(true, {}, dropsConfig[g]);
							drop.spritesheet = drop.spritesheet.replace('FOLDERNAME', this.event.config.folderName);

							if (drop.effects) {
								var mtxUrl = mtx.get(drop.effects[0].mtx);
								var mtxModule = require(mtxUrl);

								drop.effects[0].events = mtxModule.events;

								gatherResult.items.push(drop);

								return;
							}
						}
					}
				}
			}
		}]
	};
});
