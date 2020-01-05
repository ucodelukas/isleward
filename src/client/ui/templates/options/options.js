define([
	'js/system/events',
	'html!ui/templates/options/template',
	'css!ui/templates/options/styles',
	'js/rendering/renderer',
	'ui/factory',
	'js/objects/objects',
	'js/system/client',
	'js/sound/sound'
], function (
	events,
	template,
	styles,
	renderer,
	factory,
	objects,
	client,
	sound
) {
	return {
		tpl: template,
		centered: true,

		modal: true,

		postRender: function () {
            this.onEvent('onToggleOptions', this.toggle.bind(this));

			//Can only toggle fullscreen directly in a listener, not deferred the way jQuery does it
            this.el.find('.btnScreen')[0].addEventListener('click', this.toggleScreen.bind(this));
			this.el.find('.btnNames').on('click', events.emit.bind(events, 'onKeyDown', 'v'));
			this.el.find('.btnQuests').on('click', events.emit.bind(events, 'onToggleQuestVisibility'));
            this.el.find('.btnCloseOptions').on('click', this.toggle.bind(this));

			this.onEvent('onResize', this.onResize.bind(this));
		},

		toggleScreen: function () {
			this.el.find('.btnScreen').html(renderer.toggleScreen());
		},

		onResize: function () {
			let isFullscreen = (window.innerHeight === screen.height);
			if (isFullscreen)
				this.el.find('.btnScreen').html('Windowed');
			else
				this.el.find('.btnScreen').html('Fullscreen');
		},

		toggle: function () {
			this.onResize();

			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				events.emit('onShowOverlay', this.el);
			} else {
				this.hide();
				events.emit('onHideOverlay', this.el);
			}
        },
        
        onKeyDown: function (key) {
			if (key === 'esc')
				this.toggle();
		}
	};
});
