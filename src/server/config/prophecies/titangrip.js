define([

], function (

) {
	return {
		type: 'titangrip',

		init: function () {

		},

		simplify: function () {
			return this.type;
		},

		events: {
			afterEquipItem: function (item) {
				if (['oneHanded', 'twoHanded'].indexOf(item.slot) == -1)
					return;

				var stats = item.stats;
				for (var s in stats) {
					var val = stats[s];

					this.obj.stats.addStat(s, val);
				}
			},
			afterUnequipItem: function (item) {
				if (['oneHanded', 'twoHanded'].indexOf(item.slot) == -1)
					return;

				var stats = item.stats;
				for (var s in stats) {
					var val = stats[s];

					this.obj.stats.addStat(s, -val);
				}
			}
		}
	};
});
