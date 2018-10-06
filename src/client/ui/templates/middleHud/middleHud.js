define([
	'js/system/events',
	'html!ui/templates/middleHud/template',
	'css!ui/templates/middleHud/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,

		postRender: function () {
			this.onEvent('onGetSelfCasting', this.onGetCasting.bind(this));
		},

		onGetCasting: function (casting) {
			let el = this.find('.casting');

			if ((casting === 0) || (casting === 1))
				el.hide();
			else {
				el
					.show()
					.find('.bar')
					.width((casting * 100) + '%');
			}
		}
	};
});
