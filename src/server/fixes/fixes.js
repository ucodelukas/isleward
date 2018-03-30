define([

], function (

) {
	return {
		fixCharacter: function (player) {
			var inv = player.components.find(c => (c.type == 'inventory'));
			if ((inv) && (inv.items))
				this.fixItems(inv.items);
		},

		fixStash: function (stash) {
			this.fixItems(stash);
		},

		fixItems: function (items) {
			items
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
