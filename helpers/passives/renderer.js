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

	dirty: false,

	init: function () {
		this.canvas = $('canvas')[0];
		this.screen.w = this.canvas.width = $('body').width();
		this.screen.h = this.canvas.height = $('body').height();
		this.ctx = this.canvas.getContext('2d');

		$(this.canvas)
			.on('mousedown', this.events.onClick.bind(this))
			.on('contextmenu', function () {
				return false;
			});

		this.update();
	},

	center: function (node) {
		this.pos.x = node.pos.x + (constants.blockSize / 2) - (this.screen.w / 2);
		this.pos.y = node.pos.y + (constants.blockSize / 2) - (this.screen.h / 2);

		this.ctx.translate(-this.pos.x, -this.pos.y);
		this.makeDirty();
	},

	makeDirty: function () {
		this.dirty = true;
	},

	render: function (nodes) {
		var nodes = nodes || generator.nodes;

		nodes.forEach(function (n) {
			var x = n.pos.x;
			var y = n.pos.y;

			if (n.parent) {
				var childIndex = n.parent.children.findIndex(c => (c == n));
				n.pos.x = x = n.parent.pos.x + (Math.cos(n.angle * childIndex) * n.distance);
				n.pos.y = y = n.parent.pos.y + (Math.sin(n.angle * childIndex) * n.distance);
			}

			if (n.children.length > 0)
				this.render(n.children);

			n.children.forEach(function (c) {
				this.renderers.line.call(this, n, c);
			}, this);

		}, this);

		nodes.forEach(function (n) {
			if (n.children.length > 0)
				this.render(n.children);

			this.renderers.node.call(this, n, n.pos.x, n.pos.y);
		}, this);
	},

	update: function () {
		if (this.dirty) {
			this.dirty = false;
			this.renderers.clear.call(this);
			this.render();
		}

		window.requestAnimationFrame(this.update.bind(this));
	},

	renderers: {
		clear: function () {
			this.ctx.clearRect(this.pos.x, this.pos.y, this.screen.w, this.screen.h);
		},

		node: function (node, x, y) {
			this.ctx.fillStyle = '#c0c3cf';
			this.ctx.fillRect(x, y, constants.blockSize, constants.blockSize)
		},

		line: function (fromNode, toNode) {
			var ctx = this.ctx;
			var halfSize = constants.blockSize / 2;

			ctx.strokeStyle = '#69696e';
			ctx.beginPath();
			ctx.moveTo(~~(fromNode.pos.x + halfSize) + 0.5, ~~(fromNode.pos.y + halfSize) + 0.5);
			ctx.lineTo(~~(toNode.pos.x + halfSize) + 0.5, ~~(toNode.pos.y + halfSize) + 0.5);
			ctx.closePath();
			ctx.stroke();
		}
	},

	events: {
		onClick: function (e) {
			generator.onClick(e.button, e.clientX + this.pos.x, e.clientY + this.pos.y);
			e.preventDefault();
			return false;
		}
	}
};

var constants = {
	lineWidth: 5,
	blockSize: 40,
	defaultDistance: 100,
	defaultDistanceInc: 50,
	defaultAngle: Math.PI / 2,
	defaultAngleInc: Math.PI / 8
};
