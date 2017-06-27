define([
	'js/system/client',
	'js/system/events',
	'js/misc/physics'
], function(
	client,
	events,
	physics
) {
	return {
		type: 'gatherer',
		effect: null,

		init: function() {
			this.obj.on('onKeyDown', this.onKeyDown.bind(this));
		},

		extend: function(msg) {
			if (msg.width) {
				if (this.effect)
					this.effect.destroyed = true;

				var x = 0;
				var y = 0;
				while (true) {
					x = msg.x + ~~(Math.random() * msg.width);
					y = msg.y + ~~(Math.random() * msg.height);
					if ((physics.isTileBlocking(x, y)) && (Math.max(Math.abs(x - this.obj.x), Math.abs(y - this.obj.y)) > 2))
						break;
				}

				this.effect = this.obj.addComponent('lightningEffect', {
					new: true,
					toX: x,
					toY: y,
					ttl: -1,
					divisions: 4,
					cdMax: 12,
					colors: [0xfafcfc, 0xc0c3cf, 0xc0c3cf],
					maxDeviate: 5
				});
			} else {
				if (msg.progress == 100) {
					this.effect.destroyed = true;
					this.effect = null;
				}

				events.emit('onShowProgress', (msg.action || 'Gathering') + '...', msg.progress);
			}
		},

		onKeyDown: function(key) {
			if (key != 'g')
				return;

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'gatherer',
					method: 'gather'
				}
			});
		}
	};
});