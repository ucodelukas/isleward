define([
	'js/tplNode'
], function (
	tplNode
) {
	return {
		links: [],
		nodes: [],

		selected: null,

		init: function () {
			this.actions.addNode.call(this, {
				x: 23,
				y: 14
			});
		},

		findNode: function (x, y) {
			return this.nodes.find(n => ((n.pos.x == x) && (n.pos.y == y)));
		},

		callAction: function (action, options = {}) {
			var node = options.node || this.findNode(options.x, options.y);
			if ((action == 'addNode') && (options.shiftDown))
				action = 'moveNode';

			options.node = node;
			this.actions[action].call(this, options);
		},

		actions: {
			selectNode: function (options) {
				if (this.selected)
					this.selected.selected = false;

				if (options.node)
					options.node.selected = true;
				this.selected = options.node;
			},

			addNode: function (options) {
				this.nodes.push(tplNode.build({
					id: this.nodes.length,
					x: options.x,
					y: options.y
				}));
			},

			connectNode: function (options) {
				var node = options.node;
				if (!node)
					return;

				if (this.selected) {
					if (options.shiftDown) {
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
					this.callAction('selectNode');
				} else {
					this.callAction('selectNode', {
						node: node
					})
				}
			},

			moveNode: function (options) {
				if (!this.selected)
					return;

				this.selected.pos.x = options.x;
				this.selected.pos.y = options.y;
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
});
