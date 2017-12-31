define([
	'extend',
	'security/connections',
	'misc/helpers',
	'items/lootRoller',
	'world/atlas',
	'leaderboard/leaderboard',
	'config/clientConfig'
], function (
	extend,
	cons,
	helpers,
	lootRoller,
	atlas,
	leaderboard,
	clientConfig
) {
	return {
		init: function () {
			var oldExtend = extend;
			global.extend = function () {
				try {
					oldExtend.apply(null, arguments);
					return arguments[1];
				} catch (e) {
					console.log(arguments);
				}
			};

			global.cons = cons;
			global._ = helpers;
			global.lootRoller = lootRoller;
			global.atlas = atlas;
			global.leaderboard = leaderboard;
			global.clientConfig = clientConfig;

			clientConfig.init();
		}
	};
});
