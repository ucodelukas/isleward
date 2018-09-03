module.exports = {
	type: 'lifeDrain',

	events: {
		afterTick: function () {
			this.obj.stats.takeDamage({
				amount: this.amount
			}, 1, this.caster);
		}
	}
};
