define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/passives/template',
	'css!ui/templates/passives/styles',
	'ui/templates/passives/constants',
	'ui/templates/passives/temp'
], function (
	events,
	client,
	tpl,
	styles,
	constants,
	temp
) {
	return {
		tpl: tpl,

		modal: true,
		centered: true,

		canvas: null,
		size: {},
		ctx: null,

		pos: {
			x: 0,
			y: 0
		},

		data: {
			nodes: null,
			links: null
		},

		postRender: function () {
			var data = JSON.parse(temp.json);
			this.data.nodes = data.nodes;
			this.data.links = data.links;

			//We need to be able to determine the size of elements
			this.el.css({
				visibility: 'hidden',
				display: 'block'
			});

			this.canvas = this.find('.canvas')[0];
			this.size.w = this.canvas.width = this.find('.bottom').width();
			this.size.h = this.canvas.height = this.find('.bottom').height();
			this.ctx = this.canvas.getContext('2d');

			//Reset styles after determining size
			this.el.css({
				visibility: 'visible',
				display: 'none'
			});

			this.ctx.lineWidth = constants.lineWidth;

			$(this.canvas)
				.on('contextmenu', function () {
					return false;
				});

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));

			//Calculate midpoint
			this.data.nodes.forEach(function (n) {
				this.pos.x += n.pos.x;
				this.pos.y += n.pos.y;
			}, this);

			this.pos.x = ~~(this.pos.x / this.data.nodes.length) * constants.gridSize;
			this.pos.y = ~~(this.pos.y / this.data.nodes.length) * constants.gridSize;
		},

		renderNodes: function () {
			this.renderers.clear.call(this);

			var links = this.data.links;
			var nodes = this.data.nodes;

			links.forEach(function (l) {
				var linked = (
					nodes.find(n => (n.id == l.from.id)).selected &&
					nodes.find(n => (n.id == l.to.id)).selected
				);
				this.renderers.line.call(this, l.from, l.to, linked);
			}, this);

			nodes.forEach(function (n) {
				this.renderers.node.call(this, n, n.pos.x, n.pos.y);
			}, this);
		},

		toggle: function (show) {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				this.renderNodes();
			} else
				this.hide();
		},

		onKeyDown: function (key) {
			if (key == 'p')
				this.toggle();
		},

		renderers: {
			clear: function () {
				var pos = this.oldPos || this.pos;

				this.ctx.clearRect(0, 0, this.size.w, this.size.h);

				delete this.oldPos;
			},

			node: function (node) {
				var color = (node.color >= 0) ? (node.color + 1) : -1;
				if ((!node.stats) || (Object.keys(node.stats).length == 0))
					color = 0;

				this.ctx.fillStyle = ([
					'#69696e',
					'#c0c3cf',
					'#3fa7dd',
					'#4ac441',
					'#d43346',
					'#a24eff'
				])[color];
				var size = ([
					constants.blockSize,
					constants.blockSize * 2,
					constants.blockSize * 3
				])[node.size];
				var x = (node.pos.x * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.x;
				var y = (node.pos.y * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.y;

				this.ctx.fillRect(x, y, size, size);

				this.ctx.strokeStyle = ([
					'#69696e',
					'#69696e',
					'#42548d',
					'#386646',
					'#763b3b',
					'#533399'
				])[color];
				this.ctx.strokeRect(x, y, size, size);

				if (node.selected) {
					this.ctx.strokeStyle = '#fafcfc';
					this.ctx.strokeRect(x, y, size, size);
				}
			},

			line: function (fromNode, toNode, linked) {
				var ctx = this.ctx;
				var halfSize = constants.blockSize / 2;

				var fromX = (fromNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var fromY = (fromNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				var toX = (toNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var toY = (toNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				ctx.strokeStyle = linked ? '#fafcfc' : '#69696e';
				ctx.beginPath();
				ctx.moveTo(fromX, fromY);
				ctx.lineTo(toX, toY);
				ctx.closePath();
				ctx.stroke();
			}
		}
	}
});
