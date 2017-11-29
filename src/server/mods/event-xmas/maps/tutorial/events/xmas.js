/*
A visitor, welcome!
	Who are you?
		I am the place where snow began, for I am the Winter Man.
			What are you doing here?
				I came in the night to bring the cold, have you not heard the story told?
					Could you tell it to me?
						On the shortest night each year, the Man of Winter lends an ear
						To wishes mouthed in quiet ire; injustices or things required
						He'll send them gifts in the strangest places; fishing lines or fireplaces
						For the Winter Man has come to give, to the poor and lonely and those who grieve

						And when the snows have come to pass, the Winter Man only one thing asks
						That should you sense someone desire, you'll assist as they require
						Then when winter comes around again, keep an eye out for your icy friend
						For he is the place where cold began at the start of time; the Winter Man
I found some special snowflakes for you.

*/

define([

], function (

) {
	return {
		name: `Merrywinter`,
		description: `The Winter Man has returned to the isles, bringing gifts, games and snow.`,
		distance: -1,
		cron: '* * * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'spawnMob',
			mobs: {
				name: 'The Winter Man',
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
								msg: `Why, hello!`,
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
										return ((!!snowflakes) && (snowflakes.quantity >= 40));
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

								while (true) {
									var snowflakes = inventory.items.find(i => (i.name == 'Snowflake'));
									if ((!snowflakes) || (snowflakes.quantity < 40))
										return;
									obj.reputation.getReputation('theWinterMan', 100);

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
										description: 'Makes you merry, makes you shine.',
										worth: 0,
										cdMax: 1714,
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

									inventory.destroyItem(snowflakes.id, 40);
								}
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

					gatherer.reputation.getReputation('theWinterMan', 40);

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
