var ui = {
	node: null,
	shiftDown: false,

	init: function () {
		$(window)
			.on('keydown', this.events.onKey.bind(this, true))
			.on('keyup', this.events.onKey.bind(this, false));
	},

	find: function (selector) {
		return $('.right').find('.' + selector).eq(0);
	},

	setActive: function (node) {
		this.node = node;
		this.find('id').html(node.id);
	},

	events: {
		onKey: function (isDown, e) {
			if (e.key == 'Shift')
				this.shiftDown = isDown;

			if (!isDown)
				return;

			if (e.key == 'c') {
				generator.actions.recolorNode.call(generator);
				renderer.makeDirty();
			} else if (e.key == 's') {
				generator.actions.resizeNode.call(generator);
				renderer.makeDirty();
			}
		}
	}
};
