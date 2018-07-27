let components = require('../components/components');

module.exports = {
	components: [],

	actionQueue: [],

	addComponent: function (type, blueprint, isTransfer) {
		var cpn = this[type];
		if (!cpn) {
			let template = components.components[type];
			if (!template) {
				template = extend(true, {
					type: type
				}, blueprint || {});
			}

			var cpn = extend(true, {}, template);
			cpn.obj = this;

			this.components.push(cpn);
			this[cpn.type] = cpn;
		}

		if ((cpn.init) && (this.instance != null))
			cpn.init(blueprint || {}, isTransfer);
		else {
			for (let p in blueprint) 
				cpn[p] = blueprint[p];
		}

		return cpn;
	},

	removeComponent: function (type) {
		let cpn = this[type];
		if (!cpn)
			return;

		cpn.destroyed = true;
	},

	extendComponent: function (ext, type, blueprint) {
		let template = require('../components/extensions/' + type);
		let cpn = this[ext];

		extend(true, cpn, template);

		if (template.init)
			cpn.init(blueprint);

		return cpn;
	},

	update: function () {
		let usedTurn = false;

		let components = this.components;
		let len = components.length;
		for (let i = 0; i < len; i++) {
			var c = components[i];

			if (c.destroyed) {
				this.syncer.setSelfArray(false, 'removeComponents', c.type);
				this.components.spliceWhere(f => (f == c));
				delete this[c.type];
				len--;
				i--;
			} else if (c.update) {
				if (c.update())
					usedTurn = true;
			}
		}

		if (!usedTurn) 
			this.performQueue();
	},
	getSimple: function (self, isSave) {
		let s = this.simplify(null, self, isSave);
		if (this.instance)
			s.zoneId = this.instance.zoneId;

		if ((self) && (!isSave)) {
			let syncer = this.syncer;
			if (this.syncer) {
				//Add things that have been queued by the syncer (that aren't tied to server-side components)
				let components = this.syncer.oSelf.components
					.filter((c => !this[c.type]), this)
					.forEach(c => s.components.push(c));
			}
		}

		return s;
	},
	simplify: function (o, self, isSave) {
		let result = {};
		if (!o) {
			result.components = [];
			o = this;
		}

		let syncTypes = ['portrait'];

		for (let p in o) {
			let value = o[p];
			if (value == null)
				continue;

			let type = typeof (value);

			//build component
			if (type == 'object') {
				if (value.type) {
					if (!value.simplify) {
						if (self) {
							result.components.push({
								type: value.type
							});
						}
					} else {
						let component = null;

						if (isSave)
							component = value.save ? value.save() : value.simplify(self);
						else
							component = value.simplify(self);

						if (value.destroyed) {
							if (!component) {
								component = {
									type: value.type
								};
							}

							component.destroyed = true;
						}

						if (component)
							result.components.push(component);
					}
				} else if (syncTypes.indexOf(p) > -1) 
					result[p] = value;
			} else if (type != 'function')
				result[p] = value;
		}

		return result;
	},
	sendEvent: function (event, data) {
		process.send({
			method: 'event',
			id: this.serverId,
			data: {
				event: event,
				data: data
			}
		});
	},

	queue: function (action) {
		if (action.list) {
			let type = action.action;
			let data = action.data;
			let dLen = data.length;
			for (let i = 0; i < dLen; i++) {
				let d = data[i];

				this.actionQueue.push({
					action: type,
					data: d
				});
			}

			return;
		}

		if (action.priority)
			this.actionQueue.splice(this.actionQueue.firstIndex(a => !a.priority), 0, action);
		else
			this.actionQueue.push(action);
	},
	dequeue: function () {
		if (this.actionQueue.length == 0)
			return null;

		return this.actionQueue.splice(0, 1)[0];
	},
	clearQueue: function () {
		if (this.serverId != null) {
			this.instance.syncer.queue('onClearQueue', {
				id: this.id
			}, [this.serverId]);
		}

		this.actionQueue = [];
	},

	performAction: function (action) {
		if (action.instanceModule) {
			/*action.data.obj = this;
			this.instance[action.instanceModule][action.method](action.data);
			this.inventory.resolveCallback(action.data, action.data.result);*/
			return;
		}

		let cpn = this[action.cpn];
		if (!cpn)
			return;

		cpn[action.method](action.data);
	},

	performQueue: function () {
		let q = this.dequeue();
		if (!q) 
			return;

		if (q.action == 'move') {
			if ((this.actionQueue[0]) && (this.actionQueue[0].action == 'move')) {
				let sprintChance = this.stats.values.sprintChance || 0;
				let physics = this.instance.physics;
				if ((~~(Math.random() * 100) < sprintChance) && (!physics.isTileBlocking(q.data.x, q.data.y))) {
					q = this.dequeue();
					q.isDouble = true;
				}
			}
			var success = this.performMove(q);
			if (!success) 
				this.clearQueue();
		} else if (q.action == 'clearQueue')
			this.clearQueue();
		else if (q.action == 'spell') {
			var success = this.spellbook.cast(q);
			if (!success)
				this.performQueue();
		}
	},
	performMove: function (action) {
		let data = action.data;
		let physics = this.instance.physics;

		if (!action.force) {
			if (physics.isTileBlocking(data.x, data.y))
				return false;

			data.success = true;
			this.fireEvent('beforeMove', data);
			if (data.success == false) {
				action.priority = true;
				this.queue(action);
				return true;
			}

			let maxDistance = action.isDouble ? 2 : 1;

			let deltaX = Math.abs(this.x - data.x);
			let deltaY = Math.abs(this.y - data.y);
			if (
				(
					(deltaX > maxDistance) ||
					(deltaY > maxDistance)
				) ||
				(
					(deltaX == 0) &&
					(deltaY == 0)
				)
			)
				return false;
		}

		//Don't allow mob overlap during combat
		if ((this.mob) && (this.mob.target)) {
			if (physics.addObject(this, data.x, data.y)) {
				physics.removeObject(this, this.x, this.y);

				this.x = data.x;
				this.y = data.y;
			} else
				return false;
		} else {
			physics.removeObject(this, this.x, this.y, data.x, data.y);
			physics.addObject(this, data.x, data.y, this.x, this.y);
			this.x = data.x;
			this.y = data.y;
		}

		let syncer = this.syncer;
		syncer.o.x = this.x;
		syncer.o.y = this.y;

		if (this.aggro)
			this.aggro.move();

		this.fireEvent('afterMove');

		return true;
	},

	collisionEnter: function (obj) {
		let components = this.components;
		let cLen = components.length;
		for (let i = 0; i < cLen; i++) {
			let c = components[i];
			if (c.collisionEnter) {
				if (c.collisionEnter(obj))
					return true;
			}
		}
	},
	collisionExit: function (obj) {
		let components = this.components;
		let cLen = components.length;
		for (let i = 0; i < cLen; i++) {
			let c = components[i];
			if (c.collisionExit)
				c.collisionExit(obj);
		}
	},

	fireEvent: function (event) {
		let args = [].slice.call(arguments, 1);

		let components = this.components;
		let cLen = components.length;
		for (let i = 0; i < cLen; i++) {
			let cpn = components[i];
			let events = cpn.events;
			if (!events)
				continue;

			let callback = events[event];
			if (!callback)
				continue;

			callback.apply(cpn, args);
		}

		if (this.effects)
			this.effects.fireEvent(event, args);
		if (this.quests)
			this.quests.fireEvent(event, args);
		if (this.prophecies)
			this.prophecies.fireEvent(event, args);
		if (this.inventory)
			this.inventory.fireEvent(event, args);
		if (this.spellbook)
			this.spellbook.fireEvent(event, args);
	},

	destroy: function () {
		let components = this.components;
		let len = components.length;
		for (let i = 0; i < len; i++) {
			let c = components[i];
			if (c.destroy)
				c.destroy();
		}

		components = null;
	}
};
