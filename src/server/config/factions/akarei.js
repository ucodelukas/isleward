define([
	'world/spawners',
	'world/mobBuilder'
], function(
	spawners,
	mobBuilder
) {
	return {
		id: 'akarei',
		name: 'Akarei',
		description: `The last descendents of the ancient Akarei.`,

		uniqueStat: {
			chance: {
				min: 3,
				max: 12
			},

			generate: function(item) {
				var chance = this.chance;
				var chanceRoll = ~~(random.norm(chance.min, chance.max) * 10) / 10;

				var result = null;
				if (item.effects)
					result = item.effects.find(e => (e.factionId == 'akarei'));

				if (!result) {
					if (!item.effects)
						item.effects = [];

					result = {
						factionId: 'akarei',
						chance: chanceRoll,
						text: chanceRoll + '% chance on to cast a lightning bolt when you critically hit an enemy',
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
				beforeDealDamage: function(damage, target) {
					if (!damage.crit)
						return;

					var effect = item.effects.find(e => (e.factionId == 'akarei'));

					var roll = Math.random() * 100;
					if (roll >= effect.chance)
						return;

					
				}
			}
		},

		rewards: {

		}
	};
});