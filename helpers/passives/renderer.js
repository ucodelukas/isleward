var renderer = {
	canvas: null,
	ctx: null,

	screen: {
		width: 0,
		height: 0
	},

	pos: {
		x: 0,
		y: 0
	},

	dirty: false,

	constants: {
		lineWidth: 5,
		blockSize: 40
	},

	init: function () {
		this.canvas = $('canvas')[0];
		this.screen.width = this.canvas.width = $('body').width();
		this.screen.height = this.canvas.height = $('body').height();
		this.ctx = this.canvas.getContext('2d');

		this.update();
	},

	center: function (node) {
		this.pos.x = node.pos.x + (this.constants.blockSize / 2) - (this.screen.width / 2);
		this.pos.y = node.pos.y + (this.constants.blockSize / 2) - (this.screen.height / 2);

		this.ctx.translate(-this.pos.x, -this.pos.y);
		this.makeDirty();
	},

	makeDirty: function () {
		this.dirty = true;
	},

	render: function () {
		var nodes = generator.nodes;

		nodes.forEach(n => this.renderers.node.call(this, n));
	},

	update: function () {
		if (this.dirty) {
			this.dirty = false;
			this.render();
		}

		window.requestAnimationFrame(this.update.bind(this));
	},

	renderers: {
		node: function (node) {
			this.ctx.fillStyle = '#c0c3cf';
			this.ctx.fillRect(node.pos.x, node.pos.y, this.constants.blockSize, this.constants.blockSize)
		}
	}
};
