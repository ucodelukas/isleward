define([
	'security/sheets'
], function (
	sheets
) {
	return {
		getAccount: function (name) {
			return sheets.getRecord(name);
		},

		onBeforePlayerEnterGame: function (obj, blueprint) {
			var account = obj.account;
			var config = this.getAccount(account) || {};
			if (config.items) {
				var blueprintInventory = blueprint.components.find(c => (c.type == 'inventory'));
				if (!blueprintInventory) {
					blueprint.components.push({
						type: 'inventory',
						items: []
					});

					return;
				} else if (!blueprintInventory.items)
					blueprintInventory.items = [];

				var items = blueprintInventory.items;
				config.items.forEach(function (item) {
					var hasItem = items.find(i => (i.name == item.name));
					if (hasItem)
						return;

					items.push(item);
				}, this);
			}
		},

		getRoleLevel: function (player) {
			var account = player.account;
			var level = this.getAccount(account) ? this.getAccount(account).level : 0;

			return level;
		},

		isRoleLevel: function (player, requireLevel, message) {
			var account = player.account;
			var level = this.getAccount(account) ? this.getAccount(account).level : 0;

			var success = (level >= requireLevel);

			if ((!success) && (message))
				this.sendMessage(player, message);

			return success;
		},

		getRoleMessageStyle: function (player) {
			var account = player.account;
			return this.getAccount(account) ? this.getAccount(account).messageStyle : null;
		},

		getRoleMessagePrefix: function (player) {
			var account = player.account;
			return this.getAccount(account) ? this.getAccount(account).messagePrefix : null;
		},

		getSkins: function (account) {
			var skins = [];
			var account = this.getAccount(account) || {
				skins: []
			};
			(account.skins || []).forEach(function (s) {
				skins.push(s);
			});

			skins = skins.filter((s, i) => (skins.indexOf(s) == i));
			return skins;
		},

		sendMessage: function (player, msg) {
			msg = 'Only certain roles can ' + msg + ' at the moment';

			player.instance.syncer.queue('onGetMessages', {
				id: player.id,
				messages: {
					class: 'color-green',
					message: msg
				}
			}, [player.serverId]);
		}
	};
});
