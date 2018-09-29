let spells = require('../src/server/config/spellsConfig').spells;

Object.keys(spells).forEach(s => {
	const spell = spells[s];
	let range = spell.random.damage || spell.random.healing;
	if (!range)
		return;

	console.log(s, range[0] / (spell.cdMax + spell.castTimeMax));
});
