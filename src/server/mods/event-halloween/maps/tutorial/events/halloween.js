define([

], function(

) {
	return {
		name: 'Halloween',
		description: `Snappadoowap.`,
		distance: -1,
		cron: '* * * * *',

		events: {
			
		},

		helpers: {
			
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
				hpMult: 1,
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
				},
				trade: {
					items: {
						min: 0,
						max: 0
					},
					forceItems: [{
						name: 'Cerulean Pearl',
						material: true,
						sprite: [11, 9],
						infinite: true,
						quality: 3,
						worth: {
							currency: `Angler's Mark`,
							amount: 4
						},
					}, {
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
					faction: {
						id: 'anglers'
					},
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
			type: 'hookEvents',
			endMark: 3428,
			auto: true,
			events: {
				beforeGatherResource: function(gatherResult, gatherer) {
					if (gatherResult.nodeType != 'fish')
						return;

					var hasCompRod = gatherer.inventory.items.some(i => ((i.name == 'Competition Rod') && (i.eq)));
					if (!hasCompRod)
						return;

					gatherResult.items.forEach(function(g) {
						extend(true, g, {
							name: 'Ancient Carp',
							sprite: [11, 4],
							noDrop: true
						});
					});
				},

				beforeEnterPool: function(gatherResult, gatherer) {
					if (gatherResult.nodeName == 'Sun Carp')
						gatherResult.nodeName = 'Ancient Carp';
				}
			}
		}, {
			type: 'modifyDialogue',
			endMark: 3428,
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
							} else if (newRank == 1)
								return `Great, you're still in first place!`;
							else
								return 'Not quite heavy enough, keep trying!';
						}
					}
				}
			}
		}, {
			type: 'modifyDialogue',
			mobId: 'anglerNayla',
			dialogue: {
				remove: {
					'1': {
						'1.4': null
					},
					'giveFish': null
				}
			}
		}]
	};
});