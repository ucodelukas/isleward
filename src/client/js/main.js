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
	'js/sound/sound',
	'js/system/globals',
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
	resources,
	sound,
	globals
) {
	let fnQueueTick = null;
	const getQueueTick = updateMethod => {
		return () => requestAnimationFrame(updateMethod);
	};

	let restoreSoundOnFocus = false;

	return {
		hasFocus: true,

		lastRender: 0,
		msPerFrame: ~~(1000 / 60),

		init: function () {
			if (isMobile)			
				$('.ui-container').addClass('mobile');

			client.init(this.onClientReady.bind(this));
		},

		onClientReady: function () {
			client.request({
				module: 'clientConfig',
				method: 'getClientConfig',
				callback: this.onGetClientConfig.bind(this)
			});
		},

		onGetClientConfig: async function (config) {
			globals.clientConfig = config;

			await resources.init();
			events.emit('onResourcesLoaded');

			this.start();
		},

		start: function () {
			window.addEventListener('focus', this.onFocus.bind(this, true));
			window.addEventListener('blur', this.onFocus.bind(this, false));

			$(window).on('contextmenu', this.onContextMenu.bind(this));

			sound.init();

			objects.init();
			renderer.init();
			input.init();

			numbers.init();

			uiFactory.init(null);

			fnQueueTick = getQueueTick(this.update.bind(this));
			fnQueueTick();

			$('.loader-container').remove();
		},

		onFocus: function (isFocussed) {
			this.hasFocus = isFocussed;

			if (window.isMobile) {
				if (!this.hasFocus) {
					restoreSoundOnFocus = !sound.muted;
					sound.onToggleAudio(false);
				} else if (restoreSoundOnFocus) {
					sound.onToggleAudio(true);
					restoreSoundOnFocus = false;
				}
			}

			if (!isFocussed)
				input.resetKeys();
		},

		onContextMenu: function (e) {
			const allowed = ['txtUsername', 'txtPassword'].some(s => $(e.target).hasClass(s));
			if (!allowed) {
				e.preventDefault();
				return false;
			}
		},

		update: function () {
			const time = +new Date();
			if (time - this.lastRender < this.msPerFrame - 1) {
				fnQueueTick();

				return;
			}

			objects.update();
			renderer.update();
			uiFactory.update();
			numbers.update();

			renderer.render();

			this.lastRender = time;

			fnQueueTick();
		}
	};
});
