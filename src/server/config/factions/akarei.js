define([
	'world/spawners',
	'world/mobBuilder',
	'combat/combat'
], function (
	spawners,
	mobBuilder,
	combat
) {
	return {
		id: 'akarei',
		name: 'The Akarei',
		description: `The last descendents of the ancient Akarei.`,

		uniqueStat: {
			damage: 1,

			chance: {
				min: 20,
				max: 45
			},

			generate: function (item) {
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
						properties: {
							chance: chanceRoll,
						},
						text: chanceRoll + '% chance on crit to cast a lightning bolt',
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
				beforeDealDamage: function (item, damage, target) {
					if (!damage.crit)
						return;

					var effect = item.effects.find(e => (e.factionId == 'akarei'));

					var roll = Math.random() * 100;
					if (roll >= effect.properties.chance)
						return;

					var cbExplode = function (target) {
						if ((this.destroyed) || (target.destroyed))
							return;

						var damage = combat.getDamage({
							source: this,
							target: target,
							damage: item.level * 5,
							element: 'arcane',
							noCrit: true
						});

						target.stats.takeDamage(damage, 1, this);
					};

					this.instance.syncer.queue('onGetObject', {
						id: this.id,
						components: [{
							type: 'lightningEffect',
							toX: target.x,
							toY: target.y
						}]
					});

					this.spellbook.registerCallback(this.id, cbExplode.bind(this, target), 1);
				}
			}
		},

		rewards: {

		}
	};
});
