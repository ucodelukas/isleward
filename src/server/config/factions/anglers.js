define([
	
], function(
	
) {
	return {
		id: 'anglers',
		name: 'The Anglers',
		description: `Masters of the arts of Angling, Lurecrafting and Baiting.`,

		uniqueStat: {
			chance: {
				min: 2,
				max: 7
			},

			generate: function(item) {
				var chance = this.chance;
				var chanceRoll = ~~(random.expNorm(chance.min, chance.max));

				var result = null;
				if (item.effects)
					result = item.effects.find(e => (e.factionId == 'anglers'));

				if (!result) {
					if (!item.effects)
						item.effects = [];

					result = {
						factionId: 'anglers',
						chance: chanceRoll,
						text: chanceRoll + '% chance to multi-catch',
						events: {}
					};

					item.effects.push(result);
				}

				if (!result.events)
					result.events = {};

				for (var e in this.events) {
					result.events[e] = this.events[e];
				}

				return result;
			},

			events: {
				beforeGatherResource: function(item, gatherResult, source) {
					var effect = item.effects.find(e => (e.factionId == 'anglers'));

					var roll = Math.random() * 100;
					if (roll >= effect.chance)
						return;

					var pick = gatherResult.items[~~(Math.random() * gatherResult.items.length)];
					gatherResult.items.push(extend(true, {}, pick));
				}
			}
		},

		rewards: {

		}
	};
});