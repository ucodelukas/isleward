define([

], function (

) {
	return {
		type: 'regenHp',

		amount: 1,

		update: function () {
			this.obj.stats.getHp({
				amount: this.amount,
				threatMult: 0
			}, this.caster);
		},

		events: {
			init: function () {

			},

			destroy: function () {

			}
		}
	};
});
