const serverConfig = require('../config/serverConfig');
const version = serverConfig.version;
const bcrypt = require('bcrypt-nodejs');
const roles = require('../config/roles');
const transactions = require('./transactions');

module.exports = {
	init: function (app) {
		app.get('/info', (req, res, next) => res.jsonp({
			v: version,
			p: cons.playing
		}));

		app.get('/adminForceSave', this.forceSaveAll.bind(this));
	},

	forceSaveAll: async function (req, res, next) {
		this.doSaveAll();
		return;
		let config = {};

		let pars = req.originalUrl.split('?').pop().split('&');
		pars.forEach(p => {
			let [par, val = ''] = p.split('=');
			config[par] = val
				.split('%20')
				.join(' ');
		});

		if (['msg', 'username', 'pwd'].some(p => !config[p]))
			return;

		let storedPassword = await io.getAsync({
			key: config.username,
			table: 'login',
			noParse: true
		});

		bcrypt.compare(config.pwd, storedPassword, this.doSaveAll.bind(this, res, config));
	},

	doSaveAll: async function (res, config, err, compareResult) {
		/*if (!compareResult)
			return;

		let roleLevel = roles.getRoleLevel({
			account: config.username
		});
		if (roleLevel < 9)
			return;*/

		await atlas.returnWhenZonesIdle();

		cons.emit('event', {
			event: 'onGetMessages',
			data: {
				messages: [{
					class: 'color-blueA',
					message: 'asdd',
					type: 'chat'
				}]
			}
		});

		cons.forceSaveAll();

		/*res.jsonp({
			success: true
		});*/
	},

	willHandle: function (url) {
		if (url.includes('/info') || url.includes('/adminForceSave'))
			return true;
	}
};
