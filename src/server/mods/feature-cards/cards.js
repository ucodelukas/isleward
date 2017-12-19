define([
	'items/generator',
	'misc/events'
], function (
	itemGenerator,
	events
) {
	var config = {
		'Runecrafter\'s Toil': {
			chance: 0.025,
			reward: 'Rune',
			setSize: 3,
			mobLevel: [3, 100]
		},
		'Godly Promise': {
			chance: 0.015,
			reward: 'Level 15 Legendary Weapon',
			setSize: 6,
			zone: 'sewer'
		},
		'The Other Heirloom': {
			chance: 0.02,
			reward: 'Perfect Level 10 Ring',
			setSize: 3,
			mobName: 'flamingo'
		},
		'Benthic Incantation': {
			chance: 0.015,
			reward: `Princess Morgawsa's Trident`,
			setSize: 12,
			zone: 'estuary'
		},
		'Fangs of Fury': {
			chance: 0.2,
			reward: `Steelclaw's Bite`,
			setSize: 20,
			mobName: 'steelclaw'
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

		getCard: function (looter, mob) {
			var pool = [];

			var mobLevel = mob.stats.values.level;

			var configs = extend(true, {}, config);
			events.emit('onBeforeGetCardsConfig', configs);

			Object.keys(configs).forEach(function (c) {
				var card = configs[c];
				if (!card.chance)
					return;

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

				if ((card.zone) && (looter.zoneName != card.zone))
					return;

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
				spritesheet: pick.spritesheet || `${this.folderName}/images/items.png`,
				type: 'Reward Card',
				description: 'Reward: ' + pick.reward,
				noSalvage: true,
				sprite: pick.sprite || [0, 0],
				quantity: 1,
				quality: pick.quality || 1,
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
					//Always be at least magic
					bonusMagicFind: 286,
					perfection: 1,
					slot: 'finger'
				});
			},

			"Princess Morgawsa's Trident": function () {
				return itemGenerator.generate({
					name: `Princess Morgawsa's Trident`,
					level: [10, 15],
					quality: 4,
					noSpell: true,
					slot: 'twoHanded',
					sprite: [0, 0],
					spritesheet: '../../../images/legendaryItems.png',
					type: 'Trident',
					spellName: 'magic missile',
					description: `Summoned from the ancient depths of the ocean by the Benthic Incantation.`,
					stats: ['elementFrostPercent', 'elementFrostPercent', 'elementFrostPercent'],
					effects: [{
						type: 'freezeOnHit',
						rolls: {
							i_chance: [2, 5],
							i_duration: [2, 4]
						}
					}]
				});
			},

			"Steelclaw's Bite": function () {
				return itemGenerator.generate({
					name: `Steelclaw's Bite`,
					level: [7, 10],
					quality: 4,
					noSpell: true,
					slot: 'twoHanded',
					sprite: [1, 0],
					spritesheet: '../../../images/legendaryItems.png',
					type: 'Curved Dagger',
					spellName: 'double slash',
					description: `The blade seems to be made of some kind of bone and steel alloy.`,
					stats: ['dex', 'dex', 'addCritMultiplier', 'addCritMultiplier'],
					effects: [{
						type: 'damageSelf',
						rolls: {
							i_percentage: [8, 22]
						}
					}, {
						type: 'alwaysCrit',
						rolls: {}
					}]
				});
			}
		}
	};
});
