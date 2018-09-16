/*
Example of a pet:
{
	name: 'Red Macaw\'s Cage',
	type: 'pet',
	quality: 2,
	noDrop: true,
	noSalvage: true,
	cdMax: 10,
	sprite: [0, 9],
	spritesheet: 'images/questItems.png',
	petCell: 10,
	petSheet: 'images/mobs.png',
	petName: 'Red Macaw',
	useText: 'summon',
	description: 'Vibrant, majestic and bitey.'
}
*/

let mobBuilder = require('../../world/mobBuilder');

module.exports = {
	name: 'Feature: Pets',

	init: function () {
		this.events.on('onBeforeUseItem', this.onBeforeUseItem.bind(this));
	},

	onBeforeUseItem: function (obj, item, result) {
		if (item.type !== 'pet')
			return;

		let syncer = obj.syncer;

		let blueprint = {
			x: obj.x + 1,
			y: obj.y,
			cell: item.petCell,
			sheetName: item.petSheet,
			name: item.petName,
			properties: {
				cpnFollower: {
					maxDistance: 2
				},
				cpnMob: {
					walkDistance: 1
				},
				cpnSyncer: {},
				cpnStats: {}
			},
			extraProperties: {
				follower: {
					master: obj
				}
			}
		};

		//Spawn a mob
		let pet = obj.instance.spawners.spawn({
			amountLeft: 1,
			blueprint: blueprint
		});

		item.useText = 'dismiss';
		syncer.setArray(true, 'inventory', 'getItems', item);
	}
};
