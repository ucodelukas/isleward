define([
	'../misc/events'
], function (
	events
) {
	var spells = {
		'magic missile': {
			statType: 'int',
			statMult: 0.9,
			element: 'arcane',
			auto: true,
			cdMax: 7,
			manaCost: 0,
			range: 9,
			random: {
				damage: [2, 7.6]
			}
		},
		'ice spear': {
			statType: 'int',
			statMult: 0.49,
			element: 'frost',
			cdMax: 12,
			manaCost: 4,
			range: 9,
			random: {
				damage: [4, 15.2],
				i_freezeDuration: [6, 10]
			}
		},
		'fireblast': {
			statType: 'int',
			statMult: 0.22,
			element: 'fire',
			cdMax: 6,
			manaCost: 5,
			random: {
				damage: [6, 22.9],
				i_radius: [1, 2.2],
				i_pushback: [1, 4]
			}
		},
		'smite': {
			statType: 'int',
			statMult: 0.96,
			element: 'holy',
			auto: true,
			needLos: true,
			cdMax: 6,
			manaCost: 0,
			range: 9,
			random: {
				damage: [4, 15.2]
			}
		},
		'healing circle': {
			statType: 'int',
			statMult: 0.07,
			element: 'holy',
			cdMax: 10,
			manaCost: 8,
			range: 9,
			radius: 3,
			random: {
				healing: [3.5, 4],
				i_duration: [7, 13]
			}
		},
		/*'holy vengeance': {
			statType: 'int',
			statMult: 1,
			cdMax: 30,
			manaCost: 15,
			range: 9,
			random: {
				i_duration: [30, 50]
			}
		},*/
		'slash': {
			statType: 'str',
			statMult: 0.84,
			element: 'physical',
			threatMult: 4,
			auto: true,
			cdMax: 5,
			useWeaponRange: true,
			random: {
				damage: [3, 11.4]
			}
		},
		'charge': {
			statType: 'str',
			statMult: 0.59,
			element: 'physical',
			threatMult: 3,
			cdMax: 15,
			range: 10,
			manaCost: 3,
			random: {
				damage: [3.5, 13.3],
				i_stunDuration: [6, 10]
			}
		},
		/*'reflect damage': {
			statType: 'str',
			statMult: 1,
			cdMax: 5,
			threatMult: 2,
			manaCost: 10,
			random: {
				i_duration: [4, 8]
			}
		},*/
		'double slash': {
			statType: 'dex',
			statMult: 0.88,
			element: 'physical',
			cdMax: 3,
			useWeaponRange: true,
			auto: true,
			random: {
				damage: [1, 3.8]
			}
		},
		'smokebomb': {
			statType: 'dex',
			statMult: 0.98,
			element: 'poison',
			cdMax: 5,
			manaCost: 6,
			random: {
				damage: [0.25, 0.73],
				i_radius: [1, 3],
				i_duration: [7, 13]
			}
		},
		/*'stealth': {
			statType: 'dex',
			statMult: 1,
			duration: 200,
			cdMax: 15,
			manaCost: 10
		},*/
		'crystal spikes': {
			statType: ['dex', 'int'],
			statMult: 1.82,
			element: 'physical',
			manaCost: 22,
			needLos: true,
			cdMax: 20,
			range: 9,
			random: {
				damage: [7, 26.5],
				i_delay: [1, 4]
			},
			negativeStats: [
				'i_delay'
			]
		},
		'innervation': {
			statType: ['str'],
			statMult: 0.0205,
			element: 'physical',
			manaReserve: {
				percentage: 0.25
			},
			cdMax: 10,
			auraRange: 9,
			effect: 'regenHp',
			random: {
				regenPercentage: [0.1, 0.5]
			}
		},
		'tranquility': {
			statType: ['int'],
			statMult: 0.0205,
			element: 'holy',
			manaReserve: {
				percentage: 0.25
			},
			cdMax: 10,
			auraRange: 9,
			effect: 'regenMana',
			random: {
				regenPercentage: [4, 10]
			}
		},
		'swiftness': {
			statType: ['dex'],
			statMult: 0.0205,
			element: 'fire',
			manaReserve: {
				percentage: 0.4
			},
			cdMax: 10,
			auraRange: 9,
			effect: 'swiftness',
			random: {
				chance: [5, 10]
			}
		}
		/*,
				'chain lightning': {
					statType: 'int',
					statMult: 0.454,
					element: 'holy',
					cdMax: 5,
					manaCost: 0,
					range: 9,
					random: {
						damage: [9.3, 18.6]
					}
				}*/
	};

	return {
		spells: spells,
		init: function () {
			events.emit('onBeforeGetSpellsConfig', spells);
		}
	};
});
