define([
	'../config/types',
	'../config/armorMaterials'
], function (
	configTypes,
	armorMaterials
) {
	return {
		generate: function (item, blueprint) {
			var type = blueprint.type || _.randomKey(configTypes.types[item.slot]);
			var typeBlueprint = configTypes.types[item.slot][type] || {};

			if (!typeBlueprint)
				return;

			item.type = type;
			item.sprite = extend(true, [], blueprint.sprite || typeBlueprint.sprite);
			if (typeBlueprint.spritesheet)
				item.spritesheet = typeBlueprint.spritesheet;

			if (typeBlueprint.spellName) {
				blueprint.spellName = typeBlueprint.spellName;
				blueprint.spellConfig = typeBlueprint.spellConfig;
			}

			if (typeBlueprint.range)
				item.range = typeBlueprint.range;

			if (typeBlueprint.material) {
				var material = armorMaterials[typeBlueprint.material];
				blueprint.attrRequire = material.attrRequire;

				if (blueprint.statMult.armor)
					blueprint.statMult.armor *= material.statMult.armor
			}

			if (typeBlueprint.implicitStat)
				blueprint.implicitStat = typeBlueprint.implicitStat;

			if (typeBlueprint.attrRequire)
				blueprint.attrRequire = typeBlueprint.attrRequire;

			if (typeBlueprint.armorMult)
				blueprint.statMult.armor = typeBlueprint.armorMult;

			if (typeBlueprint.blockAttackMult)
				blueprint.statMult.blockAttackChance = typeBlueprint.blockAttackMult;

			if (typeBlueprint.blockSpellMult)
				blueprint.statMult.blockSpellChance = typeBlueprint.blockSpellMult;
		}
	}
});
