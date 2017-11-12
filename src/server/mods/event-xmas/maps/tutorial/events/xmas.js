define([

], function (

) {
	return {
		name: `Xmas Thang`,
		description: `All be happy, there be snow.`,
		distance: -1,
		cron: '* * * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'spawnMob',
			mobs: {
				name: 'Father Giftybags',
				attackable: false,
				level: 20,
				cell: 2,
				sheetName: 'server/mods/event-xmas/images/mobs.png',
				id: 'giftyBags',
				hpMult: 1,
				pos: {
					x: 111,
					y: 54
				}
			}
		}, {
			type: 'hookEvents',
			events: {
				onBeforeBuildMob: function (zone, mobName, blueprint) {
					try {
						var zoneFile = require('mods/event-xmas/maps/' + zone + '/zone.js');
						var override = _.getDeepProperty(zoneFile, ['mobs', mobName]);
						if (override)
							extend(true, blueprint, override);
					} catch (e) {}
				},

				onBeforeGetCardsConfig: function (config) {
					extend(true, config, {
						'Cheer and Spear': {
							chance: 40,
							reward: 'Rare Festive Spear',
							setSize: 1,
							mobName: ['frost crab', 'rude holf']
						}
					});
				}
			}
		}]
	};
});
