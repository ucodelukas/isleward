const { routerConfig: { allowed, secondaryAllowed, globalAllowed } } = require('./routerConfig');

module.exports = {
	allowedCpn: function (msg) {
		let valid = allowed[msg.cpn] && allowed[msg.cpn].includes(msg.method);
		if (!valid)
			return false;

		if (!msg.data.cpn)
			return true;

		const result = secondaryAllowed[msg.data.cpn] && secondaryAllowed[msg.data.cpn].includes(msg.data.method);

		return result;
	},

	allowedGlobal: function (msg) {
		const result = globalAllowed[msg.module] && globalAllowed[msg.module].includes(msg.method);

		return result;
	},

	allowedGlobalCall: function (threadModule, method) {
		const result = globalAllowed[threadModule] && globalAllowed[threadModule].includes(method);

		return result;
	}
};
