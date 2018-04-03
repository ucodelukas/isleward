define([
	'combat/combat'
], function (
	combat
) {
	return {
		events: {
			element: null,

			onGetText: function (item) {
				var rolls = item.effects.find(e => (e.type == 'damageSelf')).rolls;

				return `you take ${rolls.percentage}% of the damage you deal`;
			},

			afterDealDamage: function (item, damage, target) {
				var effect = item.effects.find(e => (e.type == 'damageSelf'));
				var rolls = effect.rolls;

				var amount = (damage.dealt / 100) * rolls.percentage;

				var newDamage = combat.getDamage({
					source: {
						stats: {
							values: {}
						}
					},
					isAttack: false,
					target: this,
					damage: amount,
					element: (effect.properties || {}).element,
					noCrit: true
				});

				newDamage.noEvents = true;

				this.stats.takeDamage(newDamage, 1, this);
			}
		}
	};
});
