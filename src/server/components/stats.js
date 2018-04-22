define([
	'config/animations',
	'config/classes',
	'misc/scheduler'
], function (
	animations,
	classes,
	scheduler
) {
	var baseStats = {
		mana: 20,
		manaMax: 20,

		manaReservePercent: 0,

		hp: 5,
		hpMax: 5,
		xpTotal: 0,
		xp: 0,
		xpMax: 0,
		level: 1,
		str: 0,
		int: 0,
		dex: 0,
		magicFind: 0,
		itemQuantity: 0,
		regenHp: 0,
		regenMana: 5,
		addCritChance: 0,
		addCritMultiplier: 0,
		addAttackCritChance: 0,
		addAttackCritMultiplier: 0,
		addSpellCritChance: 0,
		addSpellCritMultiplier: 0,
		critChance: 5,
		critMultiplier: 150,
		attackCritChance: 0,
		attackCritMultiplier: 0,
		spellCritChance: 0,
		spellCritMultiplier: 0,
		armor: 0,
		dmgPercent: 0,
		vit: 0,

		blockAttackChance: 0,
		blockSpellChance: 0,
		dodgeAttackChance: 0,
		dodgeSpellChance: 0,

		attackSpeed: 0,
		castSpeed: 0,

		elementArcanePercent: 0,
		elementFrostPercent: 0,
		elementFirePercent: 0,
		elementHolyPercent: 0,
		elementPoisonPercent: 0,

		elementArcaneResist: 0,
		elementFrostResist: 0,
		elementFireResist: 0,
		elementHolyResist: 0,
		elementPoisonResist: 0,

		elementAllResist: 0,

		sprintChance: 0,

		xpIncrease: 0,

		//Fishing stats
		catchChance: 0,
		catchSpeed: 0,
		fishRarity: 0,
		fishWeight: 0,
		fishItems: 0
	};

	return {
		type: 'stats',

		values: baseStats,
		originalValues: null,

		vitScale: 10,

		syncer: null,

		stats: {
			logins: 0,
			played: 0,
			lastLogin: null,
			loginStreak: 0,
			mobKillStreaks: {},
			lootStats: {}
		},

		dead: false,

		init: function (blueprint, isTransfer) {
			this.syncer = this.obj.instance.syncer;

			var values = (blueprint || {}).values || {};
			for (var v in values) {
				this.values[v] = values[v];
			}

			var stats = (blueprint || {}).stats || {};
			for (var v in stats) {
				this.stats[v] = stats[v];
			}

			this.calcXpMax();

			if (blueprint)
				delete blueprint.stats;
		},

		resetHp: function () {
			var values = this.values;
			values.hp = values.hpMax;

			this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
		},

		update: function () {
			if (((this.obj.mob) && (!this.obj.follower)) || (this.obj.dead))
				return;

			var values = this.values;

			var manaMax = values.manaMax;
			manaMax -= (manaMax * values.manaReservePercent);

			var regen = {
				success: true
			};
			this.obj.fireEvent('beforeRegen', regen);
			if (!regen.success)
				return;

			var isInCombat = (this.obj.aggro.list.length > 0);
			if (this.obj.follower) {
				isInCombat = (this.obj.follower.master.aggro.list.length > 0);
				if (isInCombat)
					return;
			}

			var regenHp = 0;
			var regenMana = 0;

			regenMana = values.regenMana / 50;

			if (!isInCombat)
				regenHp = Math.max(values.hpMax / 112, values.regenHp * 0.2);
			else
				regenHp = values.regenHp * 0.2;

			if (values.hp < values.hpMax) {
				values.hp += regenHp;
				this.obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
			}

			if (values.hp > values.hpMax) {
				values.hp = values.hpMax;
				this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
			}

			if (values.mana < manaMax) {
				values.mana += regenMana;
				//Show others what mana is?
				var onlySelf = true;
				if (this.obj.player)
					onlySelf = false;
				this.obj.syncer.setObject(onlySelf, 'stats', 'values', 'mana', values.mana);
			}

			if (values.mana > manaMax) {
				values.mana = manaMax;
				if (this.obj.player)
					onlySelf = false;
				this.obj.syncer.setObject(onlySelf, 'stats', 'values', 'mana', values.mana);
			}
		},

		addStat: function (stat, value) {
			if (['lvlRequire', 'allAttributes'].indexOf(stat) == -1)
				this.values[stat] += value;

			var sendOnlyToSelf = (['hp', 'hpMax', 'mana', 'manaMax', 'vit'].indexOf(stat) == -1);

			this.obj.syncer.setObject(sendOnlyToSelf, 'stats', 'values', stat, this.values[stat]);

			if (['addCritChance', 'addAttackCritChance', 'addSpellCritChance'].indexOf(stat) > -1) {
				var morphStat = stat.substr(3);
				morphStat = morphStat[0].toLowerCase() + morphStat.substr(1);
				this.addStat(morphStat, (0.05 * value));
			} else if (['addCritMultiplier', 'addAttackCritMultiplier', 'addSpellCritMultiplier'].indexOf(stat) > -1) {
				var morphStat = stat.substr(3);
				morphStat = morphStat[0].toLowerCase() + morphStat.substr(1);
				this.addStat(morphStat, value);
			} else if (stat == 'vit') {
				this.values.hpMax += (value * this.vitScale);
				this.obj.syncer.setObject(true, 'stats', 'values', 'hpMax', this.values.hpMax);
				this.obj.syncer.setObject(false, 'stats', 'values', 'hpMax', this.values.hpMax);
			} else if (stat == 'allAttributes') {
				['int', 'str', 'dex'].forEach(function (s) {
					this.values[s] += value;
					this.obj.syncer.setObject(true, 'stats', 'values', s, this.values[s]);
				}, this);
			} else if (stat == 'elementAllResist') {
				['arcane', 'frost', 'fire', 'holy', 'poison'].forEach(function (s) {
					var element = 'element' + (s[0].toUpperCase() + s.substr(1)) + 'Resist';

					this.values[element] += value;
					this.obj.syncer.setObject(true, 'stats', 'values', element, this.values[element]);
				}, this);
			}
		},

		calcXpMax: function () {
			var level = (this.originalValues || this.values).level;
			this.values.xpMax = (level * 5) + ~~(level * 10 * Math.pow(level, 2.2));

			this.obj.syncer.setObject(true, 'stats', 'values', 'xpMax', this.values.xpMax);
		},

		//Source is the object that caused you to gain xp (mostly yourself)
		//Target is the source of the xp (a mob or quest)
		getXp: function (amount, source, target) {
			var obj = this.obj;
			var values = this.values;

			if ((this.originalValues || this.values).level == 20)
				return;

			var xpEvent = {
				source: source,
				target: target,
				amount: amount
			};

			this.obj.fireEvent('beforeGetXp', xpEvent);
			if (xpEvent.amount == 0)
				return;

			amount = ~~(xpEvent.amount * (1 + (values.xpIncrease / 100)));

			values.xpTotal = ~~(values.xpTotal + amount);
			values.xp = ~~(values.xp + amount);

			this.obj.syncer.setObject(true, 'stats', 'values', 'xp', values.xp);

			this.syncer.queue('onGetDamage', {
				id: obj.id,
				event: true,
				text: '+' + amount + ' xp'
			});

			var syncO = {};
			var didLevelUp = false;

			while (values.xp >= values.xpMax) {
				didLevelUp = true;
				values.xp -= values.xpMax;
				this.obj.syncer.setObject(true, 'stats', 'values', 'xp', values.xp);
				if (this.originalValues) {
					this.originalValues.level++;
				}

				if (values.originalLevel)
					values.originalLevel++;
				values.level++;

				if ((this.originalValues || this.values).level == 20)
					values.xp = 0;

				values.hpMax = values.level * 32.7;

				var gainStats = classes.stats[this.obj.class].gainStats;
				for (var s in gainStats) {
					values[s] += gainStats[s];
					this.obj.syncer.setObject(true, 'stats', 'values', s, values[s]);
				}

				this.obj.spellbook.calcDps();

				this.syncer.queue('onGetDamage', {
					id: obj.id,
					event: true,
					text: 'level up'
				});

				syncO.level = (this.originalValues || this.values).level;

				this.calcXpMax();
			}

			if (didLevelUp) {
				var cellContents = obj.instance.physics.getCell(obj.x, obj.y);
				cellContents.forEach(function (c) {
					c.fireEvent('onCellPlayerLevelUp', obj);
				});

				obj.auth.doSave();
			}

			process.send({
				method: 'object',
				serverId: this.obj.serverId,
				obj: syncO
			});

			if (didLevelUp) {
				var maxLevel = this.obj.instance.zone.level[1]
				if (maxLevel < (this.originalValues || values).level) {
					this.rescale(maxLevel, false);
				} else {
					this.obj.syncer.setObject(true, 'stats', 'values', 'hpMax', values.hpMax);
					this.obj.syncer.setObject(true, 'stats', 'values', 'level', this.values.level);
					this.obj.syncer.setObject(true, 'stats', 'values', 'originalLevel', this.values.originalLevel);
					this.obj.syncer.setObject(false, 'stats', 'values', 'hpMax', values.hpMax);
					this.obj.syncer.setObject(false, 'stats', 'values', 'level', this.values.level);
					this.obj.syncer.setObject(true, 'stats', 'values', 'originalLevel', this.values.originalLevel);
				}
			}

			var originalValues = this.originalValues;
			if (originalValues) {
				originalValues.xp = values.xp;
				originalValues.xpMax = values.xpMax;
				originalValues.xpTotal = values.xpTotal;
			}
		},

		kill: function (target) {
			if (target.player)
				return;

			var level = target.stats.values.level;
			var mobDiffMult = 1;
			if (target.isRare)
				mobDiffMult = 2;
			else if (target.isChampion)
				mobDiffMult = 5;

			//Who should get xp?
			var aggroList = target.aggro.list;
			var hpMax = target.stats.values.hpMax;
			var aLen = aggroList.length;
			for (var i = 0; i < aLen; i++) {
				var a = aggroList[i];
				var dmg = a.damage;
				if (dmg <= 0)
					continue;

				var mult = 1;
				//How many party members contributed
				// Remember, maybe one of the aggro-ees might be a mob too
				var party = a.obj.social ? a.obj.social.party : null;
				if (party) {
					var partySize = aggroList.filter(function (f) {
						return ((a.damage > 0) && (party.indexOf(f.obj.serverId) > -1));
					}).length;
					partySize--;
					mult = (1 + (partySize * 0.1));
				}

				if ((a.obj.stats) && (!a.obj.follower)) {
					//Scale xp by source level so you can't just farm low level mobs (or get boosted on high level mobs).
					//Mobs that are farther then 10 levels from you, give no xp
					//We don't currently do this for quests/herb gathering
					var sourceLevel = a.obj.stats.values.level;
					var levelDelta = level - sourceLevel;

					var amount = null;
					if (Math.abs(levelDelta) <= 10)
						amount = ~~(((sourceLevel + levelDelta) * 10) * Math.pow(1 - (Math.abs(levelDelta) / 10), 2) * mult * mobDiffMult);
					else
						amount = 0;

					a.obj.stats.getXp(amount, this.obj, target);
				}

				a.obj.fireEvent('afterKillMob', target);
			}
		},

		die: function (source) {
			var obj = this.obj;
			var values = this.values;

			this.syncer.queue('onGetDamage', {
				id: obj.id,
				event: true,
				text: 'death'
			});

			obj.syncer.set(true, null, 'dead', true);

			var obj = obj;
			var syncO = obj.syncer.o;

			obj.hidden = true;
			obj.nonSelectable = true;
			syncO.hidden = true;
			syncO.nonSelectable = true;

			var xpLoss = ~~Math.min(values.xp, values.xpMax / 10);

			values.xp -= xpLoss;
			obj.syncer.setObject(true, 'stats', 'values', 'xp', values.xp);

			this.syncer.queue('onDeath', {
				source: source.name,
				xpLoss: xpLoss
			}, [obj.serverId]);

			obj.instance.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			});
		},

		respawn: function () {
			this.obj.syncer.set(true, null, 'dead', false);

			var obj = this.obj;
			var syncO = obj.syncer.o;

			this.obj.dead = false;
			var values = this.values;

			values.hp = values.hpMax;
			values.mana = values.manaMax;

			obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
			obj.syncer.setObject(false, 'stats', 'values', 'mana', values.mana);

			obj.hidden = false;
			obj.nonSelectable = false;
			syncO.hidden = false;
			syncO.nonSelectable = false;

			process.send({
				method: 'object',
				serverId: this.obj.serverId,
				obj: {
					dead: false
				}
			});

			obj.instance.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			});

			this.obj.player.respawn();
		},

		takeDamage: function (damage, threatMult, source) {
			source.fireEvent('beforeDealDamage', damage, this.obj);
			this.obj.fireEvent('beforeTakeDamage', damage, source);

			//Maybe the attacker was stunned?
			if (damage.failed)
				return;

			//Maybe something else killed this mob already?
			if (this.obj.destroyed)
				return;

			var amount = damage.amount;

			if (amount > this.values.hp)
				amount = this.values.hp;

			damage.dealt = amount;

			this.values.hp -= amount;
			var recipients = [];
			if (this.obj.serverId != null)
				recipients.push(this.obj.serverId);
			if (source.serverId != null)
				recipients.push(source.serverId);
			if ((source.follower) && (source.follower.master.serverId))
				recipients.push(source.follower.master.serverId);
			if ((this.obj.follower) && (this.obj.follower.master.serverId))
				recipients.push(this.obj.follower.master.serverId);

			if (recipients.length > 0) {
				if ((!damage.blocked) && (!damage.dodged)) {
					this.syncer.queue('onGetDamage', {
						id: this.obj.id,
						source: source.id,
						crit: damage.crit,
						amount: amount
					}, recipients);
				} else {
					this.syncer.queue('onGetDamage', {
						id: this.obj.id,
						source: source.id,
						event: true,
						text: 'blocked'
					}, recipients);
				}
			}

			this.obj.aggro.tryEngage(source, amount, threatMult);

			var died = (this.values.hp <= 0);

			if (died) {
				var death = {
					success: true
				};
				this.obj.fireEvent('beforeDeath', death);

				if (death.success) {
					var deathEvent = {};

					var killSource = source;

					if (source.follower)
						killSource = source.follower.master;

					if (killSource.player)
						killSource.stats.kill(this.obj);

					this.obj.fireEvent('afterDeath', deathEvent);

					if (this.obj.player) {
						this.obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
						if (deathEvent.permadeath) {
							this.obj.auth.permadie();

							this.obj.instance.syncer.queue('onGetMessages', {
								messages: {
									class: 'color-redA',
									message: `(level ${this.values.level}) ${this.obj.name} has forever left the shores of the living.`
								}
							});

							this.syncer.queue('onPermadeath', {
								source: killSource.name
							}, [this.obj.serverId]);
						} else
							this.values.hp = 0;

						this.obj.player.die(killSource, deathEvent.permadeath);
					} else {
						this.obj.effects.die();
						if (this.obj.spellbook)
							this.obj.spellbook.die();
						this.obj.destroyed = true;

						var deathAnimation = _.getDeepProperty(animations, ['mobs', this.obj.sheetName, this.obj.cell, 'death']);
						if (deathAnimation) {
							this.obj.instance.syncer.queue('onGetObject', {
								x: this.obj.x,
								y: this.obj.y,
								components: [deathAnimation]
							});
						}

						if (this.obj.inventory) {
							var aggroList = this.obj.aggro.list;
							var aLen = aggroList.length;
							for (var i = 0; i < aLen; i++) {
								var a = aggroList[i];

								if ((!a.threat) || (a.obj.serverId == null))
									continue;

								this.obj.inventory.dropBag(a.obj.serverId, killSource);
							}
						}
					}
				}
			} else {
				source.aggro.tryEngage(this.obj, 0);
				this.obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
			}

			if (!damage.noEvents)
				source.fireEvent('afterDealDamage', damage, this.obj);
		},

		getHp: function (heal, source) {
			var amount = heal.amount;
			if (amount == 0)
				return;

			var threatMult = heal.threatMult;
			if (!heal.hasOwnProperty('threatMult'))
				threatMult = 1;

			var values = this.values;
			var hpMax = values.hpMax;

			if (values.hp >= hpMax)
				return;

			if (hpMax - values.hp < amount)
				amount = hpMax - values.hp;

			values.hp += amount;
			if (values.hp > hpMax)
				values.hp = hpMax;

			var recipients = [];
			if (this.obj.serverId != null)
				recipients.push(this.obj.serverId);
			if (source.serverId != null)
				recipients.push(source.serverId);
			if (recipients.length > 0) {
				this.syncer.queue('onGetDamage', {
					id: this.obj.id,
					source: source.id,
					heal: true,
					amount: amount,
					crit: heal.crit
				}, recipients);
			}

			//Add aggro to all our attackers
			var threat = amount * 0.4 * threatMult;
			var aggroList = this.obj.aggro.list;
			var aLen = aggroList.length;
			for (var i = 0; i < aLen; i++) {
				var a = aggroList[i].obj;
				a.aggro.tryEngage(source, threat);
			}

			this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
		},

		save: function () {
			if (this.sessionDuration) {
				this.stats.played = ~~(this.stats.played + this.sessionDuration);
				delete this.sessionDuration;
			}

			var values = extend(true, {}, this.originalValues || this.values);
			values.hp = this.values.hp;
			values.mana = this.values.mana;

			return {
				type: 'stats',
				values: values,
				stats: this.stats
			};
		},

		simplify: function (self) {
			var values = this.values;

			if (!self) {
				var result = {
					type: 'stats',
					values: {
						hp: values.hp,
						hpMax: values.hpMax,
						mana: values.mana,
						manaMax: values.manaMax,
						level: values.level
					}
				};

				return result
			}

			return {
				type: 'stats',
				values: values,
				stats: this.stats,
				vitScale: this.vitScale
			};
		},

		onLogin: function () {
			var stats = this.stats;
			var time = scheduler.getTime();
			stats.lastLogin = time;

			this.obj.instance.mail.getMail(this.obj.name);
		},

		rescale: function (level, isMob) {
			if (level > this.values.level)
				level = this.values.level;

			var sync = this.obj.syncer.setObject.bind(this.obj.syncer);

			var oldHp = this.values.hp;
			var oldXp = this.values.xp;
			var oldXpTotal = this.values.xpTotal;
			var oldXpMax = this.values.xpMax;

			if (!this.originalValues)
				this.originalValues = extend(true, {}, this.values);

			var oldValues = this.values;
			var newValues = extend(true, {}, baseStats);
			this.values = newValues;

			var gainStats = classes.stats[this.obj.class].gainStats;
			for (var s in gainStats) {
				newValues[s] += (gainStats[s] * level);
			}

			newValues.level = level;
			newValues.originalLevel = (this.originalValues || oldValues).level;
			newValues.hpMax = level * 32.7;
			if (isMob)
				newValues.hpMax = ~~(newValues.hpMax * (level / 10));

			newValues.hp = oldHp;
			var resetHp = false;
			if (newValues.hp > newValues.hpMax) {
				resetHp = true;
				newValues.hp = newValues.hpMax;
			}

			newValues.xp = oldXp;
			newValues.xpMax = oldXpMax;
			newValues.xpTotal = oldXpTotal;

			var addStats = this.obj.equipment.rescale(level);
			for (var p in addStats) {
				var statName = p;

				this.addStat(statName, addStats[p]);
			}

			if (resetHp)
				newValues.hp = newValues.hpMax;

			this.obj.spellbook.calcDps();

			var publicStats = [
				'hp',
				'hpMax',
				'mana',
				'manaMax',
				'level'
			];

			for (var p in newValues) {
				sync(true, 'stats', 'values', p, newValues[p]);
				if (publicStats.indexOf(p) > -1)
					sync(false, 'stats', 'values', p, newValues[p]);
			}
		},

		getKillStreakCoefficient: function (mobName) {
			var killStreak = this.stats.mobKillStreaks[mobName];
			if (!killStreak)
				return 1;
			else
				return Math.max(0, (10000 - Math.pow(killStreak, 2)) / 10000);
		},

		canGetMobLoot: function (mob) {
			if (!mob.inventory.dailyDrops)
				return true;

			var lootStats = this.stats.lootStats[mob.name];
			var time = scheduler.getTime();
			if (!lootStats) {
				this.stats.lootStats[mob.name] = time;
			} else
				return ((lootStats.day != time.day), (lootStats.month != time.month));
		},

		events: {
			transferComplete: function () {
				var maxLevel = this.obj.instance.zone.level[1];
				if (maxLevel > this.obj.stats.values.level)
					maxLevel = this.obj.stats.values.level;
				this.obj.stats.rescale(maxLevel);
			},

			afterKillMob: function (mob) {
				var mobKillStreaks = this.stats.mobKillStreaks;
				var mobName = mob.name;

				if (!mobKillStreaks[mobName])
					mobKillStreaks.mobName = 0;

				if (mobKillStreaks[mobName] < 100)
					mobKillStreaks[mobName]++;

				for (var p in mobKillStreaks) {
					if (p == mobName)
						continue;

					mobKillStreaks[p]--;
					if (mobKillStreaks[p] <= 0)
						delete mobKillStreaks[p];
				}
			},

			beforeGetXp: function (event) {
				if ((!event.target.mob) && (!event.target.player))
					return;

				event.amount *= this.getKillStreakCoefficient(event.target.name);
			},

			beforeGenerateLoot: function (event) {
				if (!event.source.mob)
					return;

				event.chanceMultiplier *= this.getKillStreakCoefficient(event.source.name);

				if ((event.chanceMultiplier > 0) && (!this.canGetMobLoot(event.source)))
					event.chanceMultiplier = 0;
			},

			afterMove: function (event) {
				var mobKillStreaks = this.stats.mobKillStreaks;

				for (var p in mobKillStreaks) {
					mobKillStreaks[p] -= 0.085;
					if (mobKillStreaks[p] <= 0)
						delete mobKillStreaks[p];
				}
			}
		}
	};
});
