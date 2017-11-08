define([
	'items/generator'
], function (
	itemGenerator
) {
	return {
		init: function () {
			this.events.on('onBeforeGetResourceList', this.onBeforeGetResourceList.bind(this));
			this.events.on('onBeforeGetEventList', this.onBeforeGetEventList.bind(this));
			this.events.on('onBeforeGetCardsConfig', this.onBeforeGetCardsConfig.bind(this));
			this.events.on('onBeforeGetCardReward', this.onBeforeGetCardReward.bind(this));
		},

		onBeforeGetCardsConfig: function (config) {
			extend(true, config, {
				'Cheer and Spear': {
					chance: 40,
					reward: 'Rare Festive Spear',
					setSize: 1,
					mobName: ['frost crab', 'rude holf']
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
