const coordinates = [
	[[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]
];

const maxTicks = 8;

module.exports = {
	type: 'whirlwind',

	cdMax: 5,
	manaCost: 10,
	range: 1,

	damage: 0.0001,
	isAttack: true,

	channelDuration: 100,

	isCasting: false,
	ticker: 0,

	cast: function (action) {
		if (this.isCasting)
			return;

		//this.isCasting = true;

		const { effects, x: playerX, y: playerY } = this.obj;

		const coords = coordinates[this.range - 1].map(([x, y]) => [x + playerX, y + playerY]);

		let blueprint = {
			caster: this.obj.id,
			components: [{
				idSource: this.obj.id,
				type: 'whirlwind',
				coordinates: coords,
				row: 3,
				col: 0
			}]
		};

		this.obj.instance.syncer.queue('onGetObject', blueprint, -1);

		return true;
	},

	reachDestination: function (selfEffect) {
		const { effects, destroyed } = this.obj;
		if (destroyed)
			return;

		effects.removeEffect(selfEffect);
	},

	spawnDamager: function (x, y) {
		const { effects, destroyed, instance } = this.obj;
		if (destroyed)
			return;

		instance.syncer.queue('onGetObject', {
			x,
			y,
			components: [{
				type: 'attackAnimation',
				row: 3,
				col: 0
			}]
		}, -1);
	}
};
