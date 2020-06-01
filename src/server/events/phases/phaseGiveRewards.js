module.exports = {
	init: function (event) {
		const { config, rewards, eventManager } = event;

		Object.entries(rewards).forEach(e => {
			const [ name, rList ] = e;

			if (!rList | !rList.length)
				return;

			rList[0].msg = `${config.name} reward:`;

			this.instance.mail.sendMail(name, rList);
		});

		if ((config.events) && (config.events.afterGiveRewards))
			config.events.afterGiveRewards(eventManager, config);

		this.end = true;
	}
};
