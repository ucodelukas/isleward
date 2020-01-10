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
		},
	};
});
