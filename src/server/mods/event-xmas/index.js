define([
	'items/generator'
], function (
	itemGenerator
) {
	return {
		init: function () {
			this.events.on('onBeforeGetResourceList', this.onBeforeGetResourceList.bind(this));
			this.events.on('onBeforeGetEventList', this.onBeforeGetEventList.bind(this));
			this.events.on('onBeforeGetCardReward', this.onBeforeGetCardReward.bind(this));
			this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
			this.events.on('onBeforeGetHerbConfig', this.onBeforeGetHerbConfig.bind(this));
		},

		onAfterGetZone: function (zone, config) {
			try {
				var modZone = require(this.relativeFolderName + '/maps/' + zone + '/zone.js');
				extend(true, config, modZone);
			} catch (e) {

			}
		},

		onBeforeGetHerbConfig: function (herbs) {
			extend(true, herbs, {
				'Festive Gift': {
					sheetName: 'objects',
					cell: 166,
					itemSprite: [7, 3],
					itemName: 'Candy Corn',
					itemSheet: `bigObjects`,
					itemAmount: [1, 1]
				},
				'Giant Gift': {
					sheetName: 'bigObjects',
					cell: 14,
					itemSprite: [3, 3],
					itemName: 'Candy Corn',
					itemSheet: `${this.folderName}/images/items.png`,
					itemAmount: [2, 3]
				}
			});
		},

		onBeforeGetCardReward: function (msg) {
			if (msg.reward == 'Rare Festive Spear') {
				msg.handler = function (card) {
					return itemGenerator.generate({
						name: 'Festive Spear',
						level: 10,
						noSpell: true,
						slot: 'twoHanded',
						quality: 2,
						spritesheet: `server/mods/event-xmas/images/items.png`,
						sprite: [0, 0]
					});
				};
			}
		},

		onBeforeGetResourceList: function (list) {
			list.push(`${this.folderName}/images/mobs.png`);
		},

		onBeforeGetEventList: function (zone, list) {
			if (zone != 'tutorial')
				return;

			list.push(this.relativeFolderName + '/maps/tutorial/events/xmas.js');
		}
	};
});
