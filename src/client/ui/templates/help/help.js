define([
	'js/system/events',
	'html!ui/templates/help/template',
	'css!ui/templates/help/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,
		centered: true,

		modal: true,
		hasClose: true,

		postRender: function () {
			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onShowHelp', this.toggle.bind(this));
		},

		onKeyDown: function (key) {
			if (key === 'h') 
				this.toggle();
		}
	};
});
