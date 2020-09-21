module.exports = {
	init: function () {
		const { respawnMap, respawnPos } = this;

		instancer.respawnMap = respawnMap;
		instancer.respawnPos = respawnPos;
		instancer.regenBusy = true;

		this.end = true;
	}
};
