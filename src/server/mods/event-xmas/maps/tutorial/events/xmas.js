define([

], function (

) {
	return {
		name: `Xmas Thang`,
		description: `All be happy, there be snow.`,
		distance: -1,
		cron: '* * * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'spawnMob',
			mobs: {
				name: 'Father Giftybags',
				attackable: false,
				level: 20,
				cell: 2,
				sheetName: 'server/mods/event-xmas/images/mobs.png',
				id: 'giftyBags',
				hpMult: 1,
				pos: {
					x: 106,
					y: 45
				},
				dialogue: {
					auto: true,
					config: {
						'1': {
							msg: [{
								msg: `Hi there, are you here to compete?`,
								options: [1.1, 1.2, 1.3]
							}],
							options: {
								'1.1': {
									msg: `What's happening here?`,
									goto: 2
								},
								'1.2': {
									msg: `Could I please have a Competition Rod?`,
									goto: 5
								},
								'1.3': {
									msg: `I would like to trade some Angler's Marks.`,
									goto: 'tradeBuy'
								}
							}
						},
						'2': {
							msg: `Why, the Grand Fishing Tournament, of course! Anglers come from all over to compete in this esteemed event.`,
							options: {
								'2.1': {
									msg: `How does it work?`,
									goto: 3
								}
							}
						},
						'3': {
							msg: `Simply catch fish during the tournament. If you're lucky, you'll catch an Ancient Carp. Bring them to me and if you catch the biggest one, you win!`,
							options: {
								'3.1': {
									msg: `What are the prizes?`,
									goto: 4
								}
							}
						},
						'4': {
							msg: `The top three participants will win Angler's Marks that can be exchanged for Fishing Rods and Cerulean Pearls.`,
							options: {
								'4.1': {
									msg: `I would like to ask something else.`,
									goto: 1
								}
							}
						},
						'5': {
							msg: [{
								msg: ``,
								options: [1.1, 1.2, 1.3, 1.4]
							}],
							cpn: 'dialogue',
							method: 'getItem',
							args: [{
								item: {
									name: 'Competition Rod',
									slot: 'tool',
									sprite: [11, 1],
									type: 'Fishing Rod',
									worth: 0,
									noSalvage: true,
									noAugment: true,
									stats: {
										catchSpeed: 50,
										catchChance: 25
									}
								},
								successMsg: 'May it cast true.',
								existsMsg: 'Oh, it seems that you already have one.'
							}]
						},
						tradeBuy: {
							cpn: 'trade',
							method: 'startBuy',
							args: [{
								targetName: 'angler nayla'
							}]
						}
					}
				}
			}
		}, {
			type: 'hookEvents',
			events: {
				onBeforeBuildMob: function (zone, mobName, blueprint) {
					try {
						var zoneFile = require('mods/event-xmas/maps/' + zone + '/zone.js');
						var override = _.getDeepProperty(zoneFile, ['mobs', mobName]);
						if (override)
							extend(true, blueprint, override);
					} catch (e) {}
				},

				onBeforeGetCardsConfig: function (config) {
					extend(true, config, {
						'Cheer and Spear': {
							chance: 40,
							reward: 'Rare Festive Spear',
							setSize: 1,
							mobName: ['frost crab', 'rude holf']
						},
						'Smoop Smoop': {
							reward: 'Rare Festive Spear',
							setSize: 5
						}
					});
				},

				beforeGatherResource: function (gatherResult, gatherer) {
					var itemName = gatherResult.blueprint.itemName;
					if ((!itemName) || (itemName.toLowerCase() != 'snowflake'))
						return;

					gatherer.reputation.getReputation('fatherGiftybags', 40);

					if (Math.random() >= 10.1)
						return;

					gatherResult.items.push({
						name: 'Smoop Smoop',
						spritesheet: `server/mods/feature-cards/images/items.png`,
						type: 'Reward Card',
						description: 'Reward: Smeggy Steve Figurine',
						noSalvage: true,
						sprite: [0, 0],
						quantity: 1,
						quality: 1,
						setSize: 5
					});
				}
			}
		}]
	};
});
