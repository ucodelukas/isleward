define([
	
], function(
	
) {
	return {
		type: 'bloodBarrier',

		cdMax: 7,
		manaCost: 0,

		range: 9,

		speed: 150,
		damage: 1,

		row: 3,
		col: 0,

		needLos: true,

		cast: function(action) {
			var obj = this.obj;
			var target = action.target;

			this.sendBump(target);

			this.queueCallback(this.explode.bind(this, target), 1, null, target);

			return true;
		},
		explode: function(target) {
			if ((this.obj.destroyed) || (target.destroyed))
				return;

			var amount = this.obj.stats.values.hpMax / 100 * this.drainPercentage;
			var damage = {
				amount: amount
			};
			this.obj.stats.takeDamage(damage, 0, this.obj);

			amount  = amount * this.shieldMultiplier;
			var heal = {
				amount: amount
			};
			target.stats.getHp(heal, this.obj);
		}
	};
});