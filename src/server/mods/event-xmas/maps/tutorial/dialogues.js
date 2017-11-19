define([

], function (

) {
	return {
		'father giftybags': {
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

					while (true) {
						var snowflakes = inventory.items.find(i => (i.name == 'Snowflake'));
						if ((!snowflakes) || (snowflakes.quantity < 1))
							return;
						obj.reputation.getReputation('fatherGiftybags', 100);

						var chances = {
							'Glass of Eggnog': 25,
							'Sprig of Mistletoe': 7,
							'Merrywinter Play Script': 1
						};

						var rewards = [{
							name: 'Glass of Eggnog',
							type: 'consumable',
							sprite: [1, 1],
							spritesheet: `server/mods/event-xmas/images/items.png`,
							worth: 0,
							quantity: 1,
							noSalvage: true,
							noAugment: true
						}, {
							name: 'Sprig of Mistletoe',
							type: 'consumable',
							sprite: [3, 1],
							spritesheet: `server/mods/event-xmas/images/items.png`,
							worth: 0,
							quantity: 1,
							noSalvage: true,
							noAugment: true
						}, {
							name: 'Merrywinter Play Script',
							type: 'consumable',
							sprite: [1, 1],
							spritesheet: `server/mods/event-xmas/images/items.png`,
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
						var blueprint = rewards[pick];

						inventory.getItem(extend(true, {}, blueprint));

						inventory.destroyItem(snowflakes.id, 1);
					}
				}
			}
		}
	};
});
