define([

], function (

) {
	return {
		fix: function (player) {
			this.fixInventory(player);
		},

		fixInventory: function (player) {
			var inv = player.components.find(c => (c.type == 'inventory'));
			if ((!inv) || (!inv.items))
				return;

			inv.items
				.filter(i => ((i.name == 'Cowl of Obscurity') && (!i.factions)))
				.forEach(function (i) {
					i.factions = [{
						id: 'gaekatla',
						tier: 7
					}];
				});
		}
	};
});
