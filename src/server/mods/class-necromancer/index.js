define([

], function(

) {
	return {
		name: 'Necormancer Class',

		extraScripts: [
			'spells/spellHarvestLife',
			'spells/spellSummonSkeleton',
			'spells/spellBloodBarrier'
		],

		init: function() {
			this.events.on('onBeforeGetClasses', this.beforeGetClasses.bind(this));
			this.events.on('onBeforeGetSkins', this.beforeGetSkins.bind(this));
			this.events.on('onBeforeGetItemTypes', this.beforeGetItemTypes.bind(this));
			this.events.on('onBeforeGetSpellsInfo', this.beforeGetSpellsInfo.bind(this));
			this.events.on('onBeforeGetSpellsConfig', this.beforeGetSpellsConfig.bind(this));
			this.events.on('onBeforeGetSpellTemplate', this.beforeGetSpellTemplate.bind(this));
			this.events.on('onBeforeGetResourceList', this.beforeGetResourceList.bind(this));
			this.events.on('onBeforeGetAnimations', this.beforeGetAnimations.bind(this));
		},

		beforeGetAnimations: function(animations) {
			var spritesheet = `${this.folderName}/images/inGameSprite.png`;

			animations.mobs[spritesheet] = {
				'0': {
					magic: {
						spritesheet: spritesheet,
						row: 0,
						col: 1,
						frames: 4,
						frameDelay: 4
					},
					melee: {
						spritesheet: spritesheet,
						row: 1,
						col: 1,
						frames: 3,
						frameDelay: 4
					}
				}
			};

			//Skeleton animations
			var mobsheet = `${this.folderName}/images/mobs.png`;
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

		beforeGetResourceList: function(list) {
			list.push(`${this.folderName}/images/inGameSprite.png`);
			list.push(`${this.folderName}/images/abilityIcons.png`);
			list.push(`${this.folderName}/images/mobs.png`);
		},

		beforeGetClasses: function(classes) {
			classes.spells.necromancer = ['summon skeleton', 'blood barrier'];
			classes.stats.necromancer = {
				values: {
					hpMax: 95
				},
				vitScale: 10,
				spritesheet: `${this.folderName}/images/inGameSprite.png`
			};
			classes.weapons.necromancer = 'Sickle';
			classes.portraits.necromancer = {
				spritesheet: `${this.folderName}/images/avatar.png`,
				x: 0,
				y: 0
			};
		},

		beforeGetSpellTemplate: function(spell) {
			if (spell.type == 'HarvestLife')
				spell.template = require(`${this.relativeFolderName}/spells/spellHarvestLife`);
			else if (spell.type == 'SummonSkeleton')
				spell.template = require(`${this.relativeFolderName}/spells/spellSummonSkeleton`);
			else if (spell.type == 'BloodBarrier')
				spell.template = require(`${this.relativeFolderName}/spells/spellBloodBarrier`);
		},

		beforeGetSkins: function(skins) {
			skins['necromancer 1'] = {
				name: 'Necromancer 1',
				sprite: [0, 0],
				class: 'necromancer',
				spritesheet: `${this.folderName}/images/classSprite.png`,
				default: true
			};
		},

		beforeGetItemTypes: function(types) {
			['Sickle', 'Jade Sickle', 'Golden Sickle', 'Bone Sickle'].forEach(function(s, i) {
				types.twoHanded[s] = {
					sprite: [i, 0],
					spellName: 'harvest life',
					spritesheet: `${this.folderName}/images/items.png`
				};
			}, this);
		},

		beforeGetSpellsConfig: function(spells) {
			spells['harvest life'] = {
				statType: ['str', 'int'],
				statMult: 0.1,
				element: 'physical',
				auto: true,
				cdMax: 7,
				manaCost: 0,
				range: 1,
				random: {
					damage: [2, 4],
					healPercent: [5, 15]
				}
			};

			spells['summon skeleton'] = {
				statType: ['str', 'int'],
				statMult: 0.1,
				element: 'physical',
				cdMax: 7,
				manaCost: 5,
				range: 9,
				random: {
					damagePercent: [80, 120],
					hpPercent: [80, 120]
				}
			};

			spells['blood barrier'] = {
				statType: ['str', 'int'],
				statMult: 0.1,
				element: 'physical',
				cdMax: 7,
				manaCost: 5,
				range: 9,
				random: {
					i_drainPercentage: [10, 50],
					shieldMultiplier: [2, 5],
					i_frenzyDuration: [10, 20]
				}
			};
		},

		beforeGetSpellsInfo: function(spells) {
			spells.push({
				name: 'Harvest Life',
				description: 'Absorbs the life-force of your enemies.',
				type: 'harvestLife',
				icon: [0, 0],
				animation: 'melee',
				spritesheet: `${this.folderName}/images/abilityIcons.png`,
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
				name: 'Summon Skeleton',
				description: 'Summons a skeletal warrior to assist you in combat.',
				type: 'summonSkeleton',
				icon: [1, 0],
				animation: 'magic',
				spritesheet: `${this.folderName}/images/abilityIcons.png`,
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
				name: 'Blood Barrier',
				description: 'Sacrifice some life force to granting an ally a protective barrier and increased attack speed.',
				type: 'bloodBarrier',
				icon: [2, 0],
				animation: 'magic',
				spellType: 'buff',
				spritesheet: `${this.folderName}/images/abilityIcons.png`,
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