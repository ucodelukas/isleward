let extend = require('extend');
let cons = require('./security/connections');
let helpers = require('./misc/helpers');
let atlas = require('./world/atlas');
let leaderboard = require('./leaderboard/leaderboard');
let clientConfig = require('./config/clientConfig');

module.exports = {
	init: function () {
		global.extend = extend;
		global.cons = cons;
		global._ = helpers;
		global.atlas = atlas;
		global.leaderboard = leaderboard;
		global.clientConfig = clientConfig;

		clientConfig.init();
	}
};
