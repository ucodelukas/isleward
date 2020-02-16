module.exports = async (cpnSocial, eventName) => {
	const { obj } = cpnSocial;

	atlas.messageAllThreads({
		threadModule: 'eventManager',
		method: 'startEventByCode',
		data: eventName
	});
};
