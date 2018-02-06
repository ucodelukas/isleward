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
			wizard: ['magic missile', 'ice spear'],
			warrior: ['slash', 'charge'],
			thief: ['flurry', 'smokebomb']
		},
		stats: {
			wizard: {
				values: {
					hpMax: 50
				},
				vitScale: 10,
				gainStats: {
					int: 1
				}
			},
			warrior: {
				values: {
					hpMax: 80
				},
				vitScale: 10,
				gainStats: {
					str: 1
				}
			},
			thief: {
				values: {
					hpMax: 70
				},
				vitScale: 10,
				gainStats: {
					dex: 1
				}
			}
		},
		weapons: {
			wizard: 'Gnarled Staff',
			thief: 'Dagger',
			warrior: 'Sword'
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
