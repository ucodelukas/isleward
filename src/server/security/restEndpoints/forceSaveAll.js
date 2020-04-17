const bcrypt = require('bcrypt-nodejs');
const roles = require('../../config/roles');

const doSaveAll = async (res, config, err, compareResult) => {
	if (!compareResult)
		return;

	let roleLevel = roles.getRoleLevel({
		account: config.username
	});
	if (roleLevel < 9)
		return;

	await atlas.returnWhenZonesIdle();

	cons.emit('event', {
		event: 'onGetMessages',
		data: {
			messages: [{
				class: 'color-blueA',
				message: config.msg,
				type: 'chat'
			}]
		}
	});

	cons.forceSaveAll();

	res.jsonp({
		success: true
	});
};

module.exports = async (req, res, next) => {
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

	bcrypt.compare(config.pwd, storedPassword, doSaveAll.bind(null, res, config));
};

