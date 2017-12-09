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
			this.events.on('onBeforeGetSkins', this.onBeforeGetSkins.bind(this));
			this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
			this.events.on('onBeforeGetHerbConfig', this.onBeforeGetHerbConfig.bind(this));
			this.events.on('onBeforeBuildLayerTile', this.onBeforeBuildLayerTile.bind(this));
			this.events.on('onAfterGetLayerObjects', this.onAfterGetLayerObjects.bind(this));
			this.events.on('onBeforeGetFactions', this.onBeforeGetFactions.bind(this));
			this.events.on('onBeforeUseItem', this.onBeforeUseItem.bind(this));
			this.events.on('onBeforeGetEffect', this.onBeforeGetEffect.bind(this));
		},

		onBeforeGetSkins: function (skins) {
			skins['bearded wizard'] = {
				name: 'Bearded Wizard',
				sprite: [0, 0],
				class: 'wizard',
				spritesheet: `${this.folderName}/images/skins.png`
			};
		},

		onBeforeGetEffect: function (result) {
			if (result.type.toLowerCase() == 'merry')
				result.url = `${this.relativeFolderName}/effects/effectMerry.js`
		},

		onBeforeUseItem: function (obj, item, result) {
			var handler = {
				'Merrywinter Play Script': function (obj, item, result) {
					var lines = [

					];

					obj.syncer.set(false, 'chatter', 'color', 0x48edff);
					var pick = ~~(Math.random() * (lines.length - 1));

					obj.syncer.set(false, 'chatter', 'msg', lines[pick] + '\r\n' + lines[pick + 1]);
				},
				'Sprig of Mistletoe': function (obj, item, result) {
					var ox = obj.x;
					var oy = obj.y;

					var objects = obj.instance.objects.objects.filter(o => (((o.mob) || (o.player)) && (o.name) && (o != obj)));
					var closestDistance = 999;
					var closest = null;
					var oLen = objects.length;
					for (var i = 0; i < oLen; i++) {
						var m = objects[i];
						var distance = Math.max(Math.abs(ox - m.x), Math.abs(oy - m.y));
						if (distance < closestDistance) {
							closestDistance = distance;
							closest = m;
						}
					}

					if (!closest)
						return;

					var prefix = (closest.mob) ? 'the' : '';

					obj.syncer.set(false, 'chatter', 'color', 0xfc66f7);
					obj.syncer.set(false, 'chatter', 'msg', `...Smooches ${prefix} ${closest.name}...`);

					obj.instance.objects.buildObjects([{
						x: obj.x,
						y: obj.y,
						ttl: 10,
						properties: {
							cpnParticles: {
								simplify: function () {
									return {
										type: 'particles',
										blueprint: {
											color: {
												start: ['ff4252', 'ffc66f7', 'de43ae', 'd43346'],
												end: ['ff4252', 'ffc66f7', 'de43ae', 'd43346']
											},
											scale: {
												start: {
													min: 4,
													max: 10
												},
												end: {
													min: 4,
													max: 6
												}
											},
											speed: {
												start: {
													min: 0,
													max: 12
												},
												end: {
													min: 0,
													max: 4
												}
											},
											lifetime: {
												min: 1,
												max: 4
											},
											alpha: {
												start: 1,
												end: 0
											},
											randomScale: true,
											randomSpeed: true,
											chance: 0.3,
											randomColor: true,
											blendMode: 'add',
											spawnType: 'ring',
											spawnCircle: {
												r: 24,
												minR: 22
											}
										}
									}
								}
							}
						}
					}]);
				},
				'Bottomless Eggnog': function (obj, item, result) {
					obj.effects.addEffect({
						type: 'merry',
						ttl: 514
					});

				}
			}[item.name];

			if (!handler)
				return;

			handler(obj, item, result);
		},

		onBeforeGetFactions: function (mappings) {
			extend(true, mappings, {
				theWinterMan: `${this.relativeFolderName}/factions/theWinterMan`
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
						level: [5, 15],
						noSpell: true,
						slot: 'twoHanded',
						type: 'spear',
						quality: 2,
						stats: ['attackSpeed|10'],
						spritesheet: `server/mods/event-xmas/images/items.png`,
						sprite: [0, 0]
					});
				};
			}
		},

		onBeforeGetResourceList: function (list) {
			list.push(`${this.folderName}/images/mobs.png`);
			list.push(`${this.folderName}/images/skins.png`);
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
