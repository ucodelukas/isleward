const { mobs: { rat: { level, faction, grantRep, regular: { drops } } } } = require('../zone');
const rewardGenerator = require('../../../../misc/rewardGenerator');

const rewardConfig = {
	regularKill: [{
		name: 'Iron Bar',
		sprite: [0, 0],
		quality: 0,
		quantity: 5,
		chance: 10
	}, {
		name: 'Cloth Scrap',
		sprite: [0, 1],
		quality: 0,
		quantity: 5,
		chance: 10
	}, {
		name: 'Leather Scrap',
		sprite: [0, 7],
		quality: 0,
		quantity: 5,
		chance: 10
	}, {
		name: 'Muddy Runestone',
		material: true,
		quality: 0,
		sprite: [6, 0],
		spritesheet: 'images/materials.png',
		chance: 1
	}, {
		name: 'Epic Essence',
		material: true,
		sprite: [0, 5],
		quality: 3,
		chance: 1
	}, {
		name: 'Rat Claw',
		material: true,
		sprite: [3, 0],
		spritesheet: 'images/materials.png',
		chance: 3
	}]
};

const descriptionStrings = {
	leadup: 'A bandit alchemist has been spotted in the sewer tunnels.',
	active: 'Rats are swarming towards the city.',
	success: 'Success: The rat invasion has been averted.',
	failure: 'Failure: The rats have made it to the city.',
	escapeCounter: 'Escapees: $ratEscapees$'
};

const config = {
	cron: '0 */3 * * *',
	//cron: '* * * * *',
	idFirstSpawnPhase: 6,
	idFailPhase: 19,
	maxEscapees: 5,
	repeats: [5, 5, 3],
	//repeats: [1, 1, 1],
	rewardItemsPerKill: 3
};

const ratTargetPos = {
	x: 97,
	y: 87
};

const rat = {
	name: 'Bloodthirsty Rat',
	cell: 24,
	level,
	faction,
	grantRep,
	drops,
	hpMult: 3,
	pos: {
		x: 61,
		y: 62
	},
	originX: ratTargetPos.x,
	originY: ratTargetPos.y,
	maxChaseDistance: 1000,
	spells: [{
		type: 'smokeBomb',
		radius: 1,
		duration: 20,
		range: 2,
		selfCast: 1,
		statMult: 1,
		damage: 0.125,
		element: 'poison',
		cdMax: 5,
		particles: {
			scale: {
				start: {
					min: 10,
					max: 25
				},
				end: {
					min: 10,
					max: 0
				}
			},
			opacity: {
				start: 0.3,
				end: 0
			},
			lifetime: {
				min: 1,
				max: 2
			},
			speed: {
				start: 3,
				end: 0
			},
			color: {
				start: ['db5538', '4ac441'],
				end: ['953f36', '386646']
			},
			chance: 0.125,
			randomColor: true,
			randomScale: true,
			blendMode: 'screen',
			spawnType: 'rect',
			spawnRect: {
				x: -10,
				y: -10,
				w: 20,
				h: 20
			}
		}
	}],
	events: {
		afterMove: function () {
			const { obj: { x, y } } = this;
			if (x !== ratTargetPos.x || y !== ratTargetPos.y)
				return;

			const eventManager = this.obj.instance.events;
			const eventName = this.obj.event.config.name;

			eventManager.incrementEventVariable(eventName, 'ratEscapees', 1);

			const { active, escapeCounter } = descriptionStrings;
			const newDesc = `${active}<br /><br />${escapeCounter}`;

			eventManager.setEventDescription(eventName, newDesc);

			this.obj.destroyed = true;

			const totalEscapees = this.obj.event.variables.ratEscapees;
			if (totalEscapees >= config.maxEscapees) {
				const event = this.obj.event;
				event.currentPhase.end = true;
				event.nextPhase = config.idFailPhase;
			}
		},

		afterDeath: function ({ source: { name } }) {
			const eventManager = this.obj.instance.events;
			const eventName = this.obj.event.config.name;

			const itemCount = config.rewardItemsPerKill;
			const rewards = rewardGenerator(itemCount, rewardConfig.regularKill);

			eventManager.addParticipantRewards(eventName, name, rewards);
		}
	}
};

module.exports = {
	name: 'Plague of Rats',
	description: descriptionStrings.leadup,
	distance: -1,
	cron: config.cron,

	phases: [{
		type: 'spawnMob',
		auto: true,
		mobs: [{
			id: 'banditAlchemist',
			name: 'Bandit Alchemist',
			attackable: false,
			hpMult: 1,
			cell: 79,
			level: 15,
			pos: {
				x: 117,
				y: 62
			}
		}]
	}, {
		type: 'moveMob',
		id: 'banditAlchemist',
		pos: {
			x: 64,
			y: 63
		}
	}, {
		type: 'eventChain',
		config: [{
			type: 'mobTalk',
			id: 'banditAlchemist',
			text: 'I think I cracked it! The serum should finally be complete.',
			delay: 15
		}, {
			type: 'mobTalk',
			id: 'banditAlchemist',
			text: 'One taste of this and the rats\' hunger for blood will be instatiable.',
			delay: 15
		}, {
			type: 'mobTalk',
			id: 'banditAlchemist',
			text: '*pours a bubbling liquid into a rat nest*',
			delay: 15
		}, {
			type: 'mobTalk',
			id: 'banditAlchemist',
			text: 'Let\'s see how Fjolgard handles a rat infestation of the bloodthirsty variety.',
			delay: 15
		}, {
			type: 'mobTalk',
			id: 'banditAlchemist',
			text: '*laughs*',
			delay: 15
		}]
	}, {
		type: 'moveMob',
		id: 'banditAlchemist',
		pos: {
			x: 117,
			y: 63
		},
		auto: true
	}, {
		type: 'despawnMob',
		id: 'banditAlchemist'
	}, {
		type: 'setDescription',
		desc: descriptionStrings.active
	}, {
		type: 'spawnMob',
		mobs: [rat],
		auto: true
	}, {
		type: 'wait',
		ttl: 15
	}, {
		type: 'goto',
		gotoPhaseIndex: config.idFirstSpawnPhase,
		repeats: config.repeats[0]
	}, {
		type: 'spawnMob',
		mobs: [rat],
		auto: true
	}, {
		type: 'wait',
		ttl: 7
	}, {
		type: 'goto',
		gotoPhaseIndex: config.idFirstSpawnPhase + 3,
		repeats: config.repeats[1]
	}, {
		type: 'spawnMob',
		mobs: [rat],
		auto: true
	}, {
		type: 'wait',
		ttl: 3
	}, {
		type: 'goto',
		gotoPhaseIndex: config.idFirstSpawnPhase + 6,
		repeats: config.repeats[2]
	}, {
		type: 'killAllMobs'
	}, {
		type: 'setDescription',
		desc: descriptionStrings.success,
		ttl: 50
	}, {
		type: 'giveRewards'
	}, {
		type: 'end'
	}, {
		type: 'setDescription',
		desc: descriptionStrings.failure,
		ttl: 50
	}]
};
