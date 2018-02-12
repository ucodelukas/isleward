define([
	'js/events',
	'js/generator',
	'js/renderer',
	'js/input'
], function (
	events,
	generator,
	renderer,
	input
) {
	return {
		init: function () {
			generator.init();
			renderer.init();
			input.init();

			events.on('onMouseDown', this.events.onMouseDown.bind(this));
			events.on('onKeyDown', this.events.onKeyDown.bind(this));

			this.render();
		},

		render: function () {
			if (renderer.dirty)
				renderer.render(generator.nodes, generator.links);

			window.requestAnimationFrame(this.render.bind(this));
		},

		events: {
			onMouseDown: function (e) {
				var action = ([
					'addNode',
					'selectNode',
					'connectNode'
				])[e.button];

				generator.callAction(action, {
					x: e.x,
					y: e.y,
					shiftDown: input.isKeyDown('shift')
				});

				renderer.makeDirty();
			},

			onKeyDown: function (key) {
				var action = ({
					s: 'resizeNode',
					c: 'recolorNode'
				})[key];

				generator.callAction(action, {});

				renderer.makeDirty();
			}
		}
	};
});
