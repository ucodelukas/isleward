define([
	'js/system/events',
	'js/system/client',
	'ui/factory',
	'html!ui/templates/terms/template',
	'css!ui/templates/terms/styles',
    'js/rendering/renderer',
    'js/config'
], function (
	events,
	client,
	uiFactory,
	template,
	styles,
    renderer,
    config
) {
	return {
		tpl: template,
        centered: true,

		postRender: function () {
            this.tryAutoAccept();

            this.find('.btnCancel').on('click', this.cancel.bind(this));
            this.find('.btnAccept').on('click', this.accept.bind(this));
        },

        tryAutoAccept: function () {
            if (config.readTos)
                this.accept();
        },
        
        cancel: function () {
			window.location = window.location;
        },
        
        accept: function () {
            config.set('readTos', true);
            this.destroy();
            uiFactory.build('characters', {});
        }
	};
});
