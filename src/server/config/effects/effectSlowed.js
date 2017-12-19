define([

], function (

) {
	return {
		type: 'slowed',
		chance: 0.7,

		events: {
			beforeMove: function (targetPos) {
				if (Math.random() >= this.chance)
					return;

				targetPos.success = false;
			},

			beforeDealDamage: function (damage) {
				if (!damage)
					return;

				if (Math.random() >= this.chance)
					return;

				damage.failed = true;
			},

			beforeCastSpell: function (successObj) {
				if (Math.random() < this.chance)
					return;

				successObj.success = false;
			}
		}
	};
});
