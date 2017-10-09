define([

], function (

) {
	var cpnPumpkinChunk = {
		type: 'pumpkinChunk',

		collisionEnter: function (o) {
			if (!o.aggro)
				return;

			var isPlayer = !!this.caster.player;
			var isTargetPlayer = !!o.player;

			if ((!this.caster.aggro.canAttack(o)) && (isPlayer == isTargetPlayer))
				return;

			this.contents.push(o);
		}
	};

	return {
		type: 'scatterPumpkinPieces',

		cdMax: 5,
		manaCost: 0,

		range: 10,

		cast: function (action) {
			this.shootChunk(action);
		},

		shootChunk: function (action) {
			var obj = this.obj;
			var speed = 150;
			var target = action.target;

			var ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * speed) - 50;

			var projectileConfig = {
				caster: this.obj.id,
				components: [{
					idSource: this.obj.id,
					idTarget: target.id,
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
					row: 0,
					col: 0
				}]
			};

			this.sendAnimation(projectileConfig);
		}
	};
});
