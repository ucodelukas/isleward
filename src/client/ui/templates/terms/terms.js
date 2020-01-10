define([
	'js/system/events',
	'js/system/client',
	'ui/factory',
	'html!ui/templates/terms/template',
	'css!ui/templates/terms/styles',
	'js/rendering/renderer'
], function (
	events,
	client,
	uiFactory,
	template,
	styles,
	renderer
) {
	return {
		tpl: template,
		centered: true,

		postRender: function () {
            this.find('.btnCancel').on('click', this.cancel.bind(this));
            this.find('.btnAccept').on('click', this.accept.bind(this));
        },
        
        cancel: function () {
			window.location = window.location;
        },
        
        accept: function () {
            this.destroy();
            uiFactory.build('characters', {});
        }
	};
});
