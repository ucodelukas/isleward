define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/mail/template',
	'css!ui/templates/mail/styles'
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

		item: null,

		postRender: function () {
			this.onEvent('onSetMailItem', this.onSetItem.bind(this));

			this.find('.btnSend').on('click', this.onSendClick.bind(this));
		},

		onSendClick: function () {
			if (!this.item)
				return;

			var recipient = this.find('.txtRecipient').val();
			if (recipient.length == 0)
				return;

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'inventory',
					method: 'mailItem',
					data: {
						itemId: this.item.id,
						recipient: recipient
					}
				},
				callback: this.onSend.bind(this)
			});
		},
		onSend: function (res) {
			if (res.length > 0) {
				events.emit('onGetAnnouncement', {
					msg: res,
					type: 'failure'
				});

				return;
			}

			this.hide();
		},

		onSetItem: function (msg) {
			this.toggle();
			this.item = msg.item;

			var item = msg.item;

			var imgX = -item.sprite[0] * 64;
			var imgY = -item.sprite[1] * 64;

			var spritesheet = item.spritesheet || '../../../images/items.png';
			if (item.material)
				spritesheet = '../../../images/materials.png';
			else if (item.quest)
				spritesheet = '../../../images/questItems.png';

			var el = this.find('.item');

			el
				.data('item', item)
				/*.on('mousemove', this.onHover.bind(this, el, item))
				.on('mouseleave', this.hideTooltip.bind(this, el, item))*/
				.find('.icon')
				.css('background', 'url(' + spritesheet + ') ' + imgX + 'px ' + imgY + 'px');

			if (item.quantity) {
				var quantityText = item.quantity;
				el.find('.quantity').html(item.quantity);
			} else
				el.find('.quantity').html('');
		},

		toggle: function () {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				this.find('input').focus();
			} else
				this.hide();
		}
	}
});
