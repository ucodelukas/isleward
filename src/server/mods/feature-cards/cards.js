define([
	'items/generator'
], function (
	itemGenerator
) {
	var config = {
		'Runecrafter\'s Toil': {
			chance: 0.5,
			reward: 'Random Rune',
			setSize: 3,
			mobLevel: [3, 100]
		},
		'Godly Promise': {
			chance: 0.025,
			reward: 'Random Level 15 Legendary Weapon',
			setSize: 12,
			zone: 'sewer'
		}
	};

	return {
		init: function () {

		},

		fixCard: function (card) {
			var template = config[card.name];
			if (!template)
				return;

			card.setSize = template.setSize;
		},

		getCard: function (mob) {
			var pool = [];

			var mobLevel = mob.stats.values.level;

			Object.keys(config).forEach(function (c) {
				var card = config[c];

				var rqrLevel = card.mobLevel;
				if (rqrLevel) {
					if ((rqrLevel.push) && ((mobLevel < rqrLevel[0]) || (mobLevel > rqrLevel[1])))
						return;
					else if ((!rqrLevel.push) && (mobLevel != rqrLevel))
						return;
				}

				var rolls = card.rolls;
				for (var i = 0; i < rolls; i++) {
					pool.push(c);
				}
			}, this);

			if (pool.length == 0)
				return;

			var pickName = pool[~~(Math.random() * pool.length)];
			var pick = config[pickName];

			var card = {
				name: pickName,
				spritesheet: `${this.folderName}/images/items.png`,
				type: 'Reward Card',
				description: 'Reward: ' + pick.reward,
				noSalvage: true,
				sprite: [0, 0],
				quantity: 1,
				quality: 1,
				setSize: pick.setSize
			};

			return card;
		},

		getReward: function (set) {
			var reward = config[set].reward;

			return this.rewards[reward]();
		},

		rewards: {
			'Random Rune': function () {
				return itemGenerator.generate({
					spell: true
				});
			},

			'Random Level 15 Legendary Weapon': function () {
				return itemGenerator.generate({
					level: 15,
					quality: 4,
					noSpell: true,
					slot: 'twoHanded'
				});
			}
		}
	};
});
