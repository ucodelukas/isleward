const roles = require('../../config/roles');

module.exports = async (cpnSocial, playerName) => {
	let o = cons.players.find(f => (f.name === playerName));
	if (!o)
		return;

	const { username } = o.auth;

	let role = roles.getRoleLevel(o);
	if (role >= cpnSocial.roleLevel)
		return;

	await io.setAsync({
		key: username,
		table: 'login',
		value: '{banned}'
	});

	cons.logOut({
		auth: {
			username
		}
	});

	cpnSocial.sendMessage('Successfully banned ' + playerName, 'color-yellowB');
};
