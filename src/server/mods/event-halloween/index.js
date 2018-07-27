module.exports = {
	name: 'Event: Halloween',

	mapOffset: {
		x: 23,
		y: 86
	},

	extraScripts: [
		'maps/fjolarok/events/halloween.js',
		'mtx/summonPumpkinSkeleton.js',
		'spells/spellScatterPumpkinPieces.js'
	],

	mapFile: null,
	mapW: null,
	mapH: null,

	init: function () {
		this.mapFile = require('./maps/fjolarok/map');
		this.mapW = this.mapFile.width;
		this.mapH = this.mapFile.height;

		this.events.on('onBeforeGetFactions', this.onBeforeGetFactions.bind(this));
		this.events.on('onBeforeGetSkins', this.onBeforeGetSkins.bind(this));
		this.events.on('onBeforeGetEventList', this.onBeforeGetEventList.bind(this));
		//this.events.on('onBeforeGetQuests', this.onBeforeGetQuests.bind(this));
		//this.events.on('onBeforeGetDialogue', this.onBeforeGetDialogue.bind(this));
		this.events.on('onBeforeGetResourceList', this.onBeforeGetResourceList.bind(this));
		//this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
		//this.events.on('onBeforeBuildLayerTile', this.onBeforeBuildLayerTile.bind(this));
		//this.events.on('onAfterGetLayerObjects', this.onAfterGetLayerObjects.bind(this));
		this.events.on('onBeforeGetMtxList', this.onBeforeGetMtxList.bind(this));
		this.events.on('onBeforeGetAnimations', this.onBeforeGetAnimations.bind(this));
		//this.events.on('onBeforeGetHerbConfig', this.onBeforeGetHerbConfig.bind(this));
		this.events.on('onBeforeGetSpellsInfo', this.beforeGetSpellsInfo.bind(this));
		this.events.on('onBeforeGetSpellsConfig', this.beforeGetSpellsConfig.bind(this));
		this.events.on('onBeforeGetSpellTemplate', this.beforeGetSpellTemplate.bind(this));
	},

	beforeGetSpellsInfo: function (spells) {
		spells.push({
			name: 'scatter pumpkin pieces',
			type: 'scatterPumpkinPieces',
			animation: 'melee',
			particles: {
				color: {
					start: ['ff4252', 'b34b3a'],
					end: ['b34b3a', 'ff4252']
				},
				scale: {
					start: {
						min: 2,
						max: 14
					},
					end: {
						min: 0,
						max: 8
					}
				},
				lifetime: {
					min: 1,
					max: 3
				},
				alpha: {
					start: 0.7,
					end: 0
				},
				randomScale: true,
				randomColor: true,
				chance: 0.6
			}
		});
	},

	beforeGetSpellsConfig: function (spells) {
		spells['scatter pumpkin pieces'] = {
			statType: ['str'],
			statMult: 0.1,
			auto: true,
			cdMax: 7,
			manaCost: 0,
			random: {

			}
		};
	},

	beforeGetSpellTemplate: function (spell) {
		if (spell.type == 'ScatterPumpkinPieces')
			spell.template = require(`${this.relativeFolderName}/spells/spellScatterPumpkinPieces.js`);
	},

	onBeforeGetFactions: function (mappings) {
		extend(true, mappings, {
			pumpkinSailor: `${this.relativeFolderName}/factions/pumpkinSailor`
		});
	},

	onBeforeGetSkins: function (skins) {
		skins['3.0'] = {
			name: 'Pumpkin-Head Necromancer',
			sprite: [0, 0],
			spritesheet: `${this.folderName}/images/skins.png`
		};
	},

	onBeforeGetHerbConfig: function (herbs) {
		extend(true, herbs, {
			'Tiny Pumpkin': {
				sheetName: 'objects',
				cell: 167,
				itemSprite: [3, 3],
				itemName: 'Candy Corn',
				itemSheet: `${this.folderName}/images/items.png`,
				itemAmount: [1, 1]
			},
			Pumpkin: {
				sheetName: 'objects',
				cell: 159,
				itemSprite: [3, 3],
				itemName: 'Candy Corn',
				itemSheet: `${this.folderName}/images/items.png`,
				itemAmount: [2, 3]
			},
			'Giant Pumpkin': {
				sheetName: 'objects',
				cell: 158,
				itemSprite: [3, 3],
				itemName: 'Candy Corn',
				itemSheet: `${this.folderName}/images/items.png`,
				itemAmount: [2, 5]
			}
		});
	},

	onBeforeGetAnimations: function (animations) {
		//Skeleton animations
		let mobsheet = `${this.folderName}/images/mobs.png`;
		if (!animations.mobs[mobsheet])
			animations.mobs[mobsheet] = {};

		animations.mobs[mobsheet]['0'] = {
			melee: {
				spritesheet: mobsheet,
				row: 1,
				col: 0,
				frames: 2,
				frameDelay: 5
			},
			spawn: {
				spritesheet: mobsheet,
				row: 2,
				col: 0,
				frames: 3,
				frameDelay: 4,
				hideSprite: true,
				type: 'attackAnimation'
			},
			death: {
				spritesheet: mobsheet,
				row: 3,
				col: 0,
				frames: 4,
				frameDelay: 4,
				type: 'attackAnimation'
			}
		};
	},

	onBeforeGetResourceList: function (list) {
		list.push(`${this.folderName}/images/mobs.png`);
		list.push(`${this.folderName}/images/bosses.png`);
		list.push(`${this.folderName}/images/skins.png`);
	},

	onBeforeGetMtxList: function (list) {
		list.summonPumpkinSkeleton = this.relativeFolderName + '/mtx/summonPumpkinSkeleton';
		list.hauntedIceSpear = this.relativeFolderName + '/mtx/hauntedIceSpear';
	},

	onAfterGetLayerObjects: function (info) {
		if (info.map != 'fjolarok')
			return;

		let layer = this.mapFile.layers.find(l => (l.name == info.layer));
		if (layer) {
			let offset = this.mapOffset;
			let mapScale = this.mapFile.tilesets[0].tileheight;

			layer.objects.forEach(function (l) {
				let newO = extend(true, {}, l);
				newO.x += (offset.x * mapScale);
				newO.y += (offset.y * mapScale);

				info.objects.push(newO);
			}, this);
		}
	},

	onBeforeBuildLayerTile: function (info) {
		if (info.map != 'fjolarok')
			return;

		let offset = this.mapOffset;

		let x = info.x;
		let y = info.y;

		if ((x - offset.x < 0) || (y - offset.y < 0) || (x - offset.x >= this.mapW) || (y - offset.y >= this.mapH))
			return;

		let i = ((y - offset.y) * this.mapW) + (x - offset.x);
		let layer = this.mapFile.layers.find(l => (l.name == info.layer));
		if (layer)
			info.cell = layer.data[i];
	},

	onBeforeGetEventList: function (zone, list) {
		if (zone != 'fjolarok')
			return;

		list.push(this.relativeFolderName + '/maps/fjolarok/events/halloween.js');
		list.push(this.relativeFolderName + '/maps/fjolarok/events/halloweenBoss.js');
	},

	onAfterGetZone: function (zone, config) {
		try {
			let modZone = require(this.relativeFolderName + '/maps/' + zone + '/zone.js');
			extend(true, config, modZone);
		} catch (e) {

		}
	},

	onBeforeGetDialogue: function (zone, config) {
		try {
			let modDialogue = require(this.relativeFolderName + '/maps/' + zone + '/dialogues.js');
			extend(true, config, modDialogue);
		} catch (e) {

		}
	}
};
