define([
	'html!./template',
	'css!./styles',
	'ui/factory',
	'js/generator',
	'js/renderer'
], function (
	template,
	styles,
	uiFactory,
	generator,
	renderer
) {
	return {
		tpl: template,

		loaded: null,

		postRender: function () {
			this.on('.btnNew', 'click', this.actions.onNew.bind(this));
			this.on('.btnLoad', 'click', this.actions.onLoad.bind(this));
			this.on('.btnSave', 'click', this.actions.onSave.bind(this));
		},

		actions: {
			onNew: function () {
				this.loaded = null;
				generator.callAction('reset');
				renderer.makeDirty();
			},

			onLoad: function () {
				uiFactory.build('load');
			},

			onSave: function () {
				uiFactory.build('save');
			}
		}
	}
});
