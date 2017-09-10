define([
	'security/io'
], function(
	io
) {
	return {
		queue: {},
		busy: {},

		init: function(instance) {
			this.instance = instance;
		},

		getMail: function(playerName) {
			var player = this.instance.objects.objects.find(o => (o.name == playerName));
			if (!player) {
				process.send({
					method: 'callDifferentThread',
					playerName: playerName,
					data: {
						module: 'mail',
						method: 'getMail',
						args: [ playerName ]
					}
				});

				this.processQueue(playerName);
				return;
			}

			io.get({
				ent: playerName,
				field: 'mail',
				callback: this.onGetMail.bind(this, player)
			});
		},
		onGetMail: function(player, result) {
			if (result == 'null')
				result = null;
			else if (result) {
				result = result.split('`').join(`'`);
				//Hack for weird google datastore error
				if (result[0] == '<')
					return;
			}

			result = JSON.parse(result || '[]');

			var sentMessages = [];

			var inventory = player.inventory;
			var stash = player.stash;

			result.forEach(function(r) {
				if (r.removeAll) {
					for (var i = 0; i < inventory.items.length; i++) {
						var item = inventory.items[i];
						if ((r.nameLike) && (item.name.indexOf(r.nameLike) > -1)) {
							inventory.destroyItem(item.id, item.quantity ? item.quantity : null);
							i--;
						}
					}

					for (var i = 0; i < stash.items.length; i++) {
						var item = stash.items[i];
						if ((r.nameLike) && (item.name.indexOf(r.nameLike) > -1)) {
							stash.destroyItem(item.id);
							i--;
						}
					}
				} else {
					if ((r.msg) && (!sentMessages.some(s => (s == r.msg)))) {
						player.instance.syncer.queue('onGetMessages', {
							id: player.id,
							messages: [{
								class: 'q0',
								message: r.msg,
								type: 'info'
							}]
						}, [player.serverId]);

						sentMessages.push(r.msg);
						delete r.msg;
					}
					inventory.getItem(r);
				}
			});

			io.set({
				ent: player.name,
				field: 'mail',
				value: null,
				callback: this.processQueue.bind(this, player.name)
			});
		},

		processQueue: function(playerName) {
			delete this.busy[playerName];
			var queue = this.queue[playerName];
			if (!queue)
				return;

			delete this.queue[playerName];
			this.sendMail(playerName, queue);
		},

		sendMail: function(playerName, items) {
			if (this.busy[playerName]) {
				var queue = this.queue[playerName];
				if (!queue) {
					queue = this.queue[playerName] = [];
				}
				items.forEach(function(i) {
					queue.push(extend(true, {}, i));
				});

				return;
			}

			this.busy[playerName] = true;

			if (!items.push)
				items = [items];

			var player = null;
			if (this.instance)
				player = this.instance.objects.objects.find(o => (o.name == playerName));

			io.get({
				ent: playerName,
				field: 'mail',
				callback: this.doSendMail.bind(this, playerName, items)
			});
		},
		doSendMail: function(playerName, items, result) {
			if (result == 'null')
				result = null;

			result = JSON.parse(result || '[]');

			items.forEach(function(i) {
				result.push(i);
			});

			var itemString = JSON.stringify(items).split(`'`).join('`');

			io.set({
				ent: playerName,
				field: 'mail',
				value: itemString,
				callback: this.getMail.bind(this, playerName)
			});
		}
	};
});