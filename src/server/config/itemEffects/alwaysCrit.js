module.exports = {
	events: {
		onGetText: function (item) {
			let rolls = item.effects.find(e => (e.type === 'alwaysCrit')).rolls;

			return 'your hits always crit';
		},

		onBeforeCalculateDamage: function (item, damage, target) {
			let rolls = item.effects.find(e => (e.type === 'alwaysCrit')).rolls;

			damage.crit = true;
		}
	}
};
