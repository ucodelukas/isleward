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

				result.forEach(function(r) {
					if (r.removeAll) {
						inventory.items.forEach(function(i) {
							if ((r.nameLike) && (i.name.indexOf(r.nameLike) > -1)) {
								inventory.destroyItem(i.id, i.quantity ? i.quantity : null);
							}
						});
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

			io.set({
				ent: playerName,
				field: 'mail',
				value: JSON.stringify(result),
				callback: this.getMail.bind(this, playerName)
			});
		}
	};
});