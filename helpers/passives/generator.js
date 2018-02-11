var generator = {
	links: [],
	nodes: [],

	selected: null,

	init: function () {
		this.actions.addNode.call(this, null, {
			x: 23,
			y: 14
		});

		renderer.center(this.nodes[0]);
	},

	onClick: function (button, x, y) {
		if (button == 0) {
			if (ui.shiftDown)
				this.actions.moveNode.call(this, x, y);
			else {
				this.actions.addNode.call(this, null, {
					x: x,
					y: y
				});
			}
		} else if (button == 1) {
			var node = this.findNode(x, y);
			if (node)
				this.actions.selectNode.call(this, node);
		} else if (button == 2) {
			var node = this.findNode(x, y);
			if (node)
				this.actions.connectNode.call(this, node);
		}

		renderer.makeDirty();
	},

	findNode: function (x, y) {
		return this.nodes.find(n => ((n.pos.x == x) && (n.pos.y == y)));
	},

	actions: {
		selectNode: function (node) {
			if (this.selected)
				this.selected.selected = false;
			node.selected = true;
			this.selected = node;

			ui.setActive(node);
		},

		addNode: function (parent, options = {}) {
			var node = tplNode.build({
				id: this.nodes.length,
				x: options.x,
				y: options.y
			});

			this.nodes.push(node);
		},

		connectNode: function (node) {
			if (this.selected) {
				if (ui.shiftDown) {
					this.links.spliceWhere(l => (
						(
							(l.from == node) ||
							(l.to == node)
						) &&
						(
							(l.from == this.selected) ||
							(l.to == this.selected)
						) &&
						(node != this.selected)
					));
				} else {
					this.links.push({
						from: this.selected,
						to: node
					});
				}
				this.selected = null;
			} else
				this.selected = node;
		},

		moveNode: function (x, y) {
			if (!this.selected)
				return;

			this.selected.pos.x = x;
			this.selected.pos.y = y;
		},

		recolorNode: function () {
			if (!this.selected)
				return;

			this.selected.color = (this.selected.color + 1) % 4;
		},

		resizeNode: function () {
			if (!this.selected)
				return;

			this.selected.size = (this.selected.size + 1) % 3;
		}
	}
};

var tplNode = {
	id: 0,
	color: 0,
	size: 0,
	pos: {
		x: 0,
		y: 0
	},

	build: function (options) {
		var res = $.extend(true, {}, this, {
			id: this.id++,
			pos: {
				x: options.x,
				y: options.y
			}
		});
		delete res.build;

		return res;
	}
};

$(function () {
	ui.init();
	renderer.init();
	generator.init();
})
