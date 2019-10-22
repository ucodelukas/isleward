const coordinates = [
	[[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
	[[0, -2], [0, -1], [1, -2], [2, -2], [1, -1], [2, -1], [2, 0], [1, 0], [2, 1], [2, 2], [1, 1], [1, 2], [0, 2], [0, 1], [-1, 2], [-2, 2], [-2, 1], [-1, 1], [-2, 0], [-1, 0], [-2, -1], [-2, -2], [-1, -1], [-1, -2]],
	[[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]
];

const dealDamage = (spell, obj, coords) => {
	const physics = obj.instance.physics;

	coords.forEach(([x, y]) => {
		const mobs = physics.getCell(x, y);
		let mLen = mobs.length;
		for (let k = 0; k < mLen; k++) {
			const m = mobs[k];

			if (!m) {
				mLen--;
				continue;
			}

			if (!m.aggro || !m.effects)
				continue;

			if (!obj.aggro.canAttack(m))
				continue;

			const damage = spell.getDamage(m);
			m.stats.takeDamage(damage, 1, obj);
		}
	});
};

module.exports = {
	type: 'whirlwind',

	cdMax: 5,
	manaCost: 10,
	range: 1,

	damage: 1,
	isAttack: true,

	targetGround: true,
	targetPlayerPos: true,

	cast: function (action) {
		const { frames, row, col, obj } = this;
		const { id, instance, x: playerX, y: playerY } = obj;

		const coords = coordinates[this.range - 1].map(([x, y]) => [x + playerX, y + playerY]);

		let blueprint = {
			caster: id,
			components: [{
				idSource: id,
				type: 'whirlwind',
				coordinates: coords,
				frames,
				row,
				col
			}]
		};

		this.sendBump({
			x: playerX,
			y: playerY - 1
		});

		instance.syncer.queue('onGetObject', blueprint, -1);

		dealDamage(this, obj, coords);

		return true;
	}
};
