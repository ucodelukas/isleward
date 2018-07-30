let extend = require('extend');
let cons = require('./security/connections');
let helpers = require('./misc/helpers');
let atlas = require('./world/atlas');
let leaderboard = require('./leaderboard/leaderboard');
let clientConfig = require('./config/clientConfig');

module.exports = {
	init: function () {
		global.io =  require('./security/io');
		
		global.extend = require('extend');
		global.cons = require('./security/connections');
		global._ = require('./misc/helpers');
		global.atlas = require('./world/atlas');
		global.leaderboard = require('./leaderboard/leaderboard');
		global.clientConfig = require('./config/clientConfig');

		clientConfig.init();
	}
};
