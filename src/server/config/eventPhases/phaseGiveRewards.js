module.exports = {
	init: function (event) {
		const { config, rewards, eventManager } = event;

		event.participators.forEach(p => {
			const rList = [{
				nameLike: 'Ancient Carp',
				removeAll: true
			}];

			const pRewards = rewards[p.name];
			if (pRewards.length)
				rList.push(...pRewards);

			if (rList.length > 1)
				rList[1].msg = `${config.name} reward:`;

			eventManager.instance.mail.sendMail(p.name, rList);
		});

		if (config.events && config.events.afterGiveRewards)
			config.events.afterGiveRewards(event);

		this.end = true;
	}
};
