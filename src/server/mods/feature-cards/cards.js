define([
	'items/generator',
	'misc/events'
], function (
	itemGenerator,
	events
) {
	var config = {
		'Runecrafter\'s Toil': {
			chance: 0.05,
			reward: 'Rune',
			setSize: 3,
			mobLevel: [3, 100]
		},
		'Godly Promise': {
			chance: 0.0025,
			reward: 'Level 15 Legendary Weapon',
			setSize: 12,
			zone: 'sewer'
		},
		'The Other Heirloom': {
			chance: 0.04,
			reward: 'Perfect Level 10 Ring',
			setSize: 3,
			mobName: 'flamingo'
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

			var configs = extend(true, {}, config);
			events.emit('onBeforeGetCardsConfig', configs);

			Object.keys(configs).forEach(function (c) {
				var card = configs[c];

				var rqrLevel = card.mobLevel;
				if (rqrLevel) {
					if ((rqrLevel.push) && ((mobLevel < rqrLevel[0]) || (mobLevel > rqrLevel[1])))
						return;
					else if ((!rqrLevel.push) && (mobLevel != rqrLevel))
						return;
				}
				var mobName = card.mobName;
				if (mobName) {
					if ((mobName.toLowerCase) && (mob.name.toLowerCase() != mobName.toLowerCase()))
						return;
					else if ((mobName.push) && (!mobName.some(m => (m.toLowerCase() == mob.name.toLowerCase()))))
						return;
				}

				if (Math.random() >= card.chance)
					return;

				pool.push(c);
			}, this);

			if (pool.length == 0)
				return;

			var pickName = pool[~~(Math.random() * pool.length)];
			var pick = configs[pickName];

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
			var configs = extend(true, {}, config);
			events.emit('onBeforeGetCardsConfig', configs);

			var reward = configs[set].reward;
			var msg = {
				reward: reward,
				handler: this.rewards[reward]
			};

			events.emit('onBeforeGetCardReward', msg);

			return msg.handler();
		},

		rewards: {
			'Rune': function () {
				return itemGenerator.generate({
					spell: true
				});
			},

			'Level 15 Legendary Weapon': function () {
				return itemGenerator.generate({
					level: 15,
					quality: 4,
					noSpell: true,
					slot: 'twoHanded'
				});
			},

			'Perfect Level 10 Ring': function () {
				return itemGenerator.generate({
					level: 10,
					noSpell: true,
					perfection: 1,
					slot: 'finger'
				});
			}
		}
	};
});
