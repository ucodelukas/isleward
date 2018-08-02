define([

], function (

) {
	let events = {
		events: {},
		queue: [],
		on: function (event, callback) {
			let list = this.events[event] || (this.events[event] = []);
			list.push(callback);

			for (let i = 0; i < this.queue.length; i++) {
				let q = this.queue[i];
				if (q.event !== event)
					continue;

				this.queue.splice(i, 1);
				i--;

				q.args.splice(0, 0, event);

				this.emit.apply(this, q.args);
			}

			return callback;
		},
		clearQueue: function () {
			//Hack to allow the player list to persist
			this.queue.spliceWhere(function (q) {
				return ((q.event !== 'onGetConnectedPlayer') && (q.event !== 'onGetDisconnectedPlayer'));
			});
		},
		off: function (event, callback) {
			let list = this.events[event] || [];
			let lLen = list.length;
			for (let i = 0; i < lLen; i++) {
				if (list[i] === callback) {
					list.splice(i, 1);
					i--;
					lLen--;
				}
			}

			if (lLen === 0)
				delete this.events[event];
		},
		emit: function (event) {
			let args = [].slice.call(arguments, 1);

			let list = this.events[event];
			if (!list) {
				this.queue.push({
					event: event,
					args: args
				});

				return;
			}

			let len = list.length;
			for (let i = 0; i < len; i++) {
				let l = list[i];
				l.apply(null, args);
			}
		}
	};

	if (window.addons)
		window.addons.init(events);

	return events;
});
