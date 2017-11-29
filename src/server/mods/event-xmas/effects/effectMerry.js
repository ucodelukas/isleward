define([

], function (

) {
	return {
		type: 'merry',
		particles: null,

		persist: true,

		init: function (source) {
			this.particles = this.obj.instance.objects.buildObjects([{
				x: this.obj.x,
				y: this.obj.y,
				properties: {
					cpnParticles: {
						simplify: function () {
							return {
								type: 'particles',
								blueprint: {
									color: {
										start: ['ff4252', '80f643', 'db5538', 'faac45', 'a24eff', 'fc66f7'],
										end: ['ff4252', '80f643', 'db5538', 'faac45', 'a24eff', 'fc66f7']
									},
									scale: {
										start: {
											min: 4,
											max: 10
										},
										end: {
											min: 4,
											max: 6
										}
									},
									speed: {
										start: {
											min: 0,
											max: 3
										},
										end: {
											min: 0,
											max: 1
										}
									},
									lifetime: {
										min: 1,
										max: 2
									},
									alpha: {
										start: 1,
										end: 1
									},
									randomScale: true,
									randomSpeed: true,
									chance: 0.05,
									randomColor: true,
									blendMode: 'add',
									spawnType: 'ring',
									spawnCircle: {
										r: 20,
										minR: 19
									}
								}
							}
						}
					}
				}
			}]);
		},

		simplify: function () {
			return {
				type: 'merry',
				ttl: this.ttl
			};
		},

		save: function () {
			return {
				type: 'merry',
				ttl: this.ttl
			};
		},

		events: {
			beforeMove: function (targetPos) {
				var particles = this.particles;

				particles.x = targetPos.x;
				particles.y = targetPos.y;

				var syncer = particles.syncer;
				syncer.o.x = particles.x;
				syncer.o.y = particles.y;
			},

			beforeRezone: function () {
				this.particles.destroyed = true;
			}
		}
	};
});
