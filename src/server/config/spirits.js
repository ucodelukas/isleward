define([
	'../misc/events'
], function (
	events
) {
	var spirits = {
		list: ['bear', 'owl', 'lynx'],
		portraits: {
			bear: {
				x: 0,
				y: 0
			},
			owl: {
				x: 2,
				y: 0
			},
			lynx: {
				x: 3,
				y: 0
			}
		},
		spells: {
			owl: ['magic missile', 'ice spear'],
			bear: ['slash', 'charge'],
			lynx: ['flurry', 'smokebomb']
		},
		stats: {
			owl: {
				values: {
					hpMax: 50
				},
				vitScale: 10,
				gainStats: {
					int: 1
				}
			},
			bear: {
				values: {
					hpMax: 80
				},
				vitScale: 10,
				gainStats: {
					str: 1
				}
			},
			lynx: {
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
			owl: 'Gnarled Staff',
			lynx: 'Dagger',
			bear: 'Sword'
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
