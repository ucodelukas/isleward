const coordinateDeltas = [
	[[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
	[[0, -2], [0, -1], [1, -2], [2, -2], [1, -1], [2, -1], [2, 0], [1, 0], [2, 1], [2, 2], [1, 1], [1, 2], [0, 2], [0, 1], [-1, 2], [-2, 2], [-2, 1], [-1, 1], [-2, 0], [-1, 0], [-2, -1], [-2, -2], [-1, -1], [-1, -2]]
];

const applyDamage = (target, damage, threat, source) => {
	target.stats.takeDamage(damage, threat, source);
};

const dealDamage = ({ delay, getDamage, queueCallback }, obj, coords) => {
	const physics = obj.instance.physics;

	coords.forEach(([x, y], i) => {
		const cellDelay = i * delay;

		const mobs = physics.getCell(x, y);
		let mLen = mobs.length;
		for (let k = 0; k < mLen; k++) {
			const m = mobs[k];

			if (!m) {
				mLen--;
				continue;
			}

			if (!m.aggro || !m.effects || !obj.aggro.canAttack(m))
				continue;

			const damage = getDamage(m);

			queueCallback(applyDamage.bind(null, m, damage, 1, obj), cellDelay);
		}
	});
};

module.exports = {
	type: 'whirlwind',

	cdMax: 5,
	manaCost: 10,
	range: 1,
	//The delay is sent to the client and is how long (in ms) each tick takes to display
	delay: 32,

	damage: 1,
	isAttack: true,

	targetGround: true,
	targetPlayerPos: true,

	cast: function (action) {
		const { frames, row, col, delay, obj } = this;
		const { id, instance, x: playerX, y: playerY } = obj;

		const coordinates = coordinateDeltas[this.range - 1].map(([x, y]) => [x + playerX, y + playerY]);

		let blueprint = {
			caster: id,
			components: [{
				idSource: id,
				type: 'whirlwind',
				coordinates,
				frames,
				row,
				col,
				delay
			}]
		};

		this.sendBump({
			x: playerX,
			y: playerY - 1
		});

		instance.syncer.queue('onGetObject', blueprint, -1);

		dealDamage(this, obj, coordinates);

		return true;
	}
};
