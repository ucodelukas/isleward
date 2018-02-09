var generator = {
	nodes: [],

	init: function () {
		this.addNode({
			x: 100,
			y: 100
		});

		renderer.center(this.nodes[0]);
	},

	addNode: function (options) {
		var nodes = this.nodes;
		nodes.push(tplNode.build({
			id: nodes.length,
			x: options.x,
			y: options.y
		}));

		renderer.makeDirty();
	}
};

var tplNode = {
	id: 0,
	parents: [],
	children: [],
	pos: {
		x: 0,
		y: 0
	},

	build: function (options) {
		var res = $.extend(true, {}, this, {
			id: options.id,
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
	renderer.init();
	generator.init();
})
