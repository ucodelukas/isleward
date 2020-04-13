const buildPool = config => {
	const pool = [];

	config.forEach(c => {
		for (let i = 0; i < c.chance; i++) 
			pool.push(c.name);
	});

	return pool;
};

module.exports = (itemCount, useConfig = []) => {
	const config = useConfig;
	const pool = buildPool(useConfig);

	const items = [];
		
	for (let i = 0; i < itemCount; i++) {
		let pickName = pool[~~(Math.random() * pool.length)];
		const pick = config.find(f => f.name === pickName);

		if (!pick)
			break;

		let item = items.find(f => f.name === pickName);
		if (!item) {
			items.push({
				...pick,
				quantity: pick.quantity || 1
			});
		} else
			item.quantity += (pick.quantity || 1);
	}

	return items;
};

