define([
	'../../src/server/config/spellsConfig',
	'../../src/server/combat/combat'
], function (
	config,
	combat
) {
	var spells = config.spells;

	spells['harvest life'] = {
		statType: ['str', 'int'],
		statMult: 0.156,
		element: 'physical',
		auto: true,
		cdMax: 6,
		manaCost: 0,
		range: 1,
		random: {
			damage: [2.2, 4.1],
			healPercent: [5, 15]
		}
	};

	return {
		init: function () {
			var res = [];

			for (var s in spells) {
				var c = spells[s];
				var d = c.random.damage;
				if (!d)
					continue;

				var damage = d[0] + ((d[1] - d[0]) / 2);

				var config = {
					statType: c.statType,
					statMult: c.statMult,
					element: c.element,
					cd: c.cdMax,
					damage: damage,
					noMitigate: true,
					noCrit: true,

					source: {
						stats: {
							values: {
								dmgPercent: 0,
								elementArcanePercent: 0,
								elementFrostPercent: 0,
								elementPoisonPercent: 0,
								elementPhysicalPercent: 0,
								elementHolyPercent: 0,
								elementFirePercent: 0
							}
						},
					},
					target: {
						stats: {
							values: {}
						}
					}
				};

				var stat = c.statType;
				if (!stat.push)
					stat = [stat];
				stat.forEach(s => config.source.stats.values[s] = 1000);

				var amount = combat.getDamage(config).amount;
				var duration = c.random.i_duration;
				if (duration) {
					amount *= (duration[0] + ~~((duration[1] - duration[0]) / 2));
				}

				amount /= c.cdMax

				res.push({
					name: s,
					dpt: Math.round(amount),
					cd: c.cdMax,
					mana: c.manaCost || ''
				});
			}

			res = res.sort((a, b) => (b.dpt - a.dpt));

			console.log();
			res.forEach(function (r) {
				var gap = new Array(20 - r.name.length);
				console.log(r.name + ': ' + gap.join(' ') + r.dpt + 'dpt       ' + r.cd + 'cd       ' + ((r.cd.toString().length == 1) ? ' ' : '') + r.mana);
			});
			console.log();
		}
	};
});
