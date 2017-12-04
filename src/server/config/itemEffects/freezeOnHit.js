define([

], function (

) {
	return {
		events: {
			afterDealDamage: function (item, damage, target) {
				var rolls = item.effects.find(e => (e.type == 'freezeOnHit')).rolls;

				var chanceRoll = Math.random() * 100;
				if (chanceRoll >= rolls.chance)
					return;

				target.effects.addEffect({
					type: 'slowed',
					chance: 1,
					ttl: rolls.duration
				});
			}
		}
	};
});
