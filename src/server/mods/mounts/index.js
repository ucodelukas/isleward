/*
Example of a mount:
{
	name: 'Brown Horse\'s Reins',
	type: 'mount',
	quality: 2,
	noDrop: true,
	noDestroy: true,
	noSalvage: true,
	cdMax: 10,
	sprite: [0, 9],
	spritesheet: 'images/questItems.png',
	useText: 'mount',
	description: 'Stout, dependable and at least faster than you',
	effects: [{
		type: 'mount',
		rolls: {
			speed: 150,
			cell: 5,
			sheetName: 'mobs'
		}
	}]
}
*/

module.exports = {
	name: 'Feature: Mounts',

	init: function () {
		this.events.on('onBeforeUseItem', this.onBeforeUseItem.bind(this));
		this.events.on('onBeforeGetEffect', this.onBeforeGetEffect.bind(this));
	},

	onBeforeUseItem: function (obj, item, result) {
		if (item.type !== 'mount')
			return;

		let syncer = obj.syncer;

		let currentEffect = obj.effects.removeEffectByName('mounted', true);
		if (currentEffect) {
			let currentItem = currentEffect.source;
			currentItem.useText = 'mount';
			currentItem.cdMax = 0;

			syncer.setArray(true, 'inventory', 'getItems', currentItem);

			if (currentItem === item)
				return;
		}

		let builtEffect = obj.effects.addEffect({
			type: 'mounted',
			ttl: -1
		});
		builtEffect.source = item;

		item.useText = 'unmount';
		syncer.setArray(true, 'inventory', 'getItems', item);
	},

	onBeforeGetEffect: function (result) {
		if (result.type.toLowerCase() === 'mounted')
			result.url = `${this.relativeFolderName}/effects/effectMounted.js`;
	}
};
