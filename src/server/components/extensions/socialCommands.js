define([
	'config/roles',
	'world/atlas',
	'items/generator',
	'misc/random',
	'items/config/slots',
	'security/io'
], function(
	roles,
	atlas,
	generator,
	random,
	configSlots,
	io
) {
	var commandRoles = {
		join: 0,
		leave: 0,
		getItem: 10,
		getGold: 10,
		setLevel: 10,
		godMode: 10
	};

	var localCommands = [
		'join',
		'leave'
	];

	return {
		roleLevel: null,

		init: function(blueprint) {
			this.roleLevel = roles.getRoleLevel(this.obj);
		},

		onBeforeChat: function(msg) {
			var messageText = msg.message;
			if (messageText[0] != '/')
				return;

			messageText = messageText.substr(1).split(' ');
			var actionName = messageText.splice(0, 1)[0].toLowerCase();
			actionName = Object.keys(this).find(a => (a.toLowerCase() == actionName));
			if (!actionName)
				return;
			else if (this.roleLevel < commandRoles[actionName])
				return;

			msg.ignore = true;

			var config = {};
			if ((messageText.length == 1) && (messageText[0].indexOf('=') == -1))
				config = messageText[0];
			else {
				messageText.forEach(function(m) {
					m = m.split('=');
					config[m[0]] = m[1];
				});
			}

			if (localCommands.indexOf(actionName) > -1) {
				this[actionName].call(this, config);
			} else {
				atlas.performAction(this.obj, {
					cpn: 'social',
					method: actionName,
					data: config
				});
			}
		},

		//actions
		join: function(value) {
			var obj = this.obj;

			var channels = obj.auth.customChannels;
			if (!channels.some(c => (c == value)))
				channels.push(value);
			else
				return;

			channels.push(value);

			var charname = obj.auth.charname;
			io.set({
				ent: charname,
				field: 'customChannels',
				value: JSON.stringify(channels)
			});

			obj.socket.emit('events', {
				onGetMessages: [{
					messages: [{
						class: 'q0',
						message: 'joined channel: ' + value,
						type: 'info'
					}]
				}]
			});

			obj.socket.emit('event', {
				event: 'onJoinChannel',
				data: value
			});
		},

		leave: function(value) {
			var obj = this.obj;

			var channels = obj.auth.customChannels;
			if (!channels.some(c => (c == value))) {
				obj.socket.emit('events', {
					onGetMessages: [{
						messages: [{
							class: 'q0',
							message: 'you are not currently in that channel',
							type: 'info'
						}]
					}]
				});

				return;
			}

			var channels = obj.auth.customChannels;
			channels.spliceWhere(c => (c == value));

			var charname = obj.auth.charname;
			io.set({
				ent: charname,
				field: 'customChannels',
				value: JSON.stringify(channels)
			});

			this.obj.socket.emit('events', {
				onGetMessages: [{
					messages: [{
						class: 'q0',
						message: 'left channel: ' + value,
						type: 'info'
					}]
				}]
			});
		},

		getItem: function(config) {
			if (config.slot == 'set') {
				configSlots.slots.forEach(function(s) {
					if (s == 'tool')
						return;

					var newConfig = extend(true, {}, config, {
						slot: s
					});

					this.getItem(newConfig);
				}, this);

				return;
			}

			if (config.stats)
				config.stats = config.stats.split(',');

			if (config.name)
				config.name = config.name.split('_').join(' ');

			if (config.type)
				config.type = config.type.split('_').join(' ');

			if (config.sprite)
				config.sprite = config.sprite.split('_');

			var factions = (config.factions || '').split(',');
			delete config.factions;

			var safe = config.safe;
			delete config.safe;

			var item = generator.generate(config);

			if (safe) {
				item.noDrop = true;
				item.noDestroy = true;
				item.noSalvage = true;
			}

			factions.forEach(function(f) {
				if (f == '')
					return;

				var faction = require('./config/factions/' + f);
				faction.uniqueStat.generate(item);

				item.factions = [];
				item.factions.push({
					id: f,
					tier: 3
				});
			});

			this.obj.inventory.getItem(item);
		},

		getGold: function(amount) {
			this.obj.trade.gold += ~~amount;
			this.obj.syncer.set(true, 'trade', 'gold', this.obj.trade.gold);
		},

		setLevel: function(level) {
			var obj = this.obj;
			var syncer = obj.syncer;

			level = Math.max(1, ~~level);

			var stats = obj.stats;
			var values = stats.values;
			var oldLevel = values.level;

			values.level = level;

			var delta = level - oldLevel;

			values.hpMax += (40 * delta);

			syncer.setObject(true, 'stats', 'values', 'level', level);
			syncer.setObject(true, 'stats', 'values', 'hpMax', values.hpMax);

			process.send({
				method: 'object',
				serverId: obj.serverId,
				obj: {
					level: level
				}
			});

			stats.calcXpMax();
		},

		godMode: function() {
			var obj = this.obj;

			var statValues = obj.stats.values;
			var newValues = {
				int: 10000000,
				str: 10000000,
				dex: 10000000,
				hpMax: 10000000,
				hp: 10000000,
				manaMax: 10000000,
				mana: 10000000
			};

			var syncer = obj.syncer;

			for (var s in newValues) {
				var newValue = newValues[s];
				statValues[s] = newValue;

				syncer.setObject(true, 'stats', 'values', s, newValue);
			}

			obj.spellbook.calcDps();
		},

		//custom channels
		isInChannel: function(character, channel) {
			return character.auth.customChannels.some(c => (c == channel));
		}
	};
});