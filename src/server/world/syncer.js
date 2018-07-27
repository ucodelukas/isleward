module.exports = {
	buffer: {},
	dirty: false,

	init: function (msg) {
		this.objects = msg.objects;
	},

	update: function () {
		let objects = this.objects;

		let oList = objects.objects;
		let oLen = oList.length;

		//OPTIMIZE: Store a list of all players
		let pList = oList.filter(f => f.player);
		let pLen = pList.length;

		let cache = {};

		if (pLen === 0) {
			for (let i = 0; i < oLen; i++) {
				let o = oList[i];
				if (!o.destroyed) 
					continue;

				objects.removeObject(o);

				oLen--;
				i--;
			}
		} else if (pLen > 0) {
			let queueFunction = this.queue.bind(this, 'onGetObject');

			for (let i = 0; i < oLen; i++) {
				let o = oList[i];
				let oId = o.id;

				if (!o.syncer)
					continue;

				let destroyed = o.destroyed;
				
				let sync = null;
				let syncSelf = null;
				if (!destroyed) {
					sync = o.syncer.get();
					syncSelf = o.syncer.get(true);
				} else {
					sync = {
						id: o.id,
						destroyed: true
					};

					objects.removeObject(o);

					oLen--;
					i--;
				}

				let toList = [];
				let completeList = [];
				let completeObj = null;

				let sendTo = false;
				let sendComplete = false;

				for (let j = 0; j < pLen; j++) {
					let p = pList[j];

					let hasSeen = p.player.hasSeen(oId);

					if (hasSeen) {
						if ((p.id === oId) && (syncSelf))
							queueFunction(syncSelf, [ p.serverId ]);

						if (sync) {
							toList.push(p.serverId);
							sendTo = true;
						}

						if (destroyed)
							p.player.unsee(oId);
					} else if (!destroyed) {
						let cached = null;
						if (p.id === oId) {
							let syncO = o.getSimple(true);
							syncO.self = true;
							queueFunction(syncO, [ p.serverId ]);
							p.player.see(oId);
							continue;
						} else {
							cached = cache[oId];
							if (!cached)
								cached = cache[oId] = o.getSimple();
						}

						completeObj = cached;
						completeList.push(p.serverId);
						sendComplete = true;

						p.player.see(oId);
					}
				}

				if (sendTo)
					queueFunction(sync, toList);
				if (sendComplete) 
					queueFunction(completeObj, completeList);
			}
		}

		this.send();

		for (let i = 0; i < oLen; i++) 
			oList[i].syncer.reset();
	},
	queue: function (event, obj, to) {
		//Send to all players in zone?
		if (to === -1) {
			//OPTIMIZE: Store a list of all players
			let pList = this.objects.objects.filter(o => o.player);
			to = pList.map(p => p.serverId);
		}
		if (!to.length)
			return;

		this.dirty = true;

		let buffer = this.buffer;
		let list = buffer[event] || (buffer[event] = []);

		list.push({
			to: to,
			obj: obj
		});
	},
	send: function () {
		if (!this.dirty)
			return;

		this.dirty = false;

		let buffer = this.buffer;

		process.send({
			method: 'events',
			data: buffer
		});

		this.buffer = {};
	}
};
