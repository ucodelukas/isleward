let map = require('./map');
let syncer = require('./syncer');
let objects = require('../objects/objects');
let spawners = require('./spawners');
let physics = require('./physics');
let resourceSpawner = require('./resourceSpawner');
let spellCallbacks = require('../config/spells/spellCallbacks');
let questBuilder = require('../config/quests/questBuilder');
let randomMap = require('./randomMap');
let customMap = require('./customMap');
let events = require('../events/events');
let scheduler = require('../misc/scheduler');
let mail = require('../misc/mail');
let herbs = require('../config/herbs');
let eventEmitter = require('../misc/events');

module.exports = {
	instances: [],
	zoneId: -1,
	speed: 350,

	lastTime: 0,

	init: function (args) {
		this.zoneId = args.zoneId;

		spellCallbacks.init();
		herbs.init();
		map.init(args);

		if (!map.instanced) {
			let fakeInstance = {
				objects: objects,
				syncer: syncer,
				physics: physics,
				zoneId: this.zoneId,
				spawners: spawners,
				questBuilder: questBuilder,
				events: events,
				zone: map.zone,
				mail: mail,
				map: map,
				scheduler: scheduler,
				eventEmitter: eventEmitter,
				zone: map.zone
			};

			this.instances.push(fakeInstance);

			spawners.init(fakeInstance);
			scheduler.init();

			map.create();
			map.clientMap.zoneId = this.zoneId;

			[resourceSpawner, syncer, objects, questBuilder, events, mail].forEach(i => i.init(fakeInstance));

			this.addObject = this.nonInstanced.addObject.bind(this);
			this.onAddObject = this.nonInstanced.onAddObject.bind(this);
			this.updateObject = this.nonInstanced.updateObject.bind(this);
			this.queueAction = this.nonInstanced.queueAction.bind(this);
			this.performAction = this.nonInstanced.performAction.bind(this);
			this.removeObject = this.nonInstanced.removeObject.bind(this);
			this.onRemoveObject = this.nonInstanced.onRemoveObject.bind(this);

			this.tick = this.nonInstanced.tick.bind(this);
			this.tick();
		} else {
			spawners.init({
				zone: map.zone
			});

			map.create();
			map.clientMap.zoneId = this.zoneId;

			this.addObject = this.instanced.addObject.bind(this);
			this.onAddObject = this.instanced.onAddObject.bind(this);
			this.updateObject = this.instanced.updateObject.bind(this);
			this.queueAction = this.instanced.queueAction.bind(this);
			this.performAction = this.instanced.performAction.bind(this);
			this.removeObject = this.instanced.removeObject.bind(this);
			this.onRemoveObject = this.instanced.onRemoveObject.bind(this);

			if (map.mapFile.properties.isRandom)
				this.ttlGen = 0;

			this.tick = this.instanced.tick.bind(this);
			this.tick();
		}
	},

	nonInstanced: {
		tick: function () {
			events.update();
			objects.update();
			resourceSpawner.update();
			spawners.update();
			syncer.update();
			scheduler.update();

			setTimeout(this.tick.bind(this), this.speed);
		},

		addObject: function (msg) {
			let obj = msg.obj;
			obj.serverId = obj.id;
			delete obj.id;

			if ((msg.keepPos) && (!physics.isValid(obj.x, obj.y)))
				msg.keepPos = false;

			let spawnPos = map.getSpawnPos(obj);

			if ((!msg.keepPos) || (obj.x == null)) {
				obj.x = spawnPos.x;
				obj.y = spawnPos.y;
			}

			obj.spawn = map.spawn;

			syncer.queue('onGetMap', map.clientMap, [obj.serverId]);

			if (!msg.transfer)
				objects.addObject(obj, this.onAddObject.bind(this));
			else {
				let o = objects.transferObject(obj);
				questBuilder.obtain(o);
			}
		},
		onAddObject: function (obj) {
			if (obj.player)
				obj.stats.onLogin();

			questBuilder.obtain(obj);
			obj.fireEvent('afterMove');

			if (obj.dead) {
				obj.instance.syncer.queue('onDeath', {
					x: obj.x,
					y: obj.y
				}, [obj.serverId]);
			}
		},
		updateObject: function (msg) {
			let obj = objects.find(o => o.serverId == msg.id);
			if (!obj)
				return;

			let msgObj = msg.obj;

			let components = msgObj.components || [];
			delete msgObj.components;

			for (let p in msgObj) 
				obj[p] = msgObj[p];

			let cLen = components.length;
			for (let i = 0; i < cLen; i++) {
				let c = components[i];
				let component = obj[c.type];
				for (let p in c) 
					component[p] = c[p];
			}
		},

		queueAction: function (msg) {
			let obj = objects.find(o => o.serverId == msg.id);
			if (!obj)
				return;
			else if (msg.action.action == 'move') {
				let moveEntries = obj.actionQueue.filter(q => (q.action == 'move')).length;
				if (moveEntries >= 50)
					return;
			}

			obj.queue(msg.action);
		},

		performAction: function (msg) {
			let obj = null;
			let targetId = msg.action.targetId;
			if (!targetId)
				obj = objects.find(o => o.serverId == msg.id);
			else {
				obj = objects.find(o => o.id == targetId);
				if (obj) {
					let action = msg.action;
					if (!action.data)
						action.data = {};
					action.data.sourceId = msg.id;
				}
			}

			if (!obj)
				return;

			obj.performAction(msg.action);
		},

		removeObject: function (msg) {
			let obj = msg.obj;
			obj = objects.find(o => o.serverId == obj.id);
			if (!obj) {
				//We should probably never reach this
				return;
			}

			if (obj.auth)
				obj.auth.doSave();

			if (obj.player)
				obj.fireEvent('beforeRezone');

			obj.destroyed = true;
		},
		onRemoveObject: function (obj) {

		}
	},
	instanced: {
		tick: function () {
			if (map.mapFile.properties.isRandom) {
				if (this.ttlGen <= 0) {
					if (!map.oldMap)
						map.oldMap = map.clientMap.map;
					if (!map.oldCollisionMap)
						map.oldCollisionMap = map.collisionMap;

					spawners.reset();

					randomMap.generate({
						map: map,
						physics: physics,
						spawners: spawners
					});

					this.ttlGen = 2000;
				} else
					this.ttlGen--;
			}

			let instances = this.instances;
			let iLen = instances.length;
			for (let i = 0; i < iLen; i++) {
				let instance = instances[i];

				instance.objects.update();
				instance.spawners.update();
				instance.resourceSpawner.update();
				instance.scheduler.update();

				instance.syncer.update();

				if (instance.closeTtl != null) {
					let hasPlayers = instance.objects.objects.some(o => o.player);
					if (hasPlayers) {
						delete instance.closeTtl;
						continue;
					}

					instance.closeTtl--;
					if (instance.closeTtl <= 0) {
						instances.splice(i, 1);
						i--;
						iLen--;
					}
				} else {
					let isEmpty = !instance.objects.objects.some(o => o.player);
					if (isEmpty) {
						//Zones reset after being empty for 10 minutes
						instance.closeTtl = 2;
					}
				}
			}

			setTimeout(this.tick.bind(this), this.speed);
		},

		addObject: function (msg) {
			let obj = msg.obj;
			let instanceId = msg.instanceId;

			//Maybe a party member is in here already?
			let social = obj.components.find(c => c.type == 'social');
			if ((social) && (social.party)) {
				let party = social.party;
				let instances = this.instances;
				let iLen = instances.length;
				for (let i = 0; i < iLen; i++) {
					let instance = instances[i];

					let partyInside = instance.objects.objects.some(o => party.indexOf(o.serverId) > -1);
					if (partyInside) {
						if (instance.id != obj.instanceId)
							msg.keepPos = false;
						obj.instanceId = instance.id;
						obj.instance = instance;
						instanceId = instance.id;
						break;
					}
				}
			}

			if (msg.transfer)
				msg.keepPos = false;

			let exists = this.instances.find(i => i.id == instanceId);

			if (exists) {
				if ((msg.keepPos) && (!exists.physics.isValid(obj.x, obj.y)))
					msg.keepPos = false;
			}

			let spawnPos = map.getSpawnPos(obj);

			if (exists)
				spawnPos = exists.map.getSpawnPos(obj);

			if ((!msg.keepPos) || (obj.x == null)) {
				obj.x = spawnPos.x;
				obj.y = spawnPos.y;
			}

			obj.spawn = map.spawn;

			if (exists) {
				//Keep track of what the connection id is (sent from the server)
				obj.serverId = obj.id;
				delete obj.id;

				let spawnPos = exists.map.getSpawnPos(obj);

				obj.spawn = exists.map.spawn;

				exists.syncer.queue('onGetMap', exists.map.clientMap, [obj.serverId]);

				if (!msg.transfer)
					exists.objects.addObject(obj, this.onAddObject.bind(this, msg.keepPos));
				else {
					let newObj = exists.objects.transferObject(obj);
					this.onAddObject(false, newObj);
				}

				process.send({
					method: 'object',
					serverId: obj.serverId,
					obj: {
						instanceId: exists.id
					}
				});
			} else
				obj = this.instanced.createInstance.call(this, obj, msg.transfer);
		},
		onAddObject: function (keepPos, obj) {
			if (!keepPos) {
				let spawnPos = obj.instance.map.getSpawnPos(obj);

				obj.x = spawnPos.x;
				obj.y = spawnPos.y;
			}

			obj.instance.questBuilder.obtain(obj);

			if (obj.player)
				obj.stats.onLogin();

			obj.fireEvent('afterMove');

			if (obj.dead) {
				obj.instance.syncer.queue('onDeath', {
					x: obj.x,
					y: obj.y
				}, [obj.serverId]);
			}
		},
		updateObject: function (msg) {
			let id = msg.id;
			let instanceId = msg.instanceId;

			let exists = this.instances.find(i => i.id == instanceId);
			if (!exists)
				return;

			let obj = exists.objects.find(o => o.serverId == id);
			if (!obj)
				return;

			let msgObj = msg.obj;

			let components = msgObj.components || [];
			delete msgObj.components;

			for (let p in msgObj) 
				obj[p] = msgObj[p];

			let cLen = components.length;
			for (let i = 0; i < cLen; i++) {
				let c = components[i];
				let component = obj[c.type];
				for (let p in c) 
					component[p] = c[p];
			}
		},

		performAction: function (msg) {
			let id = msg.id;
			let instanceId = msg.instanceId;

			let exists = this.instances.find(i => i.id == instanceId);
			if (!exists)
				return;

			let obj = exists.objects.find(o => o.serverId == id);
			if (!obj)
				return;

			obj.performAction(msg.action);
		},

		queueAction: function (msg) {
			let id = msg.id;
			let instanceId = msg.instanceId;

			let exists = this.instances.find(i => i.id == instanceId);
			if (!exists)
				return;

			let obj = exists.objects.find(o => o.serverId == id);
			if (obj) {
				if (msg.action.action == 'move') {
					let moveEntries = obj.actionQueue.filter(q => (q.action == 'move')).length;
					if (moveEntries >= 50)
						return;
				}

				obj.queue(msg.action);
			}
		},

		removeObject: function (msg) {
			let obj = msg.obj;
			let instanceId = msg.instanceId;

			let exists = this.instances.find(i => i.id == instanceId);
			if (!exists)
				return;

			let obj = msg.obj;
			obj = exists.objects.find(o => o.serverId == obj.id);

			if (!obj)
				return;

			if (obj.auth)
				obj.auth.doSave();

			obj.destroyed = true;
		},
		onRemoveObject: function (obj) {

		},

		createInstance: function (objToAdd, transfer) {
			let newMap = {
				name: map.name,
				spawn: extend(true, [], map.spawn),
				clientMap: extend(true, {}, map.clientMap)
			};
			newMap.getSpawnPos = map.getSpawnPos.bind(newMap);

			//Hack: We need to actually just always use the instanced eventEmitter
			let eventQueue = eventEmitter.queue;
			delete eventEmitter.queue;
			let newEventEmitter = extend(true, {
				queue: []
			}, eventEmitter);
			eventEmitter.queue = eventQueue;

			let instance = {
				id: objToAdd.name + '_' + (+new Date()),
				objects: extend(true, {}, objects),
				spawners: extend(true, {}, spawners),
				syncer: extend(true, {}, syncer),
				physics: extend(true, {}, physics),
				resourceSpawner: extend(true, {}, resourceSpawner),
				zoneId: this.zoneId,
				zone: map.zone,
				closeTtl: null,
				questBuilder: extend(true, {}, questBuilder),
				events: extend(true, {}, events),
				scheduler: extend(true, {}, scheduler),
				mail: extend(true, {}, mail),
				map: newMap,
				eventEmitter: newEventEmitter,
				instanced: true
			};

			['objects', 'spawners', 'syncer', 'resourceSpawner', 'questBuilder', 'events', 'scheduler', 'mail'].forEach(i => instance[i].init(instance));

			this.instances.push(instance);

			let onDone = this.instanced.onCreateInstance.bind(this, instance, objToAdd, transfer);

			if (map.custom) {
				instance.customMap = extend(true, {}, customMap);
				instance.customMap.load(instance, objToAdd, onDone);
			} else
				onDone();
		},
		onCreateInstance: function (instance, objToAdd, transfer) {
			objToAdd.instance = instance;
			objToAdd.instanceId = instance.id;

			//Keep track of what the connection id is (sent from the server)
			objToAdd.serverId = objToAdd.id;
			delete objToAdd.id;

			let obj = null;

			instance.syncer.queue('onGetMap', instance.map.clientMap, [objToAdd.serverId]);

			if (!transfer)
				obj = instance.objects.addObject(objToAdd, this.onAddObject.bind(this, false));
			else {
				obj = instance.objects.transferObject(objToAdd);

				let spawnPos = instance.map.getSpawnPos(obj);

				obj.x = spawnPos.x;
				obj.y = spawnPos.y;

				instance.questBuilder.obtain(obj);
			}

			process.send({
				method: 'object',
				serverId: obj.serverId,
				obj: {
					instanceId: instance.id
				}
			});

			if (obj.dead) {
				obj.instance.syncer.queue('onDeath', {
					x: obj.x,
					y: obj.y
				}, [obj.serverId]);
			}

			return obj;
		}
	}
};
