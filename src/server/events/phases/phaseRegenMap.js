module.exports = {
	init: function () {
		const { respawnMap, respawnPos } = this;

		instancer.regenMap(respawnMap, respawnPos);

		this.end = true;
	}
};
