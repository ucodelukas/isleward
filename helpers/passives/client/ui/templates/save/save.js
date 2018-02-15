define([
	'html!./template',
	'css!./styles',
	'js/generator',
	'js/client'
], function (
	template,
	styles,
	generator,
	client
) {
	return {
		tpl: template,
		modal: true,
		centered: true,

		postRender: function () {
			this.on('.btnSave', 'click', this.actions.onSave.bind(this));
		},

		actions: {
			onSave: function () {
				var fileName = this.val('.fileName');
				var data = generator.serialize();
				client.save(fileName, data);
				this.destroy();
			}
		}
	}
});
