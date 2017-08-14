define([
	'security/io'
], function(
	io
) {
	return {
		init: function(instance) {
			this.instance = instance;
		},

		getMail: function(playerName, cb) {
			io.get({
				ent: playerName,
				field: 'mail',
				callback: this.onGetMail.bind(this, playerName, cb)
			});
		},
		onGetMail: function(playerName, cb, result) {
			if (result == 'null')
				result = null;

			result = JSON.parse(result || '[]');

			var player = this.instance.objects.objects.find(o => (o.name == playerName));
			if (player) {
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
					} else 
						inventory.getItem(r);
				});

				io.set({
					ent: playerName,
					field: 'mail',
					value: null
				});
			}

			cb && cb();
		},

		sendMail: function(playerName, items) {
			if (!items.push)
				items = [items];

			var player = this.instance.objects.objects.find(o => (o.name == playerName));

			if (player)
				this.onGetMail(playerName, null, JSON.stringify(items));
			else {
				io.get({
					ent: playerName,
					field: 'mail',
					callback: this.doSendMail.bind(this, playerName, items)
				});
			}
		},
		doSendMail: function(playerName, items, result) {
			if (result == 'null')
				result = null;

			result = JSON.parse(result || '[]');

			items.forEach(function(i) {
				result.push(i);
			});

			var itemString = JSON.stringify(items).split(`'`).join(`''`);

			io.set({
				ent: playerName,
				field: 'mail',
				value: itemString,
				callback: this.getMail.bind(this, playerName)
			});
		}
	};
});