define([
	'security/io',
	'security/connections'
], function(
	io,
	connections
) {
	return {
		getMail: function(playerName, cb) {
			setTimeout(this.getMail.bind(this, playerName), 10000);

			io.get({
				ent: playerName,
				field: 'mail',
				callback: this.onGetMail.bind(this, playerName, cb)
			});
		},
		onGetMail: function(playerName, cb, result) {
			result = JSON.parse(result || '[]');

			result = [{
				name: 'Cerulean Pearl',
				material: true,
				quantity: 2,
				sprite: [11, 9]
			}];

			var player = connections.players.find(p => (p.name == playerName));
			if (player) {
				var inventory = player.inventory;

				result.forEach(function(r) {
					if (player.zone) {
						player.player.performAction({
							data: {
								cpn: 'inventory',
								method: 'getItem',
								data: r
							}
						});
					} else {
						inventory.items.push(r);
					}
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

			var player = connections.players.find(p => (p.name == playerName));

			if (player)
				this.onGetMail(player, null, JSON.stringify(items));
			else {
				io.get({
					ent: playerName,
					field: 'mail',
					callback: this.doSendMail.bind(this, playerName, items)
				});
			}
		},
		doSendMail: function(playerName, items, result) {
			result = JSON.parse(result || '[]');

			items.forEach(function(i) {
				result.push(i);
			});

			io.set({
				ent: playerName,
				field: 'mail',
				value: JSON.stringify(result)
			});
		}
	};
});