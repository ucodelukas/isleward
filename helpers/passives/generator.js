var generator = {
	nodes: [],

	init: function () {
		this.actions.addNode.call(this, null, {
			x: 100,
			y: 100
		});

		renderer.center(this.nodes[0]);
	},

	onClick: function (button, x, y) {
		var node = this.findNode(x, y);
		if (!node)
			return;

		if (button == 0)
			this.actions.addNode.call(this, node);
		else if (button == 1)
			this.actions.rotateNode.call(this, node);
		else if (button == 2)
			this.actions.extendNode.call(this, node);

		renderer.makeDirty();
	},

	findNode: function (x, y, nodes) {
		nodes = nodes || this.nodes;

		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];

			if (!(
					(n.pos.x > x) ||
					(n.pos.y > y) ||
					(n.pos.x + constants.blockSize <= x) |
					(n.pos.y + constants.blockSize <= y)
				))
				return n;
			else {
				var f = this.findNode(x, y, n.children);
				if (f)
					return f;
			}
		}
	},

	actions: {
		addNode: function (parent, options = {}) {
			var nodes = this.nodes;

			if (parent)
				options.angle = constants.defaultAngle;

			var node = tplNode.build({
				id: nodes.length,
				angle: options.angle,
				x: options.x,
				y: options.y,
				parent: parent,
				distance: constants.defaultDistance
			});

			if (parent)
				parent.children.push(node);
			else
				nodes.push(node);
		},

		rotateNode: function (node) {
			var newAngle = node.angle - constants.defaultAngleInc;
			node.parent.children.forEach(n => (n.angle = newAngle));
			console.log(node.parent);
		},

		extendNode: function (node) {
			node.distance += constants.defaultDistanceInc;
		}
	}
};

var tplNode = {
	id: 0,
	children: [],
	pos: {
		x: 0,
		y: 0
	},

	build: function (options) {
		var res = $.extend(true, {
			parent: options.parent
		}, this, {
			id: this.id++,
			pos: {
				x: options.x,
				y: options.y
			},
			distance: options.distance,
			angle: options.angle
		});
		delete res.build;

		return res;
	}
};

$(function () {
	renderer.init();
	generator.init();
})
