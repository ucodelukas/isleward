define([
	'../../src/server/config/spellsConfig',
	'../../src/server/combat/combat'
], function (
	config,
	combat
) {
	var spells = config.spells;

	var max = true;

	spells['harvest life'] = {
		statType: ['str', 'int'],
		statMult: 1.6,
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

	var bloodBarrierMult = 1.25;
	spells['skeleton melee'] = {
		statType: ['str', 'int'],
		statMult: 0.81 * bloodBarrierMult,
		element: 'physical',
		auto: true,
		cdMax: 5,
		manaCost: 0,
		range: 1,
		random: {
			damage: [1, 1]
		}
	};

	var level = 20;

	var hp = [
		30.07,
		30.58,
		31.94,
		34.61,
		39,
		45.55,
		54.70,
		66.86,
		82.49,
		102,
		125.83,
		154.42,
		188.18,
		227.57,
		273,
		324.91,
		383.74,
		449.90,
		523.85,
		606
	];

	return {
		init: function () {
			var res = [];

			for (var s in spells) {
				var c = spells[s];
				var d = c.random.damage;
				if (!d)
					continue;

				var damage = d[0];
				if (max)
					damage = d[1];

				var config = {
					statType: c.statType,
					statMult: c.statMult,
					element: c.element,
					cd: c.cdMax,
					damage: damage,

					source: {
						stats: {
							values: {
								level: level,
								dmgPercent: max ? 20 : 0,
								elementArcanePercent: 0,
								elementFrostPercent: 0,
								elementPoisonPercent: 0,
								elementPhysicalPercent: 0,
								elementHolyPercent: 0,
								elementFirePercent: 0,
								critChance: max ? 50 : 5,
								critMultiplier: max ? 300 : 150
							}
						},
					},
					target: {
						stats: {
							values: {
								armor: level * 50,
								elementAllResist: 0,
								elementArcaneResist: 0,
								elementFrostResist: 0,
								elementPoisonResist: 0,
								elementPhysicalResist: 0,
								elementHolyResist: 0,
								elementFireResist: 0
							}
						}
					}
				};

				var stat = c.statType;
				if (!stat.push)
					stat = [stat];

				var minStat = 1 + (0.00477 * Math.pow(level, 2.8));
				var maxStat = 3 + (0.3825 * Math.pow(level, 1.83));

				var mult = (stat.length == 1) ? 1 : 0.5;

				stat.forEach(s => config.source.stats.values[s] = (max ? maxStat : minStat) * mult);

				var amount = combat.getDamage(config).amount;
				var duration = c.random.i_duration;
				if (duration) {
					amount *= (duration[0] + ~~((duration[1] - duration[0]) / 2));
				}

				amount /= c.cdMax

				res.push({
					name: s,
					dpt: (~~(amount * 10) / 10),
					cd: c.cdMax,
					mana: c.manaCost || '',
					tpk: ~~(hp[level - 1] / amount),
					amount: amount
				});
			}

			res = res.sort((a, b) => (b.dpt - a.dpt));

			console.log();
			console.log('ability              dpt');
			console.log();
			res.forEach(function (r) {
				var gap = new Array(20 - r.name.length);
				console.log(r.name + ': ' + gap.join(' ') + r.dpt + '       ' + r.tpk + ' ticks       ' + (~~((r.tpk / 2.85) * 10) / 10) + ' seconds');
			});
			console.log();
		}
	};
});
