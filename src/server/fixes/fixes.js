define([
	'security/io',
	'config/skins'
], function (
	io,
	configSkins
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
		},

		fixSkins: function (username, skins) {
			var length = skins.length;
			skins = skins.filter(s => !!configSkins.getBlueprint(s));

			if (length != skins.length) {
				io.set({
					ent: username,
					field: 'skins',
					value: JSON.stringify(skins)
				});
			}
		}
	};
});
