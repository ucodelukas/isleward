module.exports = [{
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
						var myInventory = this.inventory;
						var heaviest = 0;

						var inventory = obj.inventory;
						var fishies = inventory.items.filter(i => (i.name.indexOf('Ancient Carp') > -1));
						var count = fishies.length;
						fishies.forEach(function(f) {
							var w = f.stats.weight;
							if (w > heaviest)
								heaviest = w;

							f.owner = obj.name;

							inventory.destroyItem(f.id);
							myInventory.getItem(f);
						});

						var reply = 'Thanks, but ' + ((count == 1) ? 'that one' : 'these') + ' are a bit too small';

						var myFishies = myInventory.items
							.filter(i => (i.name.indexOf('Ancient Carp') > -1))
							.sort((a, b) => (b.stats.weight - a.stats.weight));

						var mLen = myFishies.length;
						var ranks = {
							'0': [],
							'1': [],
							'2': []
						};
						var players = [];
						var nextRank = 0;
						for (var i = 0; i < mLen; i++) {
							var f = myFishies[i];
							var player = f.owner;
							if (players.some(p => (p == player)))
								continue;

							var rank = ranks[nextRank];
							if ((rank.length == 0) || (rank[0].stats.weight == f.stats.weight)) {
								players.push(player);
								rank.push(f);
							} else {
								i--;
								nextRank++;
							}

							if (nextRank == 3)
								break;
						}

						var rank = Object.keys(ranks).find(r => (ranks[r].some(p => (p.owner == obj.name))));
						if (rank) {
							var winWeight = ranks[rank].find(p => (p.owner == obj.name)).stats.weight;
							if (winWeight == heaviest) {
								var position = {
									'0': 'first',
									'1': 'second',
									'2': 'third'
								}[rank];
								reply = `Wow, that one's huge! You've taken ${position} place.`;

								this.instance.syncer.queue('onGetMessages', {
									messages: {
										class: 'q4',
										message: `Angler Nayla: ${obj.name} has taken ${position} place in the Fishing Tournament!`
									}
								});
							}
						}

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
						var rewards = {};

						var desc = `Catch the biggest Ancient Carp with a Competition Rod. Get a Competition Rod from Angler Nayla if you don't have one already.<br /><br />Leaderboard:<br />`;
						for (var i = 0; i < 3; i++) {
							ranks[i].forEach(function(r) {
								desc += (i + 1) + ': ' + r.owner + '<br />';

								rewards[r.owner] = tplRewards[i];
							});
						}

						this.instance.events.setEventDescription('Fishing Tournament', desc);
						this.instance.events.setEventRewards('Fishing Tournament', rewards);

						var winText = 'Angler Nayla: ' + ranks[0].map(r => r.owner).join(', ') + ' won!';
						this.instance.events.setWinText('Fishing Tournament', winText)

						return reply;
					}
				}
			}
		}
	}]
}, {
	name: 'Rodriguez Heist',
	description: `Rodriguez, the Hermit's only chicken companion, has been kidnapped by a band of imps. Who knows what they plan on doing with him.`,
	distance: -1,
	cron: '0 */2 * * *',

	phases: [{
		type: 'spawnMob',
		spawnRect: {
			x: 70,
			y: 40
		},
		mobs: [{
			amount: 4,
			name: 'Thieving Imp',
			attackable: false,
			level: 5,
			cell: 51,
			id: 'impthief-$',
			hpMult: 5,
			dmgMult: 1,
			drops: {
				rolls: 0
			},
			pos: [{
				x: 0,
				y: 0
			}, {
				x: 4,
				y: 0
			}, {
				x: 0,
				y: 4
			}, {
				x: 4,
				y: 4
			}]
		}, {
			name: 'Imp Kingpin',
			level: 8,
			attackable: false,
			cell: 52,
			id: 'imp-kingpin',
			hpMult: 10,
			dmgMult: 2,
			pos: {
				x: 2,
				y: 2
			}
		}, {
			name: 'Rodriguez',
			exists: true,
			pos: {
				x: 3,
				y: 2
			}
		}]
	}, {
		type: 'locateMob',
		announce: 'Locate the thieves',
		mobs: 'imp-kingpin',
		distance: 3
	}, {
		type: 'eventChain',
		config: [{
			type: 'mobTalk',
			id: 'impthief-1',
			text: `Boss! They're onto us!`,
			delay: 10
		}, {
			type: 'mobTalk',
			id: 'impthief-2',
			text: `They'll take the chicken. We needs it!`,
			delay: 10
		}, {
			type: 'mobTalk',
			id: 'imp-kingpin',
			text: `They'll never have her, she's ours now! Kill them!`,
			delay: 10
		}, {
			type: 'addComponents',
			mobs: ['impthief-0', 'impthief-1', 'impthief-2', 'impthief-3'],
			components: [{
				type: 'aggro',
				faction: 'forest imps'
			}]
		}]
	}, {
		type: 'killMob',
		mobs: ['impthief-0', 'impthief-1', 'impthief-2', 'impthief-3']
	}, {
		type: 'eventChain',
		config: [{
			type: 'mobTalk',
			id: 'imp-kingpin',
			text: `I have a thousand more imps. Come, I'll finish this now.`,
			delay: 10
		}, {
			type: 'addComponents',
			mobs: 'imp-kingpin',
			components: [{
				type: 'aggro',
				faction: 'forest imps'
			}]
		}]
	}, {
		type: 'killMob',
		mobs: 'imp-kingpin',
		percentage: 0.2
	}, {
		type: 'eventChain',
		config: [{
			type: 'removeComponents',
			mobs: 'imp-kingpin',
			components: 'aggro'
		}, {
			type: 'mobTalk',
			id: 'imp-kingpin',
			text: `Aargh, no! I must get to my lair!`,
			delay: 10
		}]
	}, {
		type: 'spawnMob',
		mobs: {
			name: 'Imp Kingpin',
			exists: true,
			pos: {
				x: 90,
				y: 25
			}
		}
	}]
}];