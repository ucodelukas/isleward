define([
	'js/tplNode',
	'js/events'
], function (
	tplNode,
	events
) {
	return {
		links: [],
		nodes: [],

		init: function () {
			events.on('onAreaSelect', this.events.onAreaSelect.bind(this));

			this.actions.addNode.call(this, {
				x: 100,
				y: 100
			});
		},

		findNode: function (x, y) {
			return this.nodes.find(n => ((n.pos.x == x) && (n.pos.y == y)));
		},

		callAction: function (action, options = {}) {
			var node = options.node || this.findNode(options.x, options.y);

			options.node = node;
			return !this.actions[action].call(this, options);
		},

		getSelected: function (single) {
			var selected = this.nodes.filter(n => n.selected);
			if ((single) && (selected.length != 1))
				return null;

			if (single)
				return selected[0];
			else
				return selected;
		},

		actions: {
			selectNode: function (options) {
				if (
					(!options.node) ||
					(!this.nodes.some(n => ((n.selected) && (n == options.node))))
				)
					this.nodes.forEach(n => (n.selected = false));

				if (options.node)
					options.node.selected = true;

				return !options.node;
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
					return true;

				var singleSelected = this.getSelected(true);

				if (singleSelected) {
					if (options.shiftDown) {
						this.links.spliceWhere(l => (
							(
								(l.from == node) ||
								(l.to == node)
							) &&
							(
								(l.from == singleSelected) ||
								(l.to == singleSelected)
							) &&
							(node != singleSelected)
						));
					} else {
						this.links.push({
							from: singleSelected,
							to: node
						});
					}
					return this.callAction('selectNode');
				} else {
					return this.callAction('selectNode', {
						node: node
					})
				}
			},

			moveNode: function (options) {
				var selected = this.getSelected();
				if (!selected.length) {
					selected = this.findNode(options.x, options.y);
					if (!selected)
						return true;

					this.callAction('selectNode', {
						node: selected
					});
				}

				selected.forEach(function (s) {
					s.pos.x = options.x;
					s.pos.y = options.y;
				});
			},

			deleteNode: function (options) {
				var selected = this.getSelected(true);
				this.nodes.spliceWhere(n => (n == selected));
				this.links.spliceWhere(n => ((n.from == selected) || (n.to == selected)));

				selected.selected = false;
			},

			recolorNode: function () {
				var selected = this.getSelected(true);
				if (!selected)
					return true;

				selected.color = (selected.color + 1) % 4;
			},

			resizeNode: function () {
				var selected = this.getSelected(true);
				if (!selected)
					return true;

				selected.size = (selected.size + 1) % 3;
			}
		},

		events: {
			onAreaSelect: function (from, to) {
				this.nodes.forEach(n => (n.selected = false));

				for (var i = from.x; i <= to.x; i++) {
					for (var j = from.y; j <= to.y; j++) {
						var node = this.findNode(i, j);
						if (!node)
							continue;
						node.selected = true;
					}
				}

				console.log(this.getSelected());
			}
		}
	};
});
