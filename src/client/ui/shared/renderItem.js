const tplItem = `
	<div class="item">
		<div class="icon"></div>
		<div class="quantity"></div>
	</div>
`;

define([
	
], function (
	
) {
	return (container, item) => {
		let itemEl = null;

		if (!item) {
			itemEl = $(tplItem)
				.appendTo(container)
				.addClass('empty');

			return itemEl;
		}

		itemEl = $(tplItem).appendTo(container);

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

		return itemEl;
	};
});
