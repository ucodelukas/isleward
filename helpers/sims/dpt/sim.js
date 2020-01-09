const spellsConfig = require('../../../src/server/config/spellsConfig');
const combat = require('../../../src/server/combat/combat');

let spells = spellsConfig.spells;

let max = true;
let maxTarget = false;

spells['harvest life'] = {
	statType: ['str', 'int'],
	statMult: 1,
	cdMax: 10,
	castTimeMax: 3,
	manaCost: 5,
	isAttack: true,
	range: 1,
	random: {
		damage: [4, 14],
		healPercent: [10, 30]
	}
};

/*let bloodBarrierMult = 1.25;
spells['skeleton melee'] = {
	statType: ['str', 'int'],
	statMult: 1 * bloodBarrierMult,
	auto: true,
	cdMax: 5,
	manaCost: 0,
	range: 1,
	random: {
		damage: [1, 3.8]
	}
};*/

let level = 20;

let hp = [
	32.70,
	65.40,
	98.10,
	130.80,
	163.50,
	196.20,
	228.90,
	261.60,
	294.30,
	327.00,
	359.70,
	392.40,
	425.10,
	457.80,
	490.50,
	523.20,
	555.90,
	588.60,
	621.30,
	654.00
];

let hpMax = [
	160.48,
	324.53,
	489.90,
	660.79,
	841.44,
	1036.21,
	1249.50,
	1485.85,
	1749.87,
	2046.32,
	2380.05,
	2756.08,
	3179.54,
	3655.72,
	4190.09,
	4788.27,
	5456.08,
	6199.50,
	7024.73,
	7938.17
];

module.exports = function () {
	let res = [];

	for (let s in spells) {
		let c = spells[s];
		c.statType = c.statType || 'int';
		let d = c.random.damage || c.random.healing;
		if (!d)
			continue;

		let damage = d[0];
		if (max)
			damage = d[1];

		var config = {
			statType: c.statType,
			statMult: c.statMult,
			element: c.element,
			cd: c.cdMax,
			damage: damage,
			noCrit: true,
			noMitigate: true,

			source: {
				stats: {
					values: {
						level: level,
						elementArcanePercent: 0,
						elementFrostPercent: 0,
						elementPoisonPercent: 0,
						elementHolyPercent: 0,
						elementFirePercent: 0
					}
				}
			},
			target: {
				stats: {
					values: {
						armor: maxTarget ? (level * 50) : (level * 20),
						elementAllResist: maxTarget ? 100 : 0,
						elementArcaneResist: 0,
						elementFrostResist: 0,
						elementPoisonResist: 0,
						elementHolyResist: 0,
						elementFireResist: 0
					}
				}
			}
		};

		let stat = c.statType;
		if (!stat.push)
			stat = [stat];

		const minStat = level;
		const maxStat = level * 10;

		stat.forEach(ss => {
			config.source.stats.values[ss] = (max ? maxStat : minStat); 
		});

		let amount = combat.getDamage(config).amount;

		let critChance = max ? 0.5 : 0.05;
		let critMult = max ? 3 : 1.5;

		let castTimeMax = c.castTimeMax;
		amount = (((amount / 100) * (100 - critChance)) + (((amount / 100) * critChance) * (critMult / 100)));
		
		let duration = c.random.i_duration;
		if (duration)
			amount *= max ? duration[1] : duration[0];
	
		const div = (c.cdMax + castTimeMax) || 1;
		amount /= div;

		res.push({
			name: s,
			dpt: ~~(~~(amount * 10) / 10),
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
		let gap = new Array(20 - r.name.length);
		console.log(r.name + ': ' + gap.join(' ') + r.dpt + '       ' + r.tpk + ' ticks       ' + (~~((r.tpk / 2.85) * 10) / 10) + ' seconds');
	});
	console.log();
};
	
