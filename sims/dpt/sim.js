define([
	'../../src/server/config/spellsConfig',
	'../../src/server/combat/combat'
], function (
	config,
	combat
) {
	var spells = config.spells;

	var max = true;
	var maxTarget = false;

	spells['harvest life'] = {
		statType: ['str', 'int'],
		statMult: 1.34,
		element: 'physical',
		auto: true,
		cdMax: 6,
		manaCost: 0,
		range: 1,
		random: {
			damage: [1.5, 5.7],
			healPercent: [5, 15]
		}
	};

	var bloodBarrierMult = 1.25;
	spells['skeleton melee'] = {
		statType: ['str', 'int'],
		statMult: 0.46 * bloodBarrierMult,
		element: 'physical',
		auto: true,
		cdMax: 5,
		manaCost: 0,
		range: 1,
		random: {
			damage: [1, 3.8]
		}
	};

	var level = 5;

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

	var hpMax = [
		91.25,
		96.50,
		110.75,
		138.50,
		184.25,
		252.50,
		347.75,
		474.50,
		637.25,
		840.50,
		1088.75,
		1386.50,
		1738.25,
		2148.50,
		2621.75,
		3162.50,
		3775.25,
		4464.50,
		5234.75,
		6090.50
	];

	return {
		init: function () {
			var res = [];

			for (var s in spells) {
				var c = spells[s];
				var d = c.random.damage || c.random.healing;
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
					noCrit: true,
					noMitigate: !!c.random.healing,

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
								elementFirePercent: 0
							}
						},
					},
					target: {
						stats: {
							values: {
								armor: maxTarget ? (level * 50) : (level * 20),
								elementAllResist: maxTarget ? 100 : 0,
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
					amount *= max ? duration[1] : duration[0];
				}

				amount /= c.cdMax;

				var critChance = max ? 0.5 : 0.05;
				var critMult = max ? 3 : 1.5;

				amount = (amount * (1 - critChance)) + (amount * critChance * critMult);

				res.push({
					name: s,
					dpt: (~~(amount * 10) / 10),
					cd: c.cdMax,
					mana: c.manaCost || '',
					tpk: ~~((maxTarget ? hpMax : hp)[level - 1] / amount),
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
