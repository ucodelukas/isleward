define([

], function (

) {
	var cpnPumpkinChunk = {
		type: 'pumpkinChunk',

		collisionEnter: function (o) {
			if (!o.player)
				return;

		}
	};

	return {
		type: 'scatterPumpkinPieces',

		cdMax: 5,
		manaCost: 0,

		spread: 7,
		range: 10,
		speed: 700,

		cast: function (action) {
			return this.shootChunk(action);
		},

		shootChunk: function (action) {
			var obj = this.obj;

			var physics = obj.instance.physics;

			var spread = this.spread;
			var toX = obj.x + ~~(Math.random() * spread * 2) - spread;
			var toY = obj.y + ~~(Math.random() * spread * 2) - spread;
			var target = physics.getClosestPos(
				obj.x,
				obj.y,
				toX,
				toY
			);

			if (!target)
				return false;

			var ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

			var projectileConfig = {
				caster: this.obj.id,
				components: [{
					idSource: this.obj.id,
					target: target,
					type: 'projectile',
					ttl: ttl,
					projectileOffset: null,
					particles: {
						particles: {
							color: {
								start: ['7a3ad3', '3fa7dd'],
								end: ['3fa7dd', '7a3ad3']
							},
							scale: {
								start: {
									min: 2,
									max: 14
								},
								end: {
									min: 0,
									max: 8
								}
							},
							lifetime: {
								min: 1,
								max: 3
							},
							alpha: {
								start: 0.7,
								end: 0
							},
							randomScale: true,
							randomColor: true,
							chance: 0.6
						}
					}
				}, {
					type: 'attackAnimation',
					layer: 'projectiles',
					loop: -1,
					row: 2,
					col: 4
				}]
			};

			this.sendAnimation(projectileConfig);

			this.queueCallback(this.createChunk.bind(this, target), ttl, null, target);

			return true;
		},

		createChunk: function (pos) {
			var obj = this.obj.instance.objects.buildObjects([{
				sheetName: 'objects',
				cell: 167,
				x: pos.x,
				y: pos.y,
				properties: {
					cpnPumpkinChunk: cpnPumpkinChunk
				}
			}]);
		}
	};
});
