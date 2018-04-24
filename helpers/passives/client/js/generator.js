define([
	'js/tplNode',
	'js/events',
	'js/client',
	'js/input'
], function (
	tplNode,
	events,
	client,
	input
) {
	return {
		links: [],
		nodes: [],

		mode: 'none',

		init: function () {
			events.on('onAreaSelect', this.events.onAreaSelect.bind(this));
			events.on('onMouseMove', this.events.onMouseMove.bind(this));
		},

		findNode: function (x, y) {
			var res = this.nodes.find(n => ((n.pos.x == x) && (n.pos.y == y)));
			if (!res) {
				res = this.nodes.find(function (n) {
					return ((n.size > 0) && (Math.abs(n.pos.x - x) <= 1) && (Math.abs(n.pos.y - y) <= 1))
				});
			}

			return res;
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

		serialize: function () {
			return JSON.stringify({
				nodes: this.nodes,
				links: this.links
			});
		},

		getNextId: function () {
			for (var i = 0; i < this.nodes.length; i++) {
				if (!this.nodes.some(n => (n.id == i)))
					return i;
			}

			return this.nodes.length;
		},

		setMode: function (mode) {
			this.mode = mode;
		},

		actions: {
			reset: function () {
				this.nodes = [];
				this.links = [];

				events.emit('onNew');
			},

			load: function (data) {
				this.nodes = data.nodes;
				this.nodes.forEach(function (n) {
					if ((n.group) && (!n.group.push))
						n.group = [n.group];
				});

				this.links = data.links.map(function (l) {
					l.from = this.nodes.find(n => (n.id == l.from.id));
					l.to = this.nodes.find(n => (n.id == l.to.id));

					return l;
				}, this);

				events.emit('onTreeLoaded', {
					nodes: this.nodes,
					links: this.links
				});
			},

			selectNode: function (options) {
				if (
					(
						(!options.node) ||
						(!this.nodes.some(n => ((n.selected) && (n == options.node))))
					) &&
					(
						(!input.isKeyDown('shift')) ||
						(options.force)
					)
				)
					this.nodes.forEach(n => (n.selected = false));

				if (options.node)
					options.node.selected = true;
				else if (options instanceof Array)
					options.forEach(n => (n.selected = true));

				events.emit('onSelectNode', this.nodes.filter(n => n.selected));

				if (options.node)
					events.emit('onFocusNode', options.node);

				return !options.node;
			},

			addNode: function (options) {
				this.nodes.push(tplNode.build({
					id: this.getNextId(),
					x: options.x,
					y: options.y
				}));

				this.callAction('selectNode');
			},

			connectNode: function (options) {
				var node = options.node;
				if (!node) {
					this.callAction('selectNode');
					return true;
				}

				var singleSelected = this.getSelected(true);

				if ((singleSelected) && (input.isKeyDown('ctrl'))) {
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
					this.callAction('selectNode', {
						force: true
					});

					this.callAction('selectNode', {
						node: options.node
					});
				} else {
					return this.callAction('selectNode', {
						node: node
					})
				}
			},

			moveNode: function (options) {
				var selected = this.getSelected();
				if (!selected.length)
					return true;

				if (selected.length == 0)
					return;

				selected.sort(function (a, b) {
					var distanceA = Math.abs(a.pos.x - options.x) + Math.abs(a.pos.y - options.y);
					var distanceB = Math.abs(b.pos.x - options.x) + Math.abs(b.pos.y - options.y);

					return (distanceA > distanceB) ? 1 : -1;
				});

				var deltaX = selected[0].pos.x - options.x;
				var deltaY = selected[0].pos.y - options.y;

				selected.forEach(function (s) {
					s.pos.x -= deltaX;
					s.pos.y -= deltaY;
				});
			},

			deleteNode: function (options) {
				var selected = this.getSelected();
				selected.forEach(function (s) {
					this.nodes.spliceWhere(n => (n == s));
					this.links.spliceWhere(n => ((n.from == s) || (n.to == s)));

					s.selected = false;

					events.emit('onDeleteNode', s);
				}, this);
			},

			recolorNode: function () {
				var selected = this.getSelected(true);
				if (!selected)
					return true;

				selected.color = (selected.color + 1) % 5;
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
				if (!input.isKeyDown('ctrl'))
					this.nodes.forEach(n => (n.selected = false));

				var lowX = Math.min(from.x, to.x);
				var lowY = Math.min(from.y, to.y);

				var highX = Math.max(from.x, to.x);
				var highY = Math.max(from.y, to.y);

				for (var i = lowX; i <= highX; i++) {
					for (var j = lowY; j <= highY; j++) {
						var node = this.findNode(i, j);
						if (!node)
							continue;
						node.selected = true;
					}
				}

				events.emit('onSelectNode', this.nodes.filter(n => n.selected));
			},

			onMouseMove: function (e) {
				var hoverNode = this.findNode(e.x, e.y);
				if (hoverNode) {
					var text = '';
					var stats = hoverNode.stats || {};
					for (var s in stats) {
						text += s + ': ' + stats[s] + '<br />';
					}
					text = text.substr(0, text.length - 6);

					if (text.length > 0)
						events.emit('onShowTooltip', e, text);
				} else
					events.emit('onHideTooltip');
			}
		}
	};
});
