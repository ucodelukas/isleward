let cpnPumpkinChunk = {
	type: 'pumpkinChunk',

	caster: null,
	isRotten: false,

	ttl: 250,

	update: function () {
		this.ttl--;

		if (this.ttl === 0)
			this.obj.destroyed = true;
	},

	collisionEnter: function (o) {
		if (!o.player)
			return;

		this.obj.destroyed = true;

		if (this.isRotten) {
			let drainCounts = this.caster.spellbook.spells.find(s => (s.type === 'scatterPumpkinPieces')).drainCounts;
			if (drainCounts[o.name])
				drainCounts[o.name] += 2;
			else 
				drainCounts[o.name] = 1;

			o.effects.addEffect({
				type: 'lifeDrain',
				ttl: 10,
				amount: drainCounts[o.name],
				caster: this.caster
			});
		} else {
			o.effects.addEffect({
				type: 'frenzy',
				ttl: 40,
				newCd: 2
			});
		}
	}
};
	
module.exports = {
	type: 'scatterPumpkinPieces',

	cdMax: 20,
	manaCost: 0,

	spread: 5,
	range: 10,
	speed: 250,

	drainCounts: {},

	cast: function (action) {
		return this.shootChunk(action);
	},

	shootChunk: function (action) {
		let obj = this.obj;

		let physics = obj.instance.physics;

		let spread = this.spread;
		let toX = obj.x + ~~(Math.random() * spread * 2) - spread;
		let toY = obj.y + ~~(Math.random() * spread * 2) - spread;
		let target = physics.getClosestPos(
			obj.x,
			obj.y,
			toX,
			toY
		);

		if (!target)
			return false;

		let ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

		let isRotten = (Math.random() < 0.3);
		let particles = null;
		if (!isRotten) {
			particles = {
				color: {
					start: ['ffeb38', 'db5538'],
					end: ['d43346', '763b3b']
				},
				scale: {
					start: {
						min: 4,
						max: 8
					},
					end: {
						min: 0,
						max: 4
					}
				},
				lifetime: {
					min: 2,
					max: 4
				},
				alpha: {
					start: 0.7,
					end: 0
				},
				randomScale: true,
				randomColor: true,
				chance: 0.6
			};
		} else {
			particles = {
				color: {
					start: ['fc66f7', 'a24eff'],
					end: ['533399', '393268']
				},
				scale: {
					start: {
						min: 4,
						max: 8
					},
					end: {
						min: 0,
						max: 4
					}
				},
				lifetime: {
					min: 2,
					max: 4
				},
				alpha: {
					start: 0.7,
					end: 0
				},
				randomScale: true,
				randomColor: true,
				chance: 0.6
			};
		}

		let projectileConfig = {
			caster: this.obj.id,
			components: [{
				idSource: this.obj.id,
				target: target,
				type: 'projectile',
				ttl: ttl,
				projectileOffset: null,
				particles: particles
			}]
		};

		this.sendAnimation(projectileConfig);

		this.queueCallback(this.createChunk.bind(this, isRotten, target, particles), ttl, null, target);

		return true;
	},

	createChunk: function (isRotten, pos, particles) {
		let cell = isRotten ? 73 : 72;

		particles.chance = 0.1;

		let obj = this.obj.instance.objects.buildObjects([{
			sheetName: `${this.folderName}/images/mobs.png`,
			cell: cell,
			x: pos.x,
			y: pos.y,
			properties: {
				cpnPumpkinChunk: cpnPumpkinChunk,
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: this.blueprint
						};
					},
					blueprint: particles
				}
			},
			extraProperties: {
				pumpkinChunk: {
					caster: this.obj,
					isRotten: isRotten
				}
			}
		}]);
	}
};
