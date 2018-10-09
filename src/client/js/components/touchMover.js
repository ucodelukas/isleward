define([
	'js/system/client',
	'js/misc/physics',
	'js/system/events'
], function (
	client,
	physics,
	events
) {
	return {
		type: 'touchMover',

		lastNode: null,
		nodes: [],

		minSqrDistance: 9,

		init: function () {
			['onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'].forEach(e => this[e].bind(this));
		},

		onTouchStart: function (e) {
			this.lastNode = e;
		},

		onTouchMove: function (e) {
			const lastNode = this.lastNode;

			let sqrDistance = Math.pow(lastNode.x - e.x, 2) + Math.pow(lastNode.y - e.y, 2);
			if (sqrDistance < this.minSqrDistance)
				return;

			let dx = 1;
			let dy = 0;

			let newX = this.obj.pather.pathPos.x + dx;
			let newY = this.obj.pather.pathPos.y + dy;

			if (physics.isTileBlocking(~~newX, ~~newY)) {
				this.bump(dx, dy);
				return;
			}

			this.obj.pather.addQueue(newX, newY);
		},

		onTouchEnd: function () {
			this.lastNode = null;
		},

		onTouchCancel: function () {
			this.lastNode = null;
		},

		ump: function (dx, dy) {
			if (this.obj.pather.path.length > 0)
				return;

			this.obj.addComponent('bumpAnimation', {
				deltaX: dx,
				deltaY: dy
			});
		}
	};
});
