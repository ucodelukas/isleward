define([

], function (

) {
	return {
		lineWidth: 5,
		blockSize: 20,
		defaultDistance: 50,
		defaultDistanceInc: 60,
		defaultAngle: Math.PI / 2,
		defaultAngleInc: Math.PI / 8,
		gridSize: 30,

		scrollSpeed: 0.75,

		stats: {
			vit: 'vitality',
			regenHp: 'health regeneration',
			manaMax: 'maximum mana',
			regenMana: 'mana regeneration',
			str: 'strength',
			int: 'intellect',
			dex: 'dexterity',
			armor: 'armor',
			blockAttackChance: 'chance to block attacks',
			blockSpellChance: 'chance to block spells',
			addCritChance: 'increased crit chance',
			addCritMultiplier: 'increased crit multiplier',
			magicFind: 'increased item quality',
			itemQuantity: 'increased item quantity',
			sprintChance: 'sprint chance',
			dmgPercent: 'to all damage',
			allAttributes: 'to all attributes',
			xpIncrease: 'additional xp per kill',
			lvlRequire: 'level requirement reduction',
			elementArcanePercent: 'increased arcane damage',
			elementFrostPercent: 'increased frost damage',
			elementFirePercent: 'increased fire damage',
			elementHolyPercent: 'increased holy damage',
			elementPoisonPercent: 'increased poison damage',
			elementAllResist: 'all resistance',
			elementArcaneResist: 'arcane resistance',
			elementFrostResist: 'frost resistance',
			elementFireResist: 'fire resistance',
			elementHolyResist: 'holy resistance',
			elementPoisonResist: 'poison resistance',
			elementAllResist: 'all resistance',
			attackSpeed: 'attack speed',
			castSpeed: 'cast speed',
			catchChance: 'extra catch chance',
			catchSpeed: 'faster catch speed',
			fishRarity: 'higher fish rarity',
			fishWeight: 'increased fish weight',
			fishItems: 'extra chance to hook items'
		}
	};
});
