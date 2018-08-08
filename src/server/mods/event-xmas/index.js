let itemGenerator = require('../../items/generator');

module.exports = {
	mapFile: null,
	mapW: null,
	mapH: null,

	mapOffset: {
		x: 79,
		y: 32
	},

	init: function () {
		this.mapFile = require('./maps/fjolarok/map');
		this.mapW = this.mapFile.width;
		this.mapH = this.mapFile.height;

		//this.events.on('onBeforeGetDialogue', this.onBeforeGetDialogue.bind(this));
		this.events.on('onBeforeGetResourceList', this.onBeforeGetResourceList.bind(this));
		//this.events.on('onBeforeGetEventList', this.onBeforeGetEventList.bind(this));
		this.events.on('onBeforeGetCardReward', this.onBeforeGetCardReward.bind(this));
		this.events.on('onBeforeGetSkins', this.onBeforeGetSkins.bind(this));
		//this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
		//this.events.on('onBeforeGetHerbConfig', this.onBeforeGetHerbConfig.bind(this));
		//this.events.on('onBeforeBuildLayerTile', this.onBeforeBuildLayerTile.bind(this));
		//this.events.on('onAfterGetLayerObjects', this.onAfterGetLayerObjects.bind(this));
		this.events.on('onBeforeGetFactions', this.onBeforeGetFactions.bind(this));
		this.events.on('onBeforeUseItem', this.onBeforeUseItem.bind(this));
		this.events.on('onBeforeGetEffect', this.onBeforeGetEffect.bind(this));
		this.events.on('onBeforeGetCardsConfig', this.onBeforeGetCardsConfig.bind(this));
	},

	onBeforeGetCardsConfig: function (config) {
		extend(config, {
			'Cheer and Spear': {
				chance: 40,
				reward: 'Rare Festive Spear',
				setSize: 3,
				mobName: ['frost crab', 'rude holf'],
				spritesheet: 'server/mods/event-xmas/images/items.png',
				sprite: [0, 1],
				quality: 2
			},
			"Wizard's Vice": {
				reward: 'Scented Beard Oil'
			}
		});
	},

	onBeforeGetSkins: function (skins) {
		skins['3.1'] = {
			name: 'Bearded Wizard',
			sprite: [0, 0],
			spritesheet: `${this.folderName}/images/skins.png`
		};
	},

	onBeforeGetEffect: function (result) {
		if (result.type.toLowerCase() === 'merry')
			result.url = `${this.relativeFolderName}/effects/effectMerry.js`;
	},

	onBeforeUseItem: function (obj, item, result) {
		let handler = {
			'Merrywinter Play Script': function () {
				let lines = [
					'A catch, a catch, our lines are taut, somebody grab the wheel',
					'And when the catch was on the ship, all three stood \'round in awe',
					'And with each present handed, and each snowflake landed, when the winter morn began',
					'As each man got the things to which he\'d previously alluded',
					'But it was still taut though it moved for naught, a truly curious sign',
					'But then it passed, the mighty thrashing, their chance of food expired',
					'Declared to all (or those who\'d hear), what passed the night before',
					'Each one then, with their gift in hand, thanked the Winter Man',
					'For not a man could gaze on it and believe that which he saw',
					'For they were out, the three of them, fishing off the shore',
					'I need to get back home sometime, before the moon\'s alighted',
					'Inscribed on each in jet black ink, the recipient\'s relations',
					'It started on a morning pale, with winter hardly come',
					'Later they would cheerfully relate what the contents had included',
					'My boy needs clothes, and books for school, but money\'s hard to find',
					'My hooks are busted and rust encrusted, I know not how we\'ll eat',
					'My wife has lost her silver ring, a gift from my dad',
					'Reel it in, let\'s see this thing that had us so excited',
					'So there they sat: dejected, silent, their moods now foul and gray',
					'The first announced before he pounced to grab hold of the reel',
					'The first then nodded and down, he plodded; a picture of defeat',
					'The second chimed: Oh friends it seems, Ill luck is all we\'ve had',
					'The third announced: My friends, my friends, I am in such a bind',
					'The third looked on with a heartfelt sigh to see the broken line',
					'Waterproof boxes wrapped in lints and colorful decorations',
					'What happened there, are we to starve? The second then enquired',
					'When fishermen beyond the vale, their bellies full of rum',
					'When with a mighty shudder, and a trembling rudder, their boat shook on the bay'
				];

				obj.syncer.set(false, 'chatter', 'color', 0x48edff);
				let pick = ~~(Math.random() * (lines.length - 1));

				obj.syncer.set(false, 'chatter', 'msg', lines[pick] + '\r\n' + lines[pick + 1]);
			},
			'Sprig of Mistletoe': function () {
				let ox = obj.x;
				let oy = obj.y;

				let objects = obj.instance.objects.objects.filter(o => (((o.mob) || (o.player)) && (o.name) && (o !== obj)));
				let closestDistance = 999;
				let closest = null;
				let oLen = objects.length;
				for (let i = 0; i < oLen; i++) {
					let m = objects[i];
					let distance = Math.max(Math.abs(ox - m.x), Math.abs(oy - m.y));
					if (distance < closestDistance) {
						closestDistance = distance;
						closest = m;
					}
				}

				if (!closest)
					return;

				let prefix = (closest.mob) ? 'the' : '';

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
								};
							}
						}
					}
				}]);
			},
			'Bottomless Eggnog': function () {
				obj.effects.addEffect({
					type: 'merry',
					ttl: 514
				});
			},
			'Scented Beard Oil': function () {
				obj.syncer.set(false, 'chatter', 'color', 0xfc66f7);
				obj.syncer.set(false, 'chatter', 'msg', '...Rubs his beard throughtfully...');
			}
		}[item.name];

		if (!handler)
			return;

		handler();
	},

	onBeforeGetFactions: function (mappings) {
		extend(mappings, {
			theWinterMan: `${this.relativeFolderName}/factions/theWinterMan`
		});
	},

	onAfterGetLayerObjects: function (info) {
		if (info.map !== 'fjolarok')
			return;

		let layer = this.mapFile.layers.find(l => (l.name === info.layer));
		if (layer) {
			let offset = this.mapOffset;
			let mapScale = this.mapFile.tilesets[0].tileheight;

			layer.objects.forEach(function (l) {
				let newO = extend({}, l);
				newO.x += (offset.x * mapScale);
				newO.y += (offset.y * mapScale);

				info.objects.push(newO);
			}, this);
		}
	},

	onBeforeBuildLayerTile: function (info) {
		if (info.map !== 'fjolarok')
			return;

		let offset = this.mapOffset;

		let x = info.x;
		let y = info.y;

		if ((x - offset.x < 0) || (y - offset.y < 0) || (x - offset.x >= this.mapW) || (y - offset.y >= this.mapH))
			return;

		let i = ((y - offset.y) * this.mapW) + (x - offset.x);
		let layer = this.mapFile.layers.find(l => (l.name === info.layer));
		if (layer) {
			let cell = layer.data[i];
			if (cell)
				info.cell = layer.data[i];
		}
	},

	onAfterGetZone: function (zone, config) {
		try {
			let modZone = require('./maps/' + zone + '/zone.js');
			extend(config, modZone);
		} catch (e) {

		}
	},

	onBeforeGetHerbConfig: function (herbs) {
		extend(herbs, {
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
				itemAmount: [3, 5]
			},
			'Gilded Gift': {
				sheetName: 'bigObjects',
				cell: 22,
				itemSprite: [3, 0],
				itemName: 'Snowflake',
				itemSheet: `${this.folderName}/images/items.png`,
				itemAmount: [5, 8]
			}
		});
	},

	onBeforeGetCardReward: function (msg) {
		if (msg.reward === 'Rare Festive Spear') {
			msg.handler = function (card) {
				return itemGenerator.generate({
					name: 'Festive Spear',
					level: [5, 15],
					noSpell: true,
					slot: 'twoHanded',
					type: 'Spear',
					quality: 2,
					stats: ['attackSpeed|10'],
					spritesheet: 'server/mods/event-xmas/images/items.png',
					sprite: [0, 0]
				});
			};
		} else if (msg.reward === 'Scented Beard Oil') {
			msg.handler = function (card) {
				return {
					name: 'Scented Beard Oil',
					type: 'toy',
					sprite: [3, 2],
					spritesheet: 'server/mods/event-xmas/images/items.png',
					description: 'For some extra \'ho\' in your holy vengeance.',
					worth: 0,
					cdMax: 300,
					noSalvage: true,
					noAugment: true
				};
			};
		}
	},

	onBeforeGetResourceList: function (list) {
		list.push(`${this.folderName}/images/mobs.png`);
		list.push(`${this.folderName}/images/skins.png`);
	},

	onBeforeGetEventList: function (zone, list) {
		if (zone !== 'fjolarok')
			return;

		list.push(this.relativeFolderName + '/maps/fjolarok/events/xmas.js');
	},

	onBeforeGetDialogue: function (zone, config) {
		try {
			let modDialogue = require('./maps/' + zone + '/dialogues.js');
			extend(config, modDialogue);
		} catch (e) {

		}
	}
};
