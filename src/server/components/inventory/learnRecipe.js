module.exports = async ({ serverId, name }, { recipe: { profession, teaches } }) => {
	const recipes = await io.getAsync({
		key: name,
		table: 'recipes',
		isArray: true
	});

	const known = recipes.some(r => r.profession === profession && r.teaches === teaches);
	if (known) {
		process.send({
			method: 'events',
			data: {
				onGetAnnouncement: [{
					obj: {
						msg: 'You already know that recipe'
					},
					to: [serverId]
				}]
			}
		});

		return false;
	}

	recipes.push({
		profession,
		teaches
	});

	await io.setAsync({
		key: name,
		table: 'recipes',
		value: recipes,
		serialize: true
	});

	const now = await io.getAsync({
		key: name,
		table: 'recipes',
		isArray: true
	});

	return true;
};
