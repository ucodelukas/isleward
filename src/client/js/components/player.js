define([
	'js/rendering/renderer',
	'js/system/events',
	'js/misc/physics',
	'js/sound/sound'
], function (
	renderer,
	events,
	physics,
	sound
) {
	let scale = 40;

	return {
		type: 'player',

		oldPos: {
			x: 0,
			y: 0
		},

		init: function () {
			this.obj.addComponent('keyboardMover');
			this.obj.addComponent('mouseMover');
			this.obj.addComponent('serverActions');

			this.obj.addComponent('pather');

			events.emit('onGetPortrait', this.obj.portrait);
		},

		update: function () {
			let obj = this.obj;
			let oldPos = this.oldPos;

			if ((oldPos.x === obj.x) && (oldPos.y === obj.y))
				return;

			let dx = obj.x - oldPos.x;
			let dy = obj.y - oldPos.y;

			let instant = false;
			if ((dx > 5) || (dy > 5))
				instant = true;

			if (dx !== 0)
				dx = dx / Math.abs(dx);
			if (dy !== 0)
				dy = dy / Math.abs(dy);

			this.oldPos.x = this.obj.x;
			this.oldPos.y = this.obj.y;

			this.canvasFollow({
				x: dx,
				y: dy
			}, instant);

			sound.update(obj.x, obj.y);
		},

		extend: function (blueprint) {
			if (blueprint.collisionChanges) {
				blueprint.collisionChanges.forEach(function (c) {
					physics.setCollision(c.x, c.y, c.collides);
				});

				delete blueprint.collisionChanges;
			}
		},

		canvasFollow: function (delta, instant) {
			let obj = this.obj;
			delta = delta || {
				x: 0,
				y: 0
			};

			renderer.setPosition({
				x: (obj.x - (renderer.width / (scale * 2))) * scale,
				y: (obj.y - (renderer.height / (scale * 2))) * scale
			}, instant);
		}
	};
});
