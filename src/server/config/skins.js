define([
	'misc/events'
], function (
	events
) {
	var config = {
		'wizard 1': {
			name: 'Wizard 1',
			sprite: [2, 0],
			class: 'wizard',
			default: true
		},
		'wizard 2': {
			name: 'Wizard 2',
			sprite: [3, 0],
			class: 'wizard',
			default: true
		},
		'warrior 1': {
			name: 'Warrior 1',
			sprite: [1, 1],
			class: 'warrior',
			default: true
		},
		'warrior 2': {
			name: 'Warrior 2',
			sprite: [2, 1],
			class: 'warrior',
			default: true
		},
		'cleric 1': {
			name: 'Cleric 1',
			sprite: [4, 0],
			class: 'cleric',
			default: true
		},
		'cleric 2': {
			name: 'Cleric 2',
			sprite: [5, 0],
			class: 'cleric',
			default: true
		},
		'thief 1': {
			name: 'Thief 1',
			sprite: [6, 0],
			class: 'thief',
			default: true
		},
		'thief 2': {
			name: 'Thief 2',
			sprite: [7, 0],
			class: 'thief',
			default: true
		},

		'gaekatla druid': {
			name: 'Skin: Gaekatlan Druid',
			sprite: [0, 4],
			class: 'cleric'
		},

		//Elite Skin Pack
		'1.1': {
			name: 'Sorcerer',
			spritesheet: 'images/skins/0001.png',
			sprite: [0, 0],
			class: 'wizard'
		},
		'1.2': {
			name: 'Diviner',
			spritesheet: 'images/skins/0001.png',
			sprite: [1, 0],
			class: 'cleric'
		},
		'1.3': {
			name: 'Cutthroat',
			spritesheet: 'images/skins/0001.png',
			sprite: [2, 0],
			class: 'thief'
		},
		'1.4': {
			name: 'Man of War',
			spritesheet: 'images/skins/0001.png',
			sprite: [3, 0],
			class: 'warrior'
		},
		'1.5': {
			name: 'Occultist',
			spritesheet: 'images/skins/0001.png',
			sprite: [4, 0],
			class: 'necromancer'
		},

		//Templar Skin Pack
		'2.1': {
			name: 'Crusader 1',
			spritesheet: 'images/skins/0010.png',
			sprite: [0, 0],
			class: ['cleric', 'warrior']
		},
		'2.2': {
			name: 'Crusader 2',
			spritesheet: 'images/skins/0010.png',
			sprite: [1, 0],
			class: ['cleric', 'warrior']
		},
		'2.3': {
			name: 'Crusader 3',
			spritesheet: 'images/skins/0010.png',
			sprite: [2, 0],
			class: ['cleric', 'warrior']
		},
		'2.4': {
			name: 'Crusader 4',
			spritesheet: 'images/skins/0010.png',
			sprite: [3, 0],
			class: ['cleric', 'warrior']
		},
		'2.5': {
			name: 'Grand Crusader',
			spritesheet: 'images/skins/0010.png',
			sprite: [4, 0],
			class: ['cleric', 'warrior']
		}
	};

	return {
		init: function () {
			events.emit('onBeforeGetSkins', config);
		},

		getBlueprint: function (skinId) {
			return config[skinId];
		},

		getSkinList: function (skins) {
			var list = Object.keys(config)
				.filter(function (s) {
					return ((config[s].default) || (skins.some(f => (f == s))));
				})
				.map(function (s) {
					var res = extend(true, {}, config[s]);
					res.id = s;
					return res;
				});

			var result = {};
			list.forEach(function (skin) {
				var classList = skin.class;
				if (!classList.push)
					classList = [classList];

				classList.forEach(function (className) {
					if (!result[className])
						result[className] = [];

					result[className].push({
						name: skin.name,
						id: skin.id,
						sprite: skin.sprite[0] + ',' + skin.sprite[1],
						spritesheet: skin.spritesheet
					});
				}, this);
			});

			return result;
		},

		getCell: function (skinId) {
			var skin = config[skinId];
			return (skin.sprite[1] * 8) + skin.sprite[0];
		},

		getSpritesheet: function (skinId) {
			var skin = config[skinId];
			return skin.spritesheet || 'characters';
		}
	};
});
