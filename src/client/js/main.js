define([
	'js/system/client',
	'ui/factory',
	'js/rendering/renderer',
	'js/objects/objects',
	'js/rendering/effects',
	'js/rendering/numbers',
	'js/input',
	'js/system/events',
	'js/resources',
	'ui/templates/online/online',
	'ui/templates/tooltips/tooltips'
], function (
	client,
	uiFactory,
	renderer,
	objects,
	effects,
	numbers,
	input,
	events,
	resources
) {
	return {
		hasFocus: true,

		init: function () {
			client.init(this.onClientReady.bind(this));
		},

		onClientReady: function () {
			client.request({
				module: 'clientConfig',
				method: 'getResourcesList',
				callback: this.onGetResourceList.bind(this)
			});
		},

		onGetResourceList: function (list) {
			resources.init(list);

			events.on('onResourcesLoaded', this.start.bind(this));
		},

		start: function () {
			window.onfocus = this.onFocus.bind(this, true);
			window.onblur = this.onFocus.bind(this, false);

			$(window).on('contextmenu', this.onContextMenu.bind(this));

			objects.init();
			renderer.init();
			input.init();

			numbers.init();

			uiFactory.init();
			uiFactory.build('login', 'body');

			this.update();
			this.render();
		},

		onFocus: function (hasFocus) {
			//Hack: Later we might want to make it not render when out of focus
			this.hasFocus = true;

			if (!hasFocus)
				input.resetKeys();
		},

		onContextMenu: function (e) {
			const allowed = ['txtUsername', 'txtPassword'].some(s => $(e.target).hasClass(s));
			if (!allowed) {
				e.preventDefault();
				return false;
			}
		},

		render: function () {
			numbers.render();
			renderer.render();

			requestAnimationFrame(this.render.bind(this));
		},
		
		update: function () {
			objects.update();
			renderer.update();
			uiFactory.update();

			setTimeout(this.update.bind(this), 16);
		}
	};
});
