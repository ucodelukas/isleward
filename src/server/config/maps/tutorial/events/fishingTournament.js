module.exports = {
	name: 'Fishing Tournament',
	description: `Catch the biggest Ancient Carp with a Competition Rod. Get a Competition Rod from Angler Nayla if you don't have one already.`,
	distance: -1,
	cron: '* * * * *',

	notifications: [{
		mark: 0,
		msg: 'Angler Nayla: The Fishing Tournament begins in 15 minutes.'
	}, {
		mark: 30, //1543,
		msg: 'Angler Nayla: The Fishing Tournament begins in 5 minutes.'
	}, {
		mark: 35, //2229,
		msg: 'Angler Nayla: The Fishing Tournament begins in 1 minute.'
	}, {
		mark: 40, //2400,
		msg: 'Angler Nayla: The Fishing Tournament has begun!'
	}, {
		mark: 45, //2410,
		msg: 'Angler Nayla: The Fishing Tournament is over.'
	}],

	duration: 460000,

	helpers: {
		updateRewards: function(event, anglerNayla) {
			event.ranks = {};
			event.rewards = {};

			var fish = anglerNayla.inventory.items
				.filter(i => (i.name.indexOf('Ancient Carp') > -1))
				.sort((a, b) => (b.stats.weight - a.stats.weight));

			var tplRewards = {
				'0': [{
					name: 'Cerulean Pearl',
					material: true,
					quantity: 6,
					sprite: [11, 9]
				}],
				'1': [{
					name: 'Cerulean Pearl',
					material: true,
					quantity: 4,
					sprite: [11, 9]
				}],
				'2': [{
					name: 'Cerulean Pearl',
					material: true,
					quantity: 2,
					sprite: [11, 9]
				}]
			};

			var rank = 0;
			var lastWeight = fish[0].stats.weight;
			for (var i = 0; i < fish.length; i++) {
				var f = fish[i];
				if (f.stats.weight > lastWeight) {
					lastWeight = f.stats.weight;
					rank++;
				}

				if (rank > 2)
					break;

				event.ranks[f.owner] = rank + 1;
				event.rewards[f.owner] = extend(true, [], tplRewards[rank]);
			}
		},

		updateDescription: function(event, events) {
			var ranks = event.ranks;

			var desc = `Catch the biggest Ancient Carp with a Competition Rod. Get a Competition Rod from Angler Nayla if you don't have one already.<br /><br />Leaderboard:<br />`;
			for (var playerName in ranks) {
				desc += ranks[playerName] + ': ' + playerName + '<br />';
			}

			events.setEventDescription('Fishing Tournament', desc);
		},

		updateWinText: function(event, events) {
			var ranks = event.ranks;

			var winText = `Angler Nayla: `;
			var winners = Object.keys(ranks).filter(r => (ranks[r] == 1));
			var wLen = winners.length;
			winners.forEach(function(w, i) {
				winText += ((wLen > 1) && (i == wLen - 1)) ? `and ${w} ` : `${w} `;
			});

			winText += 'won!';

			events.setWinText('Fishing Tournament', winText);
		},

		giveFish: function(source, target) {
			var srcInventory = source.inventory;
			var tgtInventory = target.inventory;

			var fishies = srcInventory.items.filter(i => (i.name.indexOf('Ancient Carp') > -1));
			fishies.forEach(function(f) {
				f.owner = source.name;

				srcInventory.destroyItem(f.id);
				tgtInventory.getItem(f);
			});
		},

		getRank: function(event, playerName) {
			var ranks = event.ranks;
			if (!event.ranks)
				return -1;

			return (event.ranks[playerName] || -1);
		}
	},

	phases: [{
		type: 'spawnMob',
		endMark: 4,
		mobs: {
			name: 'Angler Nayla',
			attackable: false,
			level: 20,
			cell: 69,
			id: 'anglerNayla',
			pos: {
				x: 95,
				y: 31
			},
			dialogue: {
				auto: true,
				config: {
					'1': {
						msg: [{
							msg: `Hi, LOL?`,
							options: [1.1, 1.2]
						}],
						options: {
							'1.1': {
								msg: `What's happening here?`,
								goto: 2
							},
							'1.2': {
								msg: `Gimme sumdat leet comp-rod plox!`,
								goto: 3
							}
						}
					},
					'2': {
						msg: `Making fishcatch, fool.`,
						options: {
							'2.1': {
								msg: `Soz.`
							}
						}
					},
					'3': {
						cpn: 'dialogue',
						method: 'getItem',
						args: [{
							item: {
								name: 'Leet Comp-Rod',
								slot: 'tool',
								sprite: [11, 1],
								type: 'Competition Fishing Rod',
								stats: {
									catchSpeed: 50,
									catchChance: 25
								}
							}
						}]
					}
				}
			}
		}
	}, {
		endMark: 450000,
		auto: true,
		type: 'hookEvents',
		events: {
			beforeGatherResource: function(gatherResult) {
				if (Math.random() < 1.0)
					gatherResult.items[0].name = 'Ancient Carp';
			}
		}
	}, {
		type: 'modifyDialogue',
		mobId: 'anglerNayla',
		dialogue: {
			add: {
				'1': {
					'1.3': {
						msg: 'Take my fish, yo.',
						prereq: function(obj) {
							var fishies = obj.inventory.items.find(i => (i.name.indexOf('Ancient Carp') > -1));
							return true; //!!fishies;
						},
						goto: 'giveFish'
					}
				},
				'giveFish': {
					msg: [{
						msg: `Noice.`,
						options: [1.1, 1.2, 1.3]
					}],
					method: function(obj) {
						var event = this.instance.events.getEvent('Fishing Tournament');
						if (!event)
							return;

						var helpers = event.helpers;

						var oldRank = helpers.getRank(event, obj.name);

						event.helpers.giveFish(obj, this);
						helpers.updateRewards(event, this);

						var newRank = helpers.getRank(event, obj.name);

						if (oldRank != newRank) {
							helpers.updateDescription(event, this.instance.events);
							helpers.updateWinText(event, this.instance.events);

							return {
								'1': `Wow, that one's huge. You took first place!`,
								'2': `Nice catch. You took second place!`,
								'3': `Not bad at all. You too third place!`
							}[newRank];
						}
						else
							return 'Not quite heavy enough, keep trying!';

						return reply;
					}
				}
			}
		}
	}]
};