define([

], function (

) {
	return {
		type: 'regenHp',

		amount: 1,

		init: function () {
			this.obj.stats.addStat('regenHp', this.amount * 3);
		},

		destroy: function () {
			this.obj.stats.addStat('regenHp', -(this.amount * 3));
		},

		update: function () {

		},

		events: {

		}
	};
});
