define([
	'html!./template',
	'css!./styles',
	'ui/factory'
], function (
	template,
	styles,
	uiFactory
) {
	return {
		tpl: template,

		postRender: function () {
			this.on('.btnLoad', 'click', this.actions.onLoad.bind(this));
			this.on('.btnSave', 'click', this.actions.onSave.bind(this));
		},

		actions: {
			onLoad: function () {
				uiFactory.build('load');
			},

			onSave: function () {
				uiFactory.build('save');
			}
		}
	}
});
