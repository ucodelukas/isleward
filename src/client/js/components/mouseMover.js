define([
	'js/system/events',
	'js/rendering/renderer',
	'js/system/client',
	'js/input',
	'js/objects/objects'
], function (
	events,
	renderer,
	client,
	input,
	objects
) {
	var scale = 40;

	return {
		type: 'mouseMover',

		hoverTile: {
			x: 0,
			y: 0
		},

		path: [],

		pathColor: 'rgba(255, 255, 255, 0.5)',

		mouseDown: false,
		opacityCounter: 0,

		sprite: null,

		init: function () {
			events.on('onUiHover', this.onUiHover.bind(this, true));
			events.on('onUiLeave', this.onUiHover.bind(this, false));

			this.sprite = renderer.buildObject({
				layerName: 'effects',
				x: 0,
				y: 0,
				sheetName: 'ui',
				cell: 7
			});
		},

		clearPath: function () {
			this.path.forEach(function (p) {
				if (p.sprite) {
					renderer.destroyObject({
						sprite: p.sprite,
						layerName: 'effects'
					})
				}
			});

			this.path = [];
		},

		onUiHover: function (dunno, onUiHover) {
			if (!this.sprite)
				return;

			this.sprite.visible = !onUiHover;
		},

		showPath: function (e) {
			if ((e.button != null) && (e.button != 0))
				return;

			var tileX = ~~(e.x / scale);
			var tileY = ~~(e.y / scale);

			if ((tileX == this.hoverTile.x) && (tileY == this.hoverTile.y))
				return;

			events.emit('onChangeHoverTile', tileX, tileY);

			this.hoverTile.x = ~~(e.x / scale);
			this.hoverTile.y = ~~(e.y / scale);

			this.sprite.x = (this.hoverTile.x * scale);
			this.sprite.y = (this.hoverTile.y * scale);
		},
		queuePath: function (e) {
			this.mouseDown = false;

			if ((this.path.length == 0) || (e.down))
				return;

			client.request({
				cpn: 'player',
				method: 'moveList',
				data: this.path.map(function (p) {
					return {
						x: p.x,
						y: p.y
					}
				})
			});

			this.obj.pather.setPath(this.path);
			this.path = [];
		},

		update: function () {
			this.opacityCounter++;
			if (this.sprite)
				this.sprite.alpha = 0.35 + Math.abs(Math.sin(this.opacityCounter / 20) * 0.35);
			this.showPath(input.mouse);
		},

		destroy: function () {
			renderer.destroyObject({
				sprite: this.sprite,
				layerName: 'effects'
			});
		}
	};
});
