define([
	'js/constants',
	'js/events'
], function (
	constants,
	events
) {
	return {
		canvas: null,
		ctx: null,

		panOrigin: null,

		screen: {
			w: 0,
			h: 0
		},

		pos: {
			x: 0,
			y: 0
		},

		oldPos: null,

		mouse: {
			x: 0,
			y: 0
		},

		dirty: true,

		init: function () {
			this.canvas = $('.canvas')[0];
			this.screen.w = this.canvas.width = $('body').width();
			this.screen.h = this.canvas.height = $('body').height();
			this.ctx = this.canvas.getContext('2d');

			this.ctx.lineWidth = constants.lineWidth;

			$(this.canvas)
				.on('contextmenu', function () {
					return false;
				});

			events.on('onMouseMove', this.events.onMouseMove.bind(this));
			events.on('onStartAreaSelect', this.events.onStartAreaSelect.bind(this));
			events.on('onEndAreaSelect', this.events.onEndAreaSelect.bind(this));
		},

		center: function (node) {
			this.pos.x = ~~(node.pos.x * constants.gridSize) + (constants.blockSize / 2) - (this.screen.w / 2);
			this.pos.y = ~~(node.pos.y * constants.gridSize) + (constants.blockSize / 2) - (this.screen.h / 2);

			this.makeDirty();
		},

		pan: function (e, event) {
			var action = ({
				down: 'onPanStart',
				up: 'onPanEnd',
				move: 'onPan'
			})[event];

			this.events[action].call(this, e);
		},

		makeDirty: function () {
			this.dirty = true;
		},

		renderNodes: function (nodes, links) {
			links.forEach(function (l) {
				this.renderers.line.call(this, l.from, l.to);
			}, this);

			nodes.forEach(function (n) {
				this.renderers.node.call(this, n, n.pos.x, n.pos.y);
			}, this);
		},

		render: function (nodes, links) {
			this.dirty = false;

			this.renderers.clear.call(this);
			this.renderers.grid.call(this);

			this.renderNodes(nodes, links);
		},

		renderers: {
			clear: function () {
				var pos = this.oldPos || this.pos;

				this.ctx.clearRect(0, 0, this.screen.w, this.screen.h);

				delete this.oldPos;
			},

			grid: function () {
				var gridSize = constants.gridSize;
				var ctx = this.ctx;
				var mouse = this.mouse;

				var gapSize = (constants.blockSize - 4) / 2;

				var x = ~~(this.pos.x / gridSize) - (this.pos.x / gridSize);
				var y = ~~(this.pos.y / gridSize) - (this.pos.y / gridSize);

				w = ~~(this.screen.w / gridSize);
				h = ~~(this.screen.h / gridSize);

				ctx.fillStyle = '#3c3f4c';
				for (var i = x; i < w; i++) {
					for (var j = y; j < h; j++) {
						ctx.fillRect((i * gridSize) + gapSize, (j * gridSize) + gapSize, 4, 4);
					}
				}

				ctx.fillStyle = '#ff0000';
				ctx.fillRect(
					(this.mouse.x * constants.gridSize) - this.pos.x + (gapSize / 1),
					(this.mouse.y * constants.gridSize) - this.pos.y + (gapSize / 1),
					8,
					8
				);
			},

			node: function (node) {
				this.ctx.fillStyle = ([
					'#c0c3cf',
					'#3fa7dd',
					'#4ac441',
					'#d43346'
				])[node.color];
				var size = ([
					constants.blockSize,
					constants.blockSize * 2,
					constants.blockSize * 3
				])[node.size];
				var x = (node.pos.x * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.x;
				var y = (node.pos.y * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.y;

				this.ctx.fillRect(x, y, size, size);

				if (node.selected) {
					this.ctx.strokeStyle = '#fafcfc';
					this.ctx.strokeRect(x, y, size, size);
				}
			},

			line: function (fromNode, toNode) {
				var ctx = this.ctx;
				var halfSize = constants.blockSize / 2;

				var fromX = (fromNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var fromY = (fromNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				var toX = (toNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var toY = (toNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				ctx.strokeStyle = '#69696e';
				ctx.beginPath();
				ctx.moveTo(fromX, fromY);
				ctx.lineTo(toX, toY);
				ctx.closePath();
				ctx.stroke();
			}
		},

		events: {
			onMouseMove: function (pos) {
				if ((this.mouse.x == pos.x) && (this.mouse.y == pos.y))
					return;

				this.mouse = {
					x: pos.x,
					y: pos.y
				};
				this.makeDirty();
			},

			onPanStart: function (e) {
				this.panOrigin = {
					x: e.clientX,
					y: e.clientY
				};
			},

			onPan: function (e) {
				if (!this.panOrigin)
					return;

				if (!this.oldPos) {
					this.oldPos = {
						x: this.pos.x,
						y: this.pos.y
					};
				}

				this.pos.x += (this.panOrigin.x - e.clientX) * constants.scrollSpeed;
				this.pos.y += (this.panOrigin.y - e.clientY) * constants.scrollSpeed;

				this.panOrigin = {
					x: e.clientX,
					y: e.clientY
				};
			},

			onPanEnd: function (e) {
				this.panOrigin = null;
			},

			onStartAreaSelect: function (e) {
				this.areaSelectOrigin = {
					x: e.x,
					y: e.y
				};
			},

			onEndAreaSelect: function (e) {
				events.emit('onAreaSelect', this.areaSelectOrigin, e);
				this.areaSelectOrigin = null;
			}
		}
	};
});
