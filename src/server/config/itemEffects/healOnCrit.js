define([

], function (

) {
	return {
		events: {
			onGetText: function (item) {
				var rolls = item.effects.find(e => (e.type == 'healOnCrit')).rolls;
				var chance = rolls.chance || 100;
				var amount = rolls.amount;
				var percentage = rolls.percentage;

				var text = '';

				if (chance < 100)
					text = `${chance}% chance to heal on crit for `;
				else
					text = `critical hits heal you for `;

				if (percentage)
					text += `${percentage}% of damage dealt`;
				else
					text += `${amount || '?'} health`;

				return text;
			},

			afterDealDamage: function (item, damage, target) {
				if (!damage.crit)
					return;

				var rolls = item.effects.find(e => (e.type == 'healOnCrit')).rolls;

				var chanceRoll = Math.random() * 100;
				if (chanceRoll >= (rolls.chance || 100))
					return;

				var amount = rolls.amount || ((damage.amount / 100) * rolls.percentage);

				this.stats.getHp({
					amount: amount
				}, this);
			}
		}
	};
});
