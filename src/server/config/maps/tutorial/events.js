module.exports = [{
	name: 'Fishing Tournament',
	description: `Catch the biggest Ancient Carp with a Competition Rod. Get a Competition Rod from Angler Nayla if you don't have one already.`,
	distance: -1,
	cron: '* * * * *',

	notifications: [{
		mark: 0,
		msg: 'Angler Nayla: The Fishing Tournament begins in 15 minutes.'
	}, {
		mark: 30,//1543,
		msg: 'Angler Nayla: The Fishing Tournament begins in 5 minutes.'
	}, {
		mark: 35,//2229,
		msg: 'Angler Nayla: The Fishing Tournament begins in 1 minute.'
	}, {
		mark: 40,//2400,
		msg: 'Angler Nayla: The Fishing Tournament has begun!'
	}, {
		mark: 45,//2410,
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
							var fishies = obj.inventory.items.find(i => (i.name == 'Ancient Carp'));
							return true;//!!fishies;
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
						var inventory = obj.inventory;

						var fishies = inventory.items.find(i => (i.name == 'Ancient Carp'));
						inventory.destroyItem(fishies.id);
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