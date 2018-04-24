define([

], function (

) {
	return {
		name: 'Ranger Class',

		extraScripts: [],

		mapFile: null,
		mapW: null,
		mapH: null,

		mapOffset: {
			x: 197,
			y: 119
		},

		init: function () {
			this.mapFile = require.nodeRequire('../../../mods/iwd-ranger/maps/fjolarok/map');
			this.mapW = this.mapFile.width;
			this.mapH = this.mapFile.height;

			this.events.on('onBeforeGetSpellsInfo', this.beforeGetSpellsInfo.bind(this));
			this.events.on('onBeforeGetSpellsConfig', this.beforeGetSpellsConfig.bind(this));
			this.events.on('onBeforeGetSpellTemplate', this.beforeGetSpellTemplate.bind(this));
			this.events.on('onBeforeGetResourceList', this.beforeGetResourceList.bind(this));
			this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
			this.events.on('onAfterGetLayerObjects', this.onAfterGetLayerObjects.bind(this));
			this.events.on('onBeforeGetDialogue', this.onBeforeGetDialogue.bind(this));
		},

		onBeforeGetDialogue: function (zone, config) {
			try {
				var modDialogue = require(this.relativeFolderName + '/maps/' + zone + '/dialogues.js');
				extend(true, config, modDialogue);
			} catch (e) {

			}
		},

		onAfterGetZone: function (zone, config) {
			try {
				var modZone = require(this.relativeFolderName + '/maps/' + zone + '/zone.js');
				extend(true, config, modZone);
			} catch (e) {

			}
		},

		onAfterGetLayerObjects: function (info) {
			if (info.map != 'fjolarok')
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

		beforeGetResourceList: function (list) {
			list.push(`${this.folderName}/images/items.png`);
			list.push(`${this.folderName}/images/mobs.png`);
		},

		beforeGetSpellTemplate: function (spell) {
			return;
			if (spell.type == 'PoisonArrow')
				spell.template = require(`${this.relativeFolderName}/spells/spellPoisonArrow`);
			else if (spell.type == 'Vanish')
				spell.template = require(`${this.relativeFolderName}/spells/spellVanish`);
		},

		beforeGetSpellsConfig: function (spells) {
			return;
			spells['poison arrow'] = {
				statType: ['dex'],
				statMult: 1,
				cdMax: 12,
				manaCost: 5,
				range: 1,
				random: {
					damage: [3, 11],
					dotDuration: [10, 30],
					dotDamage: [1, 5]
				}
			};

			spells['vanish'] = {
				statType: ['dex'],
				statMult: 0.27,
				cdMax: 7,
				manaCost: 5,
				range: 9,
				random: {
					duration: [5, 15],
					regen: [1, 5]
				}
			};
		},

		beforeGetSpellsInfo: function (spells) {
			return;
			spells.push({
				name: 'Poison Arrow',
				description: 'An arrow that poisons.',
				type: 'poisonArrow',
				icon: [0, 0],
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

			spells.push({
				name: 'Vanish',
				description: `You can't see me.`,
				type: 'vanish',
				icon: [1, 0],
				animation: 'magic',
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
		}
	};
});
