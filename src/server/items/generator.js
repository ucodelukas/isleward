const events = require('../misc/events');

let g1 = require('./generators/level'); 
let g2 = require('./generators/quality'); 
let g3 = require('./generators/slots'); 
let g4 = require('./generators/types'); 
let g5 = require('./generators/stats'); 
let g6 = require('./generators/names'); 
let g7 = require('./generators/worth'); 
let g8 = require('./generators/spellbook'); 
let g9 = require('./generators/effects'); 
let g10 = require('./generators/attrRequire');

let generators = [g1, g2, g3, g4, g5, g6, g9, g10, g7];
let spellGenerators = [g1, g2, g8, g7];

module.exports = {
	spellChance: 0.035,

	generate: function (blueprint, ownerLevel) {
		let isSpell = false;

		let hadBlueprint = !!blueprint;
		blueprint = blueprint || {};

		let item = {};

		const generateEvent = {
			blueprint,
			item,
			ownerLevel,
			ignore: false
		};

		events.emit('onBeforeGenerateItem', generateEvent);
		if (generateEvent.ignore)
			return item;

		const dropChancesEvent = {
			blueprint,
			spellChance: this.spellChance
		};

		global.instancer.instances[0].eventEmitter.emitNoSticky('onBeforeGetDropChances', dropChancesEvent);

		if (!blueprint.slot && !blueprint.noSpell) {
			isSpell = blueprint.spell;

			if (!isSpell && (!hadBlueprint || (!blueprint.type && !blueprint.slot && !blueprint.stats)))
				isSpell = Math.random() < dropChancesEvent.spellChance;
		}

		if (blueprint.isSpell)
			isSpell = true;

		if (isSpell)
			spellGenerators.forEach(g => g.generate(item, blueprint));
		else if (blueprint.type === 'mtx') {
			item = extend({}, blueprint);
			delete item.chance;
		} else {
			generators.forEach(g => g.generate(item, blueprint));
			if (blueprint.spellName)
				g8.generate(item, blueprint);
		}

		if (blueprint.spritesheet)
			item.spritesheet = blueprint.spritesheet;

		if (blueprint.noSalvage)
			item.noSalvage = true;

		if (blueprint.uses)
			item.uses = blueprint.uses;

		events.emit('onAfterGenerateItem', generateEvent);

		return item;
	},

	removeStat: function (item, stat) {
		if (!stat) {
			stat = Object.keys(item.stats)
				.filter(s => (s !== 'armor'));

			stat = stat[~~(Math.random() * stat.length)];
		}

		delete item.stats[stat];

		if (stat === 'lvlRequire') {
			item.level = item.originalLevel;
			delete item.originalLevel;
		}
	},

	pickRandomSlot: function () {
		let item = {};
		let blueprint = {};
		g3.generate(item, blueprint);

		return item.slot;
	}
};
