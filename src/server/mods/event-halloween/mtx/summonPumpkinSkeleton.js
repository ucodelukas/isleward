define([
	
], function(
	
) {
	return {
		events: {
			beforeSummonMinion: function(item, minion) {
				minion.sheetName = 'server/mods/event-halloween/images/mobs.png';
				minion.cell = 0;
			}
		}
	};
});