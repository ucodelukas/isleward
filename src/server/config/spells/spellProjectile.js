module.exports = {
	type: 'projectile',

	cdMax: 7,
	manaCost: 0,

	range: 9,

	speed: 150,
	damage: 1,

	row: 3,
	col: 0,

	needLos: true,
	shootAll: false,

	cast: function (action) {
		if (this.shootAll) {
			this.castAll(action);
			return true;
		}

		let obj = this.obj;
		let target = action.target;

		let ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

		let projectileConfig = {
			caster: this.obj.id,
			components: [{
				idSource: this.obj.id,
				idTarget: target.id,
				type: 'projectile',
				ttl: ttl,
				projectileOffset: this.projectileOffset,
				particles: this.particles
			}, {
				type: 'attackAnimation',
				layer: 'projectiles',
				loop: -1,
				row: this.row,
				col: this.col
			}]
		};

		this.obj.fireEvent('beforeSpawnProjectile', this, projectileConfig);

		this.sendAnimation(projectileConfig);

		this.sendBump(target);

		this.queueCallback(this.explode.bind(this, target), ttl, null, target);

		return true;
	},

	castAll: function (action) {
		let obj = this.obj;

		let list = this.obj.aggro.list;
		let lLen = list.length;
		for (let i = 0; i < lLen; i++) {
			let target = list[i].obj;

			let ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

			let projectileConfig = {
				caster: this.obj.id,
				components: [{
					idSource: this.obj.id,
					idTarget: target.id,
					type: 'projectile',
					ttl: ttl,
					projectileOffset: this.projectileOffset,
					particles: this.particles
				}, {
					type: 'attackAnimation',
					layer: 'projectiles',
					loop: -1,
					row: this.row,
					col: this.col
				}]
			};

			this.obj.fireEvent('beforeSpawnProjectile', this, projectileConfig);

			this.sendAnimation(projectileConfig);

			this.sendBump(target);

			this.queueCallback(this.explode.bind(this, target), ttl, null, target);
		}
	},

	explode: function (target) {
		if ((this.obj.destroyed) || (target.destroyed))
			return;

		let damage = this.getDamage(target);

		if (!target.stats)
			return;

		target.stats.takeDamage(damage, this.threatMult, this.obj);
	}
};
