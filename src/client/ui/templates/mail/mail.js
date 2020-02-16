define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/mail/template',
	'css!ui/templates/mail/styles',
	'ui/shared/renderItem'
], function (
	events,
	client,
	template,
	styles,
	renderItem
) {
	return {
		tpl: template,

		centered: true,

		modal: true,
		hasClose: true,

		hoverItem: null,

		item: null,

		postRender: function () {
			this.onEvent('onSetMailItem', this.onSetItem.bind(this));
			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));

			this.find('input').on('keydown', this.onInputKeyDown.bind(this));
			this.find('.btnSend').on('click', this.onSendClick.bind(this));
		},

		onSendClick: function () {
			if (!this.item)
				return;

			let recipient = this.find('.txtRecipient').val();
			if (recipient.length === 0)
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

			const itemContainer = this.find('.itemContainer').empty();
			let item = msg.item;

			const itemEl = renderItem(itemContainer, item);

			this.find('.txtRecipient').val('');

			let moveHandler = this.onHover.bind(this, itemEl, item);
			let downHandler = () => {};
			if (isMobile) {
				moveHandler = () => {};
				downHandler = this.onHover.bind(this, itemEl, item);
			}

			itemEl
				.data('item', item)
				.on('mousedown', downHandler)
				.on('mousemove', moveHandler)
				.on('mouseleave', this.hideTooltip.bind(this, itemEl, item));
		},

		toggle: function () {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				this.find('input').focus();
			} else
				this.hide();
		},

		hideTooltip: function () {
			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},

		onHover: function (el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			let ttPos = null;

			if (el) {
				el.removeClass('new');
				delete item.isNew;

				let elOffset = el.offset();
				ttPos = {
					x: ~~(elOffset.left + 74),
					y: ~~(elOffset.top + 4)
				};
			}

			events.emit('onShowItemTooltip', item, ttPos, true);
		},

		onKeyDown: function (key) {
			if (!this.shown)
				return;

			if (key === 'shift' && this.hoverItem)
				this.onHover();
			else if (key === 'esc')
				this.toggle();
		},

		onKeyUp: function (key) {
			if (!this.shown)
				return;

			if (key === 'shift' && this.hoverItem)
				this.onHover();
		},

		onInputKeyDown: function ({ keyCode }) {
			if (keyCode === 27)
				this.toggle();
		}
	};
});
