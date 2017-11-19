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
					y: 46
				},
				dialogue: {
					auto: true,
					config: {
						'1': {
							msg: [{
								msg: `Soul's greeting to you.`,
								options: [1.1, 1.2]
							}],
							options: {
								'1.1': {
									msg: `Who are you?`,
									goto: '2'
								},
								'1.2': {
									msg: `I found some snowflakes for you.`,
									prereq: function (obj) {
										var snowflakes = obj.inventory.items.find(i => (i.name == 'Snowflake'));
										return ((!!snowflakes) && (snowflakes.quantity >= 1));
									},
									goto: 'giveSnowflakes'
								}
							}
						},
						giveSnowflakes: {
							msg: [{
								msg: `Ho, Ho, Holla at me!`,
								options: [1.1]
							}],
							method: function (obj) {
								var inventory = obj.inventory;

								//while (true) {
								var snowflakes = inventory.items.find(i => (i.name == 'Snowflake'));
								if ((!snowflakes) || (snowflakes.quantity < 1))
									return;
								obj.reputation.getReputation('fatherGiftybags', 100);

								var chances = {
									'Bottomless Eggnog': 1,
									'Sprig of Mistletoe': 1,
									'Merrywinter Play Script': 1
								};

								var rewards = [{
									name: 'Bottomless Eggnog',
									type: 'toy',
									sprite: [1, 1],
									spritesheet: `server/mods/event-xmas/images/items.png`,
									dscription: 'Makes you merry, makes you shine.',
									worth: 0,
									noSalvage: true,
									noAugment: true
								}, {
									name: 'Sprig of Mistletoe',
									type: 'consumable',
									sprite: [3, 1],
									spritesheet: `server/mods/event-xmas/images/items.png`,
									description: `Blows a kiss to your one true love...or whoever's closest`,
									worth: 0,
									quantity: 1,
									noSalvage: true,
									noAugment: true
								}, {
									name: 'Merrywinter Play Script',
									type: 'consumable',
									sprite: [2, 1],
									spritesheet: `server/mods/event-xmas/images/items.png`,
									description: 'Recites a line from the Merrywinter play',
									quantity: 1,
									worth: 0,
									noSalvage: true,
									noAugment: true
								}];

								var pool = [];
								Object.keys(chances).forEach(function (c) {
									for (var i = 0; i < chances[c]; i++) {
										pool.push(c);
									}
								});

								var pick = pool[~~(Math.random() * pool.length)];
								var blueprint = rewards.find(r => (r.name == pick));

								inventory.getItem(extend(true, {}, blueprint));

								inventory.destroyItem(snowflakes.id, 1);
								//}
							}
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
							mobName: ['frost crab', 'rude holf'],
							spritesheet: `server/mods/event-xmas/images/items.png`,
							sprite: [0, 1],
							quality: 2
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
						spritesheet: `server/mods/event-xmas/images/items.png`,
						type: 'Reward Card',
						description: 'Reward: Smeggy Steve Figurine',
						noSalvage: true,
						sprite: [0, 1],
						quantity: 1,
						quality: 2,
						setSize: 5
					});
				}
			}
		}]
	};
});
