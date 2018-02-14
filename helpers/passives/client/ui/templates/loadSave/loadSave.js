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

		postRender: function () {
			this.on('.btnLoad', 'click', this.events.onLoad.bind(this));
			this.on('.btnSave', 'click', this.events.onSave.bind(this));
		},

		events: {
			onLoad: function () {
				var fileName = this.val('.fileName');
				client.load(fileName, generator.actions.load.bind(generator));
			},

			onSave: function () {
				var fileName = this.val('.fileName');
				var data = generator.serialize();
				client.save(fileName, data, generator.actions.load.bind(generator));
			}
		}
	}
});
