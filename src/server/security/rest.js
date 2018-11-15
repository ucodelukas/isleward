const serverConfig = require('../config/serverConfig');
const version = serverConfig.version;

module.exports = {
	init: function (app) {
		app.get('/info', (req, res, next) => res.jsonp({
			v: version,
			p: cons.playing
		}));
	},

	willHandle: function (url) {
		if (url.includes('/info'))
			return true;
	}
};
