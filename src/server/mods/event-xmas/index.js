define([
	'items/generator'
], function (
	itemGenerator
) {
	return {
		mapFile: null,
		mapW: null,
		mapH: null,

		mapOffset: {
			x: 79,
			y: 32
		},

		init: function () {
			this.mapFile = require.nodeRequire('../../../mods/event-xmas/maps/tutorial/map');
			this.mapW = this.mapFile.width;
			this.mapH = this.mapFile.height;

			this.events.on('onBeforeGetDialogue', this.onBeforeGetDialogue.bind(this));
			this.events.on('onBeforeGetResourceList', this.onBeforeGetResourceList.bind(this));
			this.events.on('onBeforeGetEventList', this.onBeforeGetEventList.bind(this));
			this.events.on('onBeforeGetCardReward', this.onBeforeGetCardReward.bind(this));
			this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
			this.events.on('onBeforeGetHerbConfig', this.onBeforeGetHerbConfig.bind(this));
			this.events.on('onBeforeBuildLayerTile', this.onBeforeBuildLayerTile.bind(this));
			this.events.on('onAfterGetLayerObjects', this.onAfterGetLayerObjects.bind(this));
			this.events.on('onBeforeGetFactions', this.onBeforeGetFactions.bind(this));
		},

		onBeforeGetFactions: function (mappings) {
			extend(true, mappings, {
				fatherGiftybags: `${this.relativeFolderName}/factions/fatherGiftybags`
			});
		},

		onAfterGetLayerObjects: function (info) {
			if (info.map != 'tutorial')
				return;

			var layer = this.mapFile.layers.find(l => (l.name == info.layer));
			if (layer) {
				var offset = this.mapOffset;
				var mapScale = this.mapFile.tilesets[0].tileheight;

				layer.objects.forEach(function (l) {
					var newO = extend(true, {}, l);
					newO.x += (offset.x * mapScale);
					newO.y += (offset.y * mapScale);

					info.objects.push(newO);
				}, this);
			}
		},

		onBeforeBuildLayerTile: function (info) {
			if (info.map != 'tutorial')
				return;

			var offset = this.mapOffset;

			var x = info.x;
			var y = info.y;

			if ((x - offset.x < 0) || (y - offset.y < 0) || (x - offset.x >= this.mapW) || (y - offset.y >= this.mapH))
				return;

			var i = ((y - offset.y) * this.mapW) + (x - offset.x);
			var layer = this.mapFile.layers.find(l => (l.name == info.layer));
			if (layer) {
				var cell = layer.data[i];
				if (cell)
					info.cell = layer.data[i];
			}
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
					itemSprite: [3, 0],
					itemName: 'Snowflake',
					itemSheet: `${this.folderName}/images/items.png`,
					itemAmount: [1, 2]
				},
				'Giant Gift': {
					sheetName: 'bigObjects',
					cell: 14,
					itemSprite: [3, 0],
					itemName: 'Snowflake',
					itemSheet: `${this.folderName}/images/items.png`,
					itemAmount: [3, 6]
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
		},

		onBeforeGetDialogue: function (zone, config) {
			try {
				var modDialogue = require(this.relativeFolderName + '/maps/' + zone + '/dialogues.js');
				extend(true, config, modDialogue);
			} catch (e) {

			}
		}
	};
});
