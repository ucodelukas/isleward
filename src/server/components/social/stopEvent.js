module.exports = async (cpnSocial, eventName) => {
	const { obj } = cpnSocial;

	atlas.messageAllThreads({
		threadModule: 'eventManager',
		method: 'stopEventByCode',
		data: eventName
	});
};
