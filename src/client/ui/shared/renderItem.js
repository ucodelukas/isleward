const tplItem = `
	<div class="renderItem item">
		<div class="icon"></div>
		<div class="quantity"></div>
	</div>
`;

define([
	'js/system/events'
], function (
	events
) {
	const renderItemManager = {
		hoverItem: null,

		onHover: function (el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			let ttPos = null;

			if (el) {
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			events.emit('onShowItemTooltip', item, ttPos, true);
		},

		onKeyDown: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.onHover();
		},

		onKeyUp: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.onHover();
		}
	};

	events.on('onKeyDown', renderItemManager.onKeyDown.bind(renderItemManager));
	events.on('onKeyUp', renderItemManager.onKeyUp.bind(renderItemManager));

	const hideTooltip = (el, item, e) => {
		events.emit('onHideItemTooltip', item);
	};

	const addTooltipEvents = (el, item) => {
		let moveHandler = renderItemManager.onHover.bind(renderItemManager, el, item);
		let downHandler = () => {};
		if (isMobile) {
			moveHandler = () => {};
			downHandler = renderItemManager.bind(renderItemManager, el, item);
		}

		el
			.on('mousedown', downHandler)
			.on('mousemove', moveHandler)
			.on('mouseleave', hideTooltip.bind(null, el, item));
	};

	const onShowContext = (item, getItemContextConfig, e) => {
		if (isMobile)
			hideTooltip(null, item);

		const contextConfig = getItemContextConfig(item);
		if (!contextConfig.length)
			return;

		events.emit('onContextMenu', contextConfig, e);

		e.preventDefault();
		return false;
	};

	const addContextEvents = (el, item, getItemContextConfig) => {
		el.on('contextmenu', onShowContext.bind(this, item, getItemContextConfig));
	};

	return (container, item, useEl, manageTooltip, getItemContextConfig) => {
		const itemEl = useEl || $(tplItem).appendTo(container);

		if (!item) {
			itemEl.addClass('empty');

			return itemEl;
		}

		let size = 64;
		let offset = 0;

		if (item.type === 'skin') {
			offset = 4;
			size = 8;
		}

		const imgX = (-item.sprite[0] * size) + offset;
		const imgY = (-item.sprite[1] * size) + offset;

		let spritesheet = item.spritesheet || '../../../images/items.png';
		if (!item.spritesheet) {
			if (item.material)
				spritesheet = '../../../images/materials.png';
			else if (item.quest)
				spritesheet = '../../../images/questItems.png';
			else if (item.type === 'consumable')
				spritesheet = '../../../images/consumables.png';
			else if (item.type === 'skin')
				spritesheet = '../../../images/characters.png';
		}

		itemEl
			.find('.icon')
			.css('background', `url(${spritesheet}) ${imgX}px ${imgY}px`);

		if (item.quantity > 1 || item.eq || item.active || item.has('quickSlot')) {
			let elQuantity = itemEl.find('.quantity');
			let txtQuantity = item.quantity;
			if (!txtQuantity)
				txtQuantity = item.has('quickSlot') ? 'QS' : 'EQ';

			elQuantity.html(txtQuantity);

			//If the item doesn't have a quantity and we reach this point
			//it must mean that it's active, EQd or QSd
			if (!item.quantity)
				itemEl.addClass('eq');
		} else if (item.isNew) {
			itemEl.addClass('new');
			itemEl.find('.quantity').html('NEW');
		}

		if (item.slot) {
			const equipErrors = window.player.inventory.equipItemErrors(item);
			if (equipErrors.length)
				itemEl.addClass('no-equip');
		}

		if (item.has('quality'))
			itemEl.addClass(`quality-${item.quality}`);

		if (manageTooltip)
			addTooltipEvents(itemEl, item);

		if (getItemContextConfig)
			addContextEvents(itemEl, item, getItemContextConfig);

		return itemEl;
	};
});
