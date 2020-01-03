module.exports = async (cpnSocial, targetZone) => {
	const { obj } = cpnSocial;

	obj.fireEvent('beforeRezone');

	obj.destroyed = true;

	const simpleObj = obj.getSimple(true, false, true);

	process.send({
		method: 'rezone',
		id: obj.serverId,
		args: {
			obj: simpleObj,
			newZone: targetZone
		}
	});
};
