define([
	
], function(
	
) {
	return {
		events: {
			afterSummonMinion: function(item, minion) {
				minion.sheetName = this.folderName + '/images/mobs.png';
				minion.cell = 0;
			}
		}
	};
});