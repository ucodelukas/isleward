define([
	'../misc/events'
], function (
	events
) {
	var classes = {
		portraits: {
			warrior: {
				x: 0,
				y: 0
			},
			cleric: {
				x: 1,
				y: 0
			},
			wizard: {
				x: 2,
				y: 0
			},
			thief: {
				x: 3,
				y: 0
			}
		},
		spells: {
			wizard: ['ice spear', 'fireblast'],
			cleric: ['healing circle'],
			warrior: ['charge'],
			thief: ['smokebomb']
		},
		stats: {
			wizard: {
				values: {
					hpMax: 50
				},
				vitScale: 10,
			},
			cleric: {
				values: {
					hpMax: 60
				},
				vitScale: 10
			},
			warrior: {
				values: {
					hpMax: 80
				},
				vitScale: 10
			},
			thief: {
				values: {
					hpMax: 70
				},
				vitScale: 10
			}
		},
		weapons: {
			wizard: 'Gnarled Staff',
			cleric: 'Mace',
			thief: 'Dagger',
			warrior: 'Axe'
		},

		getSpritesheet: function (className) {
			return this.stats[className].spritesheet || 'characters';
		},

		init: function () {
			events.emit('onBeforeGetClasses', classes);
		}
	};

	return classes;
});
