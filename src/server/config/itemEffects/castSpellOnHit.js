const spellBaseTemplate = require('../spells/spellTemplate');

module.exports = {
	events: {
		onGetText: function (item) {
			const { rolls: { chance, spell } } = item.effects.find(e => (e.type === 'castSpellOnHit'));

			return `${chance}% chance to cast ${spell} on hit`;
		},

		afterDealDamage: function (item, damage, target) {
			//Should only proc for attacks...this is kind of a hack
			const { element } = damage;
			if (element)
				return;

			const { rolls: { chance, spell } } = item.effects.find(e => (e.type === 'castSpellOnHit'));

			const chanceRoll = Math.random() * 100;
			if (chanceRoll >= chance)
				return;

			const spellName = 'spell' + spell.replace(/./, spell.toUpperCase()[0]);
			const spellTemplate = require(`../spells/${spellName}`);
			const builtSpell = extend({ obj: this }, spellBaseTemplate, spellTemplate, { 
				noEvents: true,
				statType: 'dex',
				damage: 1, 
				duration: 5, 
				radius: 1 
			});

			builtSpell.cast();
		}
	}
};
