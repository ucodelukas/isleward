define([

], function (

) {
	return {
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

			var obj = this.obj;
			var target = action.target;

			var ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

			var projectileConfig = {
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
				}],
				extraTargets: 0
			};

			this.obj.fireEvent('beforeSpawnProjectile', this, projectileConfig);

			this.sendBump(target);

			var targets = [target];
			var aggroList = this.obj.aggro.list
				.filter(function (l) {
					return (l.obj != target)
				});

			for (var i = 0; i < Math.min(aggroList.length, projectileConfig.extraTargets); i++) {
				var pick = ~~(Math.random() * aggroList.length);
				targets.push(aggroList[pick].obj);
				aggroList.splice(pick, 1);
			}

			targets.forEach(function (t) {
				var ttl = (Math.sqrt(Math.pow(t.x - obj.x, 2) + Math.pow(t.y - obj.y, 2)) * this.speed) - 50;
				var config = extend(true, {}, projectileConfig);
				config.components[0].ttl = ttl;
				config.components[0].idTarget = t.id;

				this.sendAnimation(config);
				this.queueCallback(this.explode.bind(this, t), ttl, null, t);
			}, this);

			return true;
		},

		castAll: function (action) {
			var obj = this.obj;

			var list = this.obj.aggro.list;
			var lLen = list.length;
			for (var i = 0; i < lLen; i++) {
				var target = list[i].obj;

				var ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

				var projectileConfig = {
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

			var damage = this.getDamage(target);

			if (!target.stats) {
				console.log('has no stats???');
				console.log(target);
				return;
			}
			target.stats.takeDamage(damage, this.threatMult, this.obj);
		}
	};
});
