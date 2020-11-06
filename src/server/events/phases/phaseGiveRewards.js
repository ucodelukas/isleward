module.exports = {
	init: function (event) {
		const { config, rewards, eventManager } = event;

		const { name: eventName, rewardSenderName } = config;

		const subject = `${eventName} Rewards`;

		Object.entries(rewards).forEach(e => {
			const [ name, rList ] = e;

			if (!rList | !rList.length)
				return;

			if (global.mailManager) {
				global.mailManager.sendSystemMail({
					to: name,
					from: rewardSenderName,
					subject,
					msg: '',
					items: rList,
					notify: true
				});
			}
		});

		if ((config.events) && (config.events.afterGiveRewards))
			config.events.afterGiveRewards(eventManager, config);

		this.end = true;
	}
};
