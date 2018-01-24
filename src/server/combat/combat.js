define([

], function (

) {
	var max = Math.max.bind(Math);
	var mathRandom = Math.random.bind(Math);

	return {
		getDamage: function (config) {
			var srcValues = config.source.stats.values;
			var tgtValues = config.target.stats.values;

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

			var dmgPercent = 100 + srcValues.dmgPercent;
			var resist = tgtValues.elementAllResist;
			if (config.element) {
				var elementName = 'element' + config.element[0].toUpperCase() + config.element.substr(1);
				dmgPercent += srcValues[elementName + 'Percent'];
				resist += (tgtValues[elementName + 'Resist'] || 0);
			}
			dmgPercent /= 100;

			var statMult = config.statMult || 1;

			var amount = config.damage * statValue * statMult * dmgPercent;

			//Don't mitigate heals
			if (!config.noMitigate) {
				amount = (
					amount *
					max(0.5 + max((1 - ((tgtValues.armor || 0) / (srcValues.level * 50))) / 2, -0.5), 0.5) *
					max(0.5 + max((1 - (resist / 100)) / 2, -0.5), 0.5)
				);
			}

			var isCrit = false;
			if (!config.noCrit) {
				var critChance = srcValues.critChance;
				var roll = mathRandom() * 100;
				if ((roll < critChance) || (config.crit)) {
					isCrit = true;
					amount *= (srcValues.critMultiplier / 100);
				}
			}

			//Don't mitigate heals
			if (!config.noMitigate) {
				var blocked = false;
				var blockChance = config.isAttack ? tgtValues.blockAttackChance : tgtValues.blockSpellChance;
				if (Math.random() * 100 < blockChance) {
					blocked = true;
					amount = 0;
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
