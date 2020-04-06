let itemGenerator = require('../../../../items/generator');

module.exports = ({ level }, crafter) => {
	const result = itemGenerator.generate({
		level,
		spell: true
	});

	crafter.inventory.getItem(result, false, false, false, true);

	const msg = `You received: ${result.name}`;

	return { msg };
};
