define([

], function (

) {
	return {
		events: {
			onGetText: function (item) {
				var rolls = item.effects.find(e => (e.type == 'doubleProjectile')).rolls;

				return `${rolls.chance}% chance for Magic Missile to attack an additional target`;
			},

			beforeSpawnProjectile: function (item, spell, projectileConfig) {
				if (spell.name != 'Magic Missile')
					return;

				var rolls = item.effects.find(e => (e.type == 'doubleProjectile')).rolls;

				var chanceRoll = Math.random() * 100;
				if (chanceRoll >= rolls.chance)
					return;

				projectileConfig.extraTargets++;
			}
		}
	};
});
