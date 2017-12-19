define([

], function (

) {
	return {
		events: {
			onGetText: function (item) {
				var rolls = item.effects.find(e => (e.type == 'alwaysCrit')).rolls;

				return `your hits always crit`;
			},

			onBeforeCalculateDamage: function (item, damage, target) {
				var rolls = item.effects.find(e => (e.type == 'alwaysCrit')).rolls;

				damage.crit = true;
			}
		}
	};
});
