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
			type: 'hookEvents',
			events: {
				onBeforeBuildMob: function (zone, mobName, blueprint) {
					try {
						var zoneFile = require('mods/event-xmas/maps/' + zone + '/zone.js');
						var override = _.getDeepProperty(zoneFile, ['mobs', mobName]);
						if (override)
							extend(true, blueprint, override);
					} catch (e) {}
				}
			}
		}]
	};
});
