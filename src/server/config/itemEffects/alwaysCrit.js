define([

], function (

) {
	return {
		events: {
			onGetText: function (item) {
				var rolls = item.effects.find(e => (e.type == 'alwaysCrit')).rolls;

				return `your hits always crit`;
			},

			afterDealDamage: function (item, damage, target) {
				var rolls = item.effects.find(e => (e.type == 'alwaysCrit')).rolls;

				var amount = (damage.amount / 100) * rolls.percentage;

				this.stats.takeDamage({
					amount: amount
				}, 1, this);
			}
		}
	};
});
