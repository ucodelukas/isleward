define([

], function (

) {
	return {
		events: {
			onGetText: function (item) {
				var rolls = item.effects.find(e => (e.type == 'damageSelf')).rolls;

				return `you take ${rolls.percentage} of the damage you deal`;
			},

			afterDealDamage: function (item, damage, target) {
				var rolls = item.effects.find(e => (e.type == 'damageSelf')).rolls;

				var amount = (damage.amount / 100) * rolls.percentage;

				this.stats.takeDamage({
					amount: amount
				}, 1, this);
			}
		}
	};
});
