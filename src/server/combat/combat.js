define([

], function (

) {
	var max = Math.max.bind(Math);
	var mathRandom = Math.random.bind(Math);

	return {
		getDamage: function (config) {
			var srcValues = config.source.stats.values;
			var tgtValues = config.target.stats.values;

			var amount = config.damage;
			var blocked = false;
			var isCrit = false;

			//Don't block heals
			if (!config.noMitigate) {
				var blockChance = config.isAttack ? tgtValues.blockAttackChance : tgtValues.blockSpellChance;
				if (mathRandom() * 100 < blockChance) {
					blocked = true;
					amount = 0;
				}
			}

			if (!blocked) {
				var statValue = 0;
				if (config.statType) {
					var statType = config.statType;
					if (!(statType instanceof Array))
						statType = [statType];
					var dmg = 0;
					statType.forEach(function (s) {
						statValue += srcValues[s];
					});
				}

				statValue = max(1, statValue);
				var statMult = config.statMult || 1;
				var dmgPercent = 100 + srcValues.dmgPercent;

				amount *= statValue * statMult;

				if (config.element) {
					var elementName = 'element' + config.element[0].toUpperCase() + config.element.substr(1);
					dmgPercent += srcValues[elementName + 'Percent'];

					//Don't mitigate heals
					if (!config.noMitigate) {
						var resist = tgtValues.elementAllResist + (tgtValues[elementName + 'Resist'] || 0);
						amount *= max(0.5 + max((1 - (resist / 100)) / 2, -0.5), 0.5);
					}
				} else if (!config.noMitigate)
					amount *= max(0.5 + max((1 - ((tgtValues.armor || 0) / (srcValues.level * 50))) / 2, -0.5), 0.5);

				amount *= (dmgPercent / 100);

				if (!config.noCrit) {
					var critChance = srcValues.critChance;
					if ((config.crit) || (roll < critChance)) {
						isCrit = true;
						amount *= (srcValues.critMultiplier / 100);
					}
				}
			}

			return {
				amount: amount,
				blocked: blocked,
				crit: isCrit,
				element: config.element
			};
		}
	};
});
