module.exports = {
	name: 'Fishing Tournament',
	description: `Catch the biggest Ancient Carp for a chance to win Angler's Marks. Speak with Angler Nayla for more info.`,
	distance: -1,
	cron: '*/1 * * * *',

	notifications: [{
		mark: 0,
		msg: 'Angler Nayla: The Fishing Tournament begins in 10 minutes.'
	}, {
		mark: 857,
		msg: 'Angler Nayla: The Fishing Tournament begins in 5 minutes.'
	}, {
		mark: 1543,
		msg: 'Angler Nayla: The Fishing Tournament begins in 1 minute.'
	}, {
		mark: 1714,
		msg: 'Angler Nayla: The Fishing Tournament has begun!'
	}, {
		mark: 2571,
		msg: 'Angler Nayla: The Fishing Tournament ends in 5 minutes.'
	}, {
		mark: 3256,
		msg: 'Angler Nayla: The Fishing Tournament ends in 1 minute.'
	}, {
		mark: 3428,
		msg: 'Angler Nayla: The Fishing Tournament is over.'
	}],

	duration: 4285,
	prizeTime: 3428,

	events: {
		afterGiveRewards: function(events) {
			events.setEventDescription('Fishing Tournament', 'The tournament has ended.');
		}
	},

	helpers: {
		updateRewards: function(event, anglerNayla) {
			event.ranks = {};
			event.rewards = {};
			event.weights = {};

			var tempFish = anglerNayla.inventory.items
				.filter(i => (i.name.indexOf('Ancient Carp') > -1))
				.sort((a, b) => (b.stats.weight - a.stats.weight));

			var fish = [];
			tempFish.forEach(function(t) {
				if (!fish.some(f => (f.owner == t.owner)))
					fish.push(t);
			});

			var tplRewards = {
				'0': [{
					name: `Angler's Mark`,
					quantity: 35,
					sprite: [12, 9]
				}],
				'1': [{
					name: `Angler's Mark`,
					quantity: 20,
					sprite: [12, 9]
				}],
				'2': [{
					name: `Angler's Mark`,
					quantity: 10,
					sprite: [12, 9]
				}]
			};

			var rank = 0;
			var lastWeight = fish[0].stats.weight;
			for (var i = 0; i < fish.length; i++) {
				var f = fish[i];
				if (event.rewards[f.owner])
					continue;

				if (f.stats.weight < lastWeight) {
					lastWeight = f.stats.weight;
					rank++;
				}

				event.ranks[f.owner] = rank + 1;
				event.weights[f.owner] = f.stats.weight;
				event.rewards[f.owner] = extend(true, [], tplRewards[rank]);

				if (rank > 2)
					break;
			}
		},

		updateDescription: function(event, events) {
			var ranks = event.ranks;
			var weights = event.weights;

			var desc = `Catch the biggest Ancient Carp for a chance to win Angler's Marks. Speak with Angler Nayla for more info.<br /><br />Leaderboard:<br />`;
			for (var playerName in ranks) {
				desc += `${ranks[playerName]}: ${playerName} (${weights[playerName]}) <br />`;
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
		endMark: 1714,
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
								type: 'Competition Fishing Rod',
								worth: 0,
								noSalvage: true,
								stats: {
									catchSpeed: 50,
									catchChance: 25
								}
							},
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
			},
			trade: {
				items: {
					min: 0,
					max: 0
				},
				forceItems: [{
					name: 'Common Fishing Rod',
					type: 'Fishing Rod',
					slot: 'tool',
					quality: 0,
					worth: {
						currency: `Angler's Mark`,
						amount: 5
					},
					sprite: [11, 0],
					infinite: true,
					stats: {
						stats: '???'
					}
				}, {
					name: 'Magic Fishing Rod',
					type: 'Fishing Rod',
					slot: 'tool',
					quality: 1,
					worth: {
						currency: `Angler's Mark`,
						amount: 15
					},
					sprite: [11, 0],
					infinite: true,
					stats: {
						stats: '???'
					}
				}, {
					name: 'Rare Fishing Rod',
					type: 'Fishing Rod',
					slot: 'tool',
					quality: 2,
					worth: {
						currency: `Angler's Mark`,
						amount: 45
					},
					sprite: [11, 0],
					infinite: true,
					stats: {
						stats: '???'
					}
				}],
				level: {
					min: 1,
					max: 5
				},
				markup: {
					buy: 0.25,
					sell: 2.5
				}
			}
		}
	}, {
		endMark: 3428,
		auto: true,
		type: 'hookEvents',
		events: {
			beforeGatherResource: function(gatherResult, gatherer) {
				if (!gatherResult.nodeType == 'fish')
					return;

				var hasCompRod = gatherer.inventory.items.some(i => ((i.name == 'Competition Rod') && (i.eq)));
				if (!hasCompRod)
					return;

				gatherResult.items[0].name = 'Ancient Carp';
				gatherResult.items[0].sprite = [11, 4];
			}
		}
	}, {
		type: 'modifyDialogue',
		mobId: 'anglerNayla',
		dialogue: {
			add: {
				'1': {
					'1.4': {
						msg: `I'd like to hand in some fish.`,
						prereq: function(obj) {
							var fishies = obj.inventory.items.find(i => (i.name.indexOf('Ancient Carp') > -1));
							return !!fishies;
						},
						goto: 'giveFish'
					}
				},
				'giveFish': {
					msg: [{
						msg: ``,
						options: [1.1, 1.2, 1.3, 1.4]
					}],
					method: function(obj) {
						var eventConfig = this.instance.events.getEvent('Fishing Tournament');
						if (!eventConfig)
							return;

						var helpers = eventConfig.helpers;
						var event = eventConfig.event;

						var oldRank = helpers.getRank(event, obj.name);

						helpers.giveFish(obj, this);
						helpers.updateRewards(event, this);

						var newRank = helpers.getRank(event, obj.name);
						helpers.updateDescription(event, this.instance.events);

						if (oldRank != newRank) {
							helpers.updateWinText(event, this.instance.events);

							return {
								'1': `Wow, that one's huge. You took first place!`,
								'2': `Nice catch. You took second place!`,
								'3': `Not bad at all. You took third place!`
							}[newRank];
						} else
							return 'Not quite heavy enough, keep trying!';

						return reply;
					}
				}
			}
		}
	}]
};