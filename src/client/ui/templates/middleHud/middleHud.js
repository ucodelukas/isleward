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

		isOnGatherNode: false,

		postRender: function () {
			this.onEvent('onGetSelfCasting', this.onGetCasting.bind(this));

			if (!isMobile) {
				this.onEvent('onEnterGatherNode', this.onEnterGatherNode.bind(this));
				this.onEvent('onExitGatherNode', this.onExitGatherNode.bind(this));
				this.onEvent('onRespawn', this.onExitGatherNode.bind(this));

				this.find('.btnGather').on('click', this.gather.bind(this));
			}
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
		},

		onEnterGatherNode: function (msg) {
			this.isOnGatherNode = true;

			this.toggleGatherButton(true);
		},

		onExitGatherNode: function (msg) {
			this.isOnGatherNode = false;

			this.toggleGatherButton(false);
		},

		toggleGatherButton: function (show) {
			let btn = this.find('.btnGather').hide();
			if (show)
				btn.show();
		},

		gather: function () {
			events.emit('onKeyDown', 'g');
		}
	};
});
