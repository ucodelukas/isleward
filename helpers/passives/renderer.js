var renderer = {
	canvas: null,
	ctx: null,

	screen: {
		w: 0,
		h: 0
	},

	pos: {
		x: 0,
		y: 0
	},

	mouse: {
		x: 0,
		y: 0
	},

	dirty: false,

	init: function () {
		this.canvas = $('canvas')[0];
		this.screen.w = this.canvas.width = $('.left').width();
		this.screen.h = this.canvas.height = $('.left').height();
		this.ctx = this.canvas.getContext('2d');

		this.ctx.lineWidth = constants.lineWidth;

		$(this.canvas)
			.on('mousedown', this.events.onClick.bind(this))
			.on('mousemove', this.events.onMouseMove.bind(this))
			.on('contextmenu', function () {
				return false;
			});

		this.update();
	},

	center: function (node) {
		this.pos.x = ~~(node.pos.x * constants.gridSize) + (constants.blockSize / 2) - (this.screen.w / 2);
		this.pos.y = ~~(node.pos.y * constants.gridSize) + (constants.blockSize / 2) - (this.screen.h / 2);

		this.ctx.translate(-this.pos.x, -this.pos.y);
		this.makeDirty();
	},

	makeDirty: function () {
		this.dirty = true;
	},

	render: function () {
		var nodes = generator.nodes;
		var links = generator.links;

		links.forEach(function (l) {
			this.renderers.line.call(this, l.from, l.to);
		}, this);

		nodes.forEach(function (n) {
			this.renderers.node.call(this, n, n.pos.x, n.pos.y);
		}, this);
	},

	update: function () {
		if (this.dirty) {
			this.dirty = false;
			this.renderers.clear.call(this);
			this.renderers.grid.call(this);
			this.render();
		}

		window.requestAnimationFrame(this.update.bind(this));
	},

	renderers: {
		clear: function () {
			this.ctx.clearRect(this.pos.x, this.pos.y, this.screen.w, this.screen.h);
		},

		grid: function () {
			var gridSize = constants.gridSize;
			var ctx = this.ctx;
			var mouse = this.mouse;

			var w = this.screen.w / gridSize;
			var h = this.screen.h / gridSize;

			ctx.fillStyle = '#3c3f4c';
			for (var i = 0; i < w; i++) {
				for (var j = 0; j < h; j++) {
					if ((mouse.x == i) && (mouse.y == j)) {
						ctx.fillStyle = '#ff6942';
						ctx.fillRect((i * gridSize) - 25, (j * gridSize) - 25, 9, 9);
						ctx.fillStyle = '#3c3f4c';
					} else
						ctx.fillRect((i * gridSize) - 23, (j * gridSize) - 23, 5, 5);
				}
			}
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
			var x = (node.pos.x * constants.gridSize) - ((size - constants.blockSize) / 2);
			var y = (node.pos.y * constants.gridSize) - ((size - constants.blockSize) / 2);

			this.ctx.fillRect(x, y, size, size);

			if (node == generator.selected) {
				this.ctx.strokeStyle = '#fafcfc';
				this.ctx.strokeRect(x, y, size, size);
			}
		},

		line: function (fromNode, toNode) {
			var ctx = this.ctx;
			var halfSize = constants.blockSize / 2;

			var fromX = (fromNode.pos.x * constants.gridSize) + halfSize;
			var fromY = (fromNode.pos.y * constants.gridSize) + halfSize;

			var toX = (toNode.pos.x * constants.gridSize) + halfSize;
			var toY = (toNode.pos.y * constants.gridSize) + halfSize;

			ctx.strokeStyle = '#69696e';
			ctx.beginPath();
			ctx.moveTo(fromX, fromY);
			ctx.lineTo(toX, toY);
			ctx.closePath();
			ctx.stroke();
		}
	},

	events: {
		onClick: function (e) {
			generator.onClick(e.button, ~~((e.clientX + this.pos.x + 40) / constants.gridSize) - 1, ~~((e.clientY + this.pos.y + 40) / constants.gridSize) - 1);
			e.preventDefault();
			return false;
		},

		onMouseMove: function (e) {
			var mouseX = ~~((e.clientX + this.pos.x + 40) / constants.gridSize);
			var mouseY = ~~((e.clientY + this.pos.y + 40) / constants.gridSize);

			if ((this.mouse.x == mouseX) && (this.mouse.y == mouseY))
				return;

			this.mouse = {
				x: mouseX,
				y: mouseY
			};
			this.makeDirty();
		}
	}
};

var constants = {
	lineWidth: 5,
	blockSize: 20,
	defaultDistance: 50,
	defaultDistanceInc: 60,
	defaultAngle: Math.PI / 2,
	defaultAngleInc: Math.PI / 8,
	gridSize: 30
};
