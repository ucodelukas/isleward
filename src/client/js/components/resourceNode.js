define([
	'js/misc/physics'
], function(
	physics
) {
	var bptParticles = {
		chance: 0.1,
		blueprint: {
			color: {
				start: 'f2f5f5'
			},
			alpha: {
				start: 0.75,
				end: 0.2
			},
			scale: {
				start: 6,
				end: 2
			},
			lifetime: {
				min: 1,
				max: 3
			},
			chance: 0.025
		}
	};


	return {
		type: 'resourceNode',

		init: function() {
			var x = this.obj.x;
			var y = this.obj.y;
			var w = this.obj.width || 1;
			var h = this.obj.height || 1;

			var isFish = (this.nodeType == 'fish');

			for (var i = x; i < x + w; i++) {
				for (var j = y; j < y + h; j++) {
					var bpt = $.extend(true, {}, bptParticles, {
						new: true
					});

					if (isFish) {
						if (!physics.isTileBlocking(i, j))
							continue;
						else if (Math.random() < 0.4)
							continue;

						$.extend(true, bpt, {
							blueprint: {
								color: {
									start: '48edff'
								},
								spawnType: 'rect',
								spawnRect: {
									x: 40 * (i - x),
									y: 40 * (j - y),
									w: 40,
									h: 40
								}
							}
						});
					}

					this.obj.addComponent('particles', bpt);
				}
			}
		}
	};
});