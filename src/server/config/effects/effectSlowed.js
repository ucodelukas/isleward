module.exports = {
	type: 'slowed',
	chance: 0.7,

	events: {
		beforeMove: function (targetPos) {
			if (Math.random() >= this.chance)
				return;

			targetPos.success = false;
		},

		beforeCastSpell: function (successObj) {
			if (Math.random() < this.chance)
				return;

			successObj.success = false;
		}
	}
};
