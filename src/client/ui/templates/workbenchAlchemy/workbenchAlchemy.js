define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/workbenchAlchemy/template',
	'css!ui/templates/workbenchAlchemy/styles'
], function (
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,

		centered: true,

		modal: true,

		skin: null,
		workbenchId: null,

		postRender: function () {
			this.onEvent('onOpenWorkbenchAlchemy', this.onOpenWorkbenchAlchemy.bind(this));
			this.onEvent('onCloseWorkbenchAlchemy', this.hide.bind(this));

			this.on('.btnCraft', 'click', this.craft.bind(this));
			this.on('.btnCancel', 'click', this.hide.bind(this));
		},

		onOpenWorkbenchAlchemy: function (msg) {
			this.workbenchId = msg.workbenchId;	
			console.log(msg);	

			this.show();
		},

		craft: function() {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					targetId: this.workbenchId,
					cpn: 'workbenchAlchemy',
					method: 'craft',
					data: {
						a: 10,
						c: 'abc'
					}
				}
			});
		}
	}
});
