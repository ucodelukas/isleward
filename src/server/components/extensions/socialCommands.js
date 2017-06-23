define([
	'config/roles',
	'world/atlas',
	'items/generator',
	'misc/random',
	'items/config/slots'
], function(
	roles,
	atlas,
	generator,
	random,
	configSlots
) {
	return {
		roleLevel: null,

		init: function(blueprint) {
			this.roleLevel = roles.getRoleLevel(this.obj);
		},

		onBeforeChat: function(msg) {
			if (this.roleLevel < 10)
				return;

			var messageText = msg.message;
			if (messageText[0] != '/')
				return;

			messageText = messageText.substr(1).split(' ');
			var actionName = messageText.splice(0, 1)[0].toLowerCase();
			actionName = Object.keys(this).find(a => (a.toLowerCase() == actionName));
			if (!actionName)
				return;

			var config = {};
			if ((messageText.length == 1) && (messageText[0].indexOf('=') == -1))
				config = messageText[0];
			else {
				messageText.forEach(function(m) {
					m = m.split('=');
					config[m[0]] = m[1];
				});
			}

			msg.ignore = true;

			atlas.performAction(this.obj, {
				cpn: 'social',
				method: actionName,
				data: config
			});
		},

		//actions
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

			this.obj.inventory.getItem(generator.generate(config));
		},

		getGold: function(amount) {
			this.obj.trade.gold += ~~amount;
			this.obj.syncer.set(true, 'trade', 'gold', this.obj.trade.gold);
		}
	};
});