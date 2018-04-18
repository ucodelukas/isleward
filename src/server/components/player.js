define([
	'world/atlas',
	'config/classes',
	'config/roles',
	'config/serverConfig'
], function (
	atlas,
	classes,
	roles,
	serverConfig
) {
	return {
		type: 'player',

		seen: [],
		cdSave: 1000,
		cdSaveMax: 1000,

		update: function () {
			if (this.cdSave > 0)
				this.cdSave--;
			else {
				this.cdSave = this.cdSaveMax;
				this.obj.auth.doSave();
			}
		},

		spawn: function (character, cb) {
			var obj = this.obj;

			if (character.dead)
				obj.dead = true;

			extend(true, obj, {
				layerName: 'mobs',
				cell: character.cell,
				sheetName: character.sheetName,
				skinId: character.skinId,
				name: character.name,
				class: character.class,
				zoneName: character.zoneName || serverConfig.defaultZone,
				x: character.x,
				y: character.y,
				hidden: character.dead,
				account: character.account,
				instanceId: character.instanceId
			});

			character.components = character.components || [];

			roles.onBeforePlayerEnterGame(obj, character);

			var blueprintStats = character.components.find(c => c.type == 'stats') || {};
			extend(true, blueprintStats, classes.stats[obj.class]);
			blueprintStats.values.hpMax = (blueprintStats.values.level || 1) * 32.7;
			if (!blueprintStats.values.hp)
				blueprintStats.values.hp = blueprintStats.values.hpMax;
			var stats = obj.addComponent('stats');
			for (var s in blueprintStats.values) {
				stats.values[s] = blueprintStats.values[s];
			}
			for (var s in blueprintStats.stats) {
				stats.stats[s] = blueprintStats.stats[s];
			}
			stats.vitScale = blueprintStats.vitScale;

			var gainStats = classes.stats[character.class].gainStats;
			for (var s in gainStats) {
				stats.values[s] += (gainStats[s] * stats.values.level);
			}

			obj.portrait = classes.portraits[character.class];

			obj.addComponent('spellbook');

			obj.addComponent('dialogue');
			obj.addComponent('trade', character.components.find(c => c.type == 'trade'));
			obj.addComponent('reputation', character.components.find(c => c.type == 'reputation'));

			var social = character.components.find(c => c.type == 'social');
			if (social)
				delete social.party;
			obj.addComponent('social', social);
			obj.social.init();
			obj.social.party = null;
			obj.addComponent('aggro', {
				faction: 'players'
			});
			obj.addComponent('gatherer');
			obj.addComponent('stash', {
				items: character.stash
			});

			var blueprintEffects = character.components.find(c => c.type == 'effects') || {};
			if (blueprintEffects.effects) {
				//Calculate ttl of effects
				var time = +new Date;
				blueprintEffects.effects = blueprintEffects.effects.filter(function (e) {
					var remaining = e.expire - time;
					if (remaining < 0)
						return false;
					else {
						e.ttl = Math.max(~~(remaining / 350), 1);
						return true;
					}
				});
			}
			obj.addComponent('effects', blueprintEffects);

			var prophecies = character.components.find(c => c.type == 'prophecies');
			if (prophecies)
				obj.addComponent('prophecies', prophecies);

			obj.addComponent('equipment', character.components.find(c => c.type == 'equipment'));
			obj.addComponent('inventory', character.components.find(c => c.type == 'inventory'));
			obj.addComponent('quests', character.components.find(c => c.type == 'quests'));
			obj.addComponent('events', character.components.find(c => c.type == 'events'));

			obj.xp = stats.values.xp;
			obj.level = stats.values.level;

			stats.stats.logins++;

			atlas.addObject(this.obj, true);

			io.sockets.emit('events', {
				onGetMessages: [{
					messages: [{
						class: 'color-blueB',
						message: this.obj.name + ' has come online'
					}]
				}],
				onGetConnectedPlayer: [cons.getCharacterList()]
			});

			cb();
		},

		broadcastSelf: function () {
			var obj = this.obj;

			var self = {
				id: obj.id,
				zone: obj.zone,
				name: obj.name,
				level: obj.level,
				class: obj.class
			};

			io.sockets.emit('events', {
				onGetConnectedPlayer: [self]
			});
		},

		hasSeen: function (id) {
			return (this.seen.indexOf(id) > -1);
		},
		see: function (id) {
			this.seen.push(id);
		},
		unsee: function (id) {
			this.seen.spliceWhere(s => s == id);
		},

		die: function (source, permadeath) {
			this.obj.clearQueue();

			var physics = this.obj.instance.physics;

			physics.removeObject(this.obj, this.obj.x, this.obj.y);
			this.obj.dead = true;

			this.obj.aggro.die();

			if (!permadeath) {
				var level = this.obj.stats.values.level;
				var spawns = this.obj.spawn;
				var spawnPos = spawns.filter(s => (((s.maxLevel) && (s.maxLevel >= level)) || (!s.maxLevel)));
				if ((spawnPos.length == 0) || (!source.name))
					spawnPos = spawns[0];
				else if (source.name) {
					var sourceSpawnPos = spawnPos.find(s => ((s.source) && (s.source.toLowerCase() == source.name.toLowerCase())));
					if (sourceSpawnPos)
						spawnPos = sourceSpawnPos;
					else
						spawnPos = spawnPos[0];
				}

				this.obj.x = spawnPos.x;
				this.obj.y = spawnPos.y;

				this.obj.stats.die(source);

				process.send({
					method: 'object',
					serverId: this.obj.serverId,
					obj: {
						dead: true
					}
				});
			} else {
				process.send({
					method: 'object',
					serverId: this.obj.serverId,
					obj: {
						dead: true,
						permadead: true
					}
				});
			}

			this.obj.fireEvent('onAfterDeath', source);

			this.obj.spellbook.die();
			this.obj.effects.die();
		},

		respawn: function () {
			var syncer = this.obj.syncer;
			syncer.o.x = this.obj.x;
			syncer.o.y = this.obj.y;

			this.obj.aggro.move();

			this.obj.instance.physics.addObject(this.obj, this.obj.x, this.obj.y);
		},

		move: function (msg) {
			atlas.queueAction(this.obj, {
				action: 'move',
				data: msg.data
			});
		},
		moveList: function (msg) {
			atlas.queueAction(this.obj, {
				action: 'move',
				list: true,
				data: msg.data
			});
		},
		queueAction: function (msg) {
			atlas.queueAction(this.obj, msg.data);
		},
		performAction: function (msg) {
			if (msg.callback)
				msg.data.data.callbackId = atlas.registerCallback(msg.callback);

			atlas.performAction(this.obj, msg.data);
		}
	};
});
