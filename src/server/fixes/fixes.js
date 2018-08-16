let configSkins = require('../config/skins');

module.exports = {
	fixDb: async function () {
		await io.deleteAsync({
			key: 'list',
			table: 'leaderboard'
		});
	},

	fixCharacter: function (player) {
		let inv = player.components.find(c => (c.type === 'inventory'));
		if ((inv) && (inv.items))
			this.fixItems(inv.items);
	},

	fixStash: function (stash) {
		this.fixItems(stash);
	},

	fixItems: function (items) {
		items
			.filter(i => ((i.name === 'Cowl of Obscurity') && (!i.factions)))
			.forEach(function (i) {
				i.factions = [{
					id: 'gaekatla',
					tier: 7
				}];
			});

		items
			.filter(i => (i.name === 'Steelclaw\'s Bite'))
			.forEach(function (i) {
				let effect = i.effects[0];

				if (!effect.properties) {
					effect.properties = {
						element: 'poison'
					};
				} else if (!effect.properties.element)
					effect.properties.element = 'poison';
			});

		items
			.filter(f => ((f.effects) && (f.effects[0].factionId === 'akarei') && (!f.effects[0].properties)))
			.forEach(function (i) {
				let effect = i.effects[0];
				let chance = parseFloat(effect.text.split(' ')[0].replace('%', ''));

				effect.properties = {
					chance: chance
				};
			});

		items
			.filter(f => ((f.stats) && (f.stats.dmgPercent)))
			.forEach(function (i) {
				i.stats.physicalPercent = i.stats.dmgPercent;
				delete i.stats.dmgPercent;

				if ((i.enchantedStats) && (i.enchantedStats.dmgPercent)) {
					i.enchantedStats.physicalPercent = i.enchantedStats.dmgPercent;
					delete i.enchantedStats.dmgPercent;
				}
			});
	},

	fixSkins: function (username, skins) {
		let length = skins.length;
		skins = skins.filter(s => !!configSkins.getBlueprint(s));

		if (length !== skins.length) {
			io.set({
				ent: username,
				field: 'skins',
				value: JSON.stringify(skins)
			});
		}
	}
};
