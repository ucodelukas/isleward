define([
	'../config/eventPhases/phaseTemplate',
	'fs',
	'misc/mail'
], function(
	phaseTemplate,
	fs,
	mail
) {
	return {
		configs: [],
		nextId: 0,

		init: function(instance) {
			this.instance = instance;

			var path = 'config/maps/' + this.instance.map.name + '/events';
			if (!fs.existsSync(path))
				return;

			var files = fs.readdirSync(path);
			files.forEach(function(f) {
				var e = require('../' + path + '/' + f);
				if (!e.disabled) 
					this.configs.push(extend(true, {}, e));
			}, this);
		},

		getEvent: function(name) {
			return this.configs.find(c => (c.name == name));
		},
		setEventDescription: function(name, desc) {
			var config = this.getEvent(name);
			var event = config.event;
			if (!event)
				return;

			if (!config.oldDescription)
				config.oldDescription = config.description;

			config.description = desc;

			event.participators.forEach(p => p.events.syncList());
		},
		setEventRewards: function(name, rewards) {
			var config = this.getEvent(name);
			var event = config.event;
			if (!event)
				return;

			event.rewards = rewards;
			event.age = event.config.duration - 2;
		},
		setWinText: function(name, text) {
			var config = this.getEvent(name);
			var event = config.event;
			if (!event)
				return;

			event.winText = text;
		},

		update: function() {
			var configs = this.configs;
			if (!configs)
				return;

			var scheduler = this.instance.scheduler;

			var cLen = configs.length;
			for (var i = 0; i < cLen; i++) {
				var c = configs[i];

				if (c.event) {
					this.updateEvent(c.event);
					if (c.event.done)
						this.stopEvent(c);
					continue;
				} else if ((c.ttl) && (c.ttl > 0)) {
					c.ttl--;
					continue;
				} else if ((c.cron) && (!scheduler.shouldRun(c)))
					continue;

				c.event = this.startEvent(c);
			}
		},

		startEvent: function(config) {
			if (config.oldDescription)
				config.description = config.oldDescription;

			var event = {
				id: this.nextId++,
				config: config,
				phases: [],
				participators: [],
				objects: [],
				nextPhase: 0,
				age: 0
			};

			return event;
		},

		giveRewards: function(config) {
			var event = config.event;	

			config.event.participators.forEach(function(p) {
				var rList = [{
					nameLike: 'Ancient Carp',
					removeAll: true
				}];

				var rewards = event.rewards;
				if ((rewards) && (rewards[p.name])) {
					rewards[p.name].forEach(r => rList.push(r));
				}

				mail.sendMail(p.name, rList);
			}, this);
		},

		stopEvent: function(config) {
			var event = config.event;

			config.event.participators.forEach(function(p) {
				p.events.unregisterEvent(event);
			}, this);

			config.event.objects.forEach(function(o) {
				o.destroyed = true;

				this.instance.syncer.queue('onGetObject', {
					x: o.x,
					y: o.y,
					components: [{
						type: 'attackAnimation',
						row: 0,
						col: 4
					}]
				});
			}, this);

			if (event.winText) {
				this.instance.syncer.queue('onGetMessages', {
					messages: {
						class: 'q4',
						message: event.winText
					}
				});
			}

			event.phases.forEach(function(p) {
				if ((p.destroy) && (!p.destroyed)) {
					p.destroyed = true;
					p.destroy();
				}
			});

			delete config.event;
		},

		updateEvent: function(event) {
			var objects = event.objects;
			var oLen = objects.length;
			for (var i = 0; i < oLen; i++) {
				if (objects[i].destroyed) {
					objects.splice(i, 1);
					i--;
					oLen--;
				}
			}

			var currentPhases = event.phases;
			var cLen = currentPhases.length;
			var stillBusy = false;
			for (var i = 0; i < cLen; i++) {
				var phase = currentPhases[i];
				if ((phase.end) || (phase.endMark == event.age)) {
					if ((phase.destroy) && (!phase.destroyed)) {
						phase.destroyed = true;
						phase.destroy();
					}
					continue;
				}
				else {
					if (!phase.auto)
						stillBusy = true;
					phase.update();
				}
			}

			if (event.config.notifications) {
				var n = event.config.notifications.find(f => (f.mark == event.age));
				if (n) {
					this.instance.syncer.queue('onGetMessages', {
						messages: {
							class: 'q4',
							message: n.msg
						}
					});
				}
			}

			event.age++;

			if (event.age == event.config.duration)
				event.done = true;
			else if ((event.config.prizeTime) && (event.age == event.config.prizeTime))
				this.giveRewards(event.config);

			if (stillBusy)
				return;

			var config = event.config;

			var phases = config.phases;
			var pLen = phases.length;
			for (var i = event.nextPhase; i < pLen; i++) {
				var p = phases[i];

				var phaseFile = 'phase' + p.type[0].toUpperCase() + p.type.substr(1);
				var typeTemplate = require('config/eventPhases/' + phaseFile);
				var phase = extend(true, {
					instance: this.instance,
					event: event
				}, phaseTemplate, typeTemplate, p);

				event.phases.push(phase);

				phase.init();

				event.nextPhase = i + 1;

				if (!p.auto)
					break;
			}

			var oList = this.instance.objects.objects;
			var oLen = oList.length;
			for (var i = 0; i < oLen; i++) {
				var o = oList[i];
				if (!o.player)
					continue;

				o.events.events.afterMove.call(o.events);
			}
		},

		getCloseEvents: function(obj) {
			var x = obj.x;
			var y = obj.y;

			var configs = this.configs;
			if (!configs)
				return;

			var cLen = configs.length;
			var result = [];
			for (var i = 0; i < cLen; i++) {
				var event = configs[i].event;
				if (!event)
					continue;
				else if (event.participators.some(p => (p == obj)))
					continue;

				var distance = event.config.distance;

				var objects = event.objects;
				var oLen = objects.length;
				for (var j = 0; j < oLen; j++) {
					var o = objects[j];

					if (
						(distance == -1) ||
						(!distance) ||
						(
							(Math.abs(x - o.x) < distance) &&
							(Math.abs(y - o.y) < distance)
						)
					) {
						event.participators.push(obj);
						result.push(event);
						break;
					}
				}
			}

			return result;
		}
	};
});