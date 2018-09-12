define([
	'js/input',
	'js/system/client',
	'js/misc/physics',
	'js/system/events'
], function (
	input,
	client,
	physics,
	events
) {
	return {
		type: 'keyboardMover',

		moveCd: 0,
		moveCdMax: 8,

		init: function () {
			events.on('onCanvasKeyDown', this.onCanvasKeyDown.bind(this));
		},

		update: function () {
			if (this.obj.dead)
				return;

			if (this.obj.moveAnimation)
				this.obj.pather.clearPath();

			if (this.moveCd > 0) {
				this.moveCd--;
				return;
			}

			this.keyMove();
		},

		onCanvasKeyDown: function (keyEvent) {
			if (keyEvent.key === 'esc') {
				client.request({
					cpn: 'player',
					method: 'queueAction',
					data: {
						action: 'clearQueue',
						priority: true
					}
				});
			}
		},

		bump: function (dx, dy) {
			if (this.obj.pather.path.length > 0)
				return;

			this.obj.addComponent('bumpAnimation', {
				deltaX: dx,
				deltaY: dy
			});
		},

		keyMove: function () {
			let delta = {
				x: input.getAxis('horizontal'),
				y: input.getAxis('vertical')
			};

			if ((!delta.x) && (!delta.y))
				return;

			let newX = this.obj.pather.pathPos.x + delta.x;
			let newY = this.obj.pather.pathPos.y + delta.y;

			if (physics.isTileBlocking(~~newX, ~~newY)) {
				this.bump(delta.x, delta.y);
				return;
			}

			this.moveCd = this.moveCdMax;

			this.addQueue(newX, newY);
		},

		addQueue: function (x, y) {
			if (this.obj.moveAnimation)
				return;
			else if (!this.obj.pather.add(x, y))
				return;

			this.obj.dirty = true;			

			this.obj.pather.pathPos.x = x;
			this.obj.pather.pathPos.y = y;

			client.request({
				cpn: 'player',
				method: 'move',
				data: {
					x: x,
					y: y
				}
			});
		}
	};
});
