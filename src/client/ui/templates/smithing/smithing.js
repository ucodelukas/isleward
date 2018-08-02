define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/smithing/template',
	'css!ui/templates/smithing/styles',
	'html!/ui/templates/smithing/templateItem',
	'js/misc/statTranslations'
], function (
	events,
	client,
	template,
	styles,
	templateItem,
	statTranslations
) {
	return {
		tpl: template,

		centered: true,

		modal: true,

		eventCloseInv: null,

		hoverItem: null,
		item: null,

		action: 'augment',

		postRender: function () {
			this.onEvent('onShowSmithing', this.toggle.bind(this));
			this.onEvent('onKeyDown', this.onKeyDown.bind(this));

			this.find('.item-picker').on('click', this.openInventory.bind(this));
			this.find('.actionButton').on('click', this.smith.bind(this));

			this.onEvent('onHideInventory', this.hackMethod.bind(this));
			this.onEvent('beforeInventoryClickItem', this.hackMethod.bind(this));

			this.onEvent('onSetSmithItem', this.onHideInventory.bind(this));

			this.find('.col-btn').on('click', this.clickAction.bind(this));
		},

		clickAction: function (e) {
			let el = $(e.currentTarget);
			this.find('.col-btn').removeClass('selected');

			let action = el.attr('action');
			let changed = (action !== this.action);
			this.action = action;

			el.addClass('selected');

			if ((this.item) && (changed))
				this.getMaterials(this.item);
		},

		smith: function () {
			this.setDisabled(true);

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'inventory',
					method: 'enchantItem',
					data: {
						itemId: this.item.id,
						action: this.action
					}
				},
				callback: this.onSmith.bind(this, this.item)
			});
		},

		onSmith: function (item, result) {
			this.setDisabled(false);

			let msg = {
				msg: 'Item Enhancement Succeeded',
				type: 'success',
				zIndex: 9999999,
				top: 100
			};
			if (this.action === 'reroll')
				msg.msg = 'Item Reroll Succeeded';
			else if (this.action === 'relevel')
				msg.msg = 'Item Relevel Succeeded';
			else if (this.action === 'reslot')
				msg.msg = 'Item Reslot Succeeded';

			result.addStatMsgs.forEach(function (a) {
				msg.msg += '<br /> ' + ((a.value > 0) ? '+' : '') + a.value + ' ' + statTranslations.translate(a.stat);
			});

			events.emit('onGetAnnouncement', msg);

			if (result.item)
				this.item = result.item;

			this.getMaterials(this.item);

			let augment = this.find('[action="augment"]').addClass('disabled');
			if ((result.item.power || 0) < 3)
				augment.removeClass('disabled');
			else
				this.find('[action="reroll"]').click();
		},

		//Something needs to listen to events or they'll be queued
		hackMethod: function () {

		},

		openInventory: function () {
			this.eventCloseInv = this.onEvent('onHideInventory', this.onHideInventory.bind(this));
			this.eventClickInv = this.onEvent('beforeInventoryClickItem', this.onHideInventory.bind(this));

			events.emit('onShowInventory');
			this.el.hide();
		},

		onHideInventory: function (msg) {
			if (msg)
				msg.success = false;

			if ((!msg) || (!msg.item)) {
				this.offEvent(this.eventCloseInv);
				this.offEvent(this.eventClickInv);
				return;
			} else if ((!msg.item.slot) || (msg.item.noAugment)) {
				let msg = {
					msg: 'Incorrect Item Type',
					type: 'failure',
					zIndex: 9999999,
					top: 180
				};
				events.emit('onGetAnnouncement', msg);

				return;
			} else if (msg.item.eq) {
				let msg = {
					msg: 'Cannot augment equipped items',
					type: 'failure',
					zIndex: 9999999,
					top: 180
				};
				events.emit('onGetAnnouncement', msg);

				return;
			}

			this.find('.selected').removeClass('selected');
			this.find('[action="augment"]').addClass('selected');
			this.action = 'augment';

			let augment = this.find('[action="augment"]').addClass('disabled');
			if ((msg.item.power || 0) < 3)
				augment.removeClass('disabled');

			let reforge = this.find('[action="reforge"]').addClass('disabled');
			if (msg.item.spell)
				reforge.removeClass('disabled');

			let reslot = this.find('[action="reslot"]').addClass('disabled');
			if (!msg.item.effects)
				reslot.removeClass('disabled');

			let relevel = this.find('[action="relevel"]').addClass('disabled');
			if (msg.item.slot === 'tool')
				relevel.removeClass('disabled');

			this.offEvent(this.eventClickInv);

			$('.uiInventory').data('ui').toggle();

			this.el.show();

			msg.success = false;

			if ((!msg) || (!msg.item) || (!msg.item.slot) || (msg.item.eq))
				return;

			this.item = msg.item;

			this.getMaterials(msg.item);
		},

		getMaterials: function (item) {
			this.setDisabled(true);

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'inventory',
					method: 'getEnchantMaterials',
					data: {
						itemId: item.id,
						action: this.action
					}
				},
				callback: this.onGetMaterials.bind(this, item)
			});
		},

		onGetMaterials: function (item, result) {
			this.find('.item').remove();
			this.drawItem(this.find('.item-picker'), item);

			this.find('.actionButton').removeClass('disabled').addClass('disabled');

			if (result.materials) {
				let material = result.materials[0];
				if (material) {
					let hasMaterials = window.player.inventory.items.find(function (i) {
						return (i.name === material.name);
					});
					if (hasMaterials) {
						material.quantityText = hasMaterials.quantity + '/' + material.quantity;
						hasMaterials = hasMaterials.quantity >= material.quantity;
					} else {
						if (!material.quantityText)
							material.quantityText = '';
						material.quantityText += '0/' + material.quantity;
					}

					if (hasMaterials)
						this.find('.actionButton').removeClass('disabled');

					this.drawItem(this.find('.material'), material, !hasMaterials);
				}
			}

			this.setDisabled(false);
		},

		drawItem: function (container, item, redQuantity) {
			container.find('.icon').hide();

			let imgX = -item.sprite[0] * 64;
			let imgY = -item.sprite[1] * 64;

			let spritesheet = item.spritesheet || '../../../images/items.png';
			if (item.material)
				spritesheet = '../../../images/materials.png';
			else if (item.quest)
				spritesheet = '../../../images/questItems.png';
			 else if (item.type === 'consumable')
				spritesheet = '../../../images/consumables.png';

			let el = $(templateItem)
				.appendTo(container);

			el
				.data('item', item)
				.on('mousemove', this.onHover.bind(this, el, item))
				.on('mouseleave', this.hideTooltip.bind(this, el, item))
				.find('.icon')
				.css('background', 'url(' + spritesheet + ') ' + imgX + 'px ' + imgY + 'px');

			if (item.quantity) {
				let quantityText = item.quantityText;
				el.find('.quantity').html(quantityText);
				if (redQuantity)
					el.find('.quantity').addClass('red');
			}
		},

		onHover: function (el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			let ttPos = null;

			if (el) {
				let elOffset = el.offset();
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			events.emit('onShowItemTooltip', item, ttPos);
		},

		hideTooltip: function (el, item, e) {
			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},

		beforeHide: function () {
			this.offEvent(this.eventCloseInv);
			this.offEvent(this.eventClickInv);
		},

		toggle: function () {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.find('.item').remove();
				this.find('.icon').show();
				this.find('.actionButton').removeClass('disabled').addClass('disabled');
				this.show();
			} else
				this.hide();
		},
		onKeyDown: function (key) {
			if (key === 'm')
				this.toggle();
		}
	};
});
