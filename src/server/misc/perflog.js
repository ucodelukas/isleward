const fs = require('fs');

const ticksPerLog = 171;
let ticksLeft = ticksPerLog;
let logCount = 0;

let fileName = null;

let stats = {};

let lastId = 0;
let timers = {};

const reset = () => {
	lastId = 0;
	timers = {};

	stats = {
		components: {},
		modules: {}
	};

	ticksLeft = ticksPerLog;
};

const log = (isModule, name, id) => {
	const timerKey = `${name}-${id || ++lastId}`;
	if (!id) {
		timers[timerKey] = +new Date();

		return log.bind(this, isModule, name, lastId);
	}

	const obj = isModule ? stats.modules : stats.components;

	let statKey = obj[name];
	if (!statKey) {
		statKey = obj[name] = {
			time: 0,
			count: 0
		};
	}

	statKey.time += (+new Date()) - timers[timerKey];
	statKey.count++;
};

const serializeStats = obj => {
	return Object.entries(obj)
		.map(([k, v]) => {
			return ~~(v.time / ticksPerLog);
		})
		.join('\t');
};

const persist = () => {
	['modules', 'components'].forEach(o => {
		let obj = stats[o];
		let res = '';
		if (!logCount)
			res += Object.keys(obj).join('\t') + '\r\n';

		res += serializeStats(obj) + '\r\n';

		fs.appendFile(`../../data/${fileName}_${o}.log`, res, () => {});
	});

	logCount++;
};

module.exports = {
	init: useZone => {
		const day = new Date();
		fileName = `${useZone}_${day.getMonth()}_${day.getDay()}_${day.getHours()}_${day.getMinutes()}`;

		reset();
	},

	logModule: name => {
		return log(true, name);
	},

	logComponent: name => {
		return log(false, name);
	},

	tick: function () {
		ticksLeft--;

		if (!ticksLeft) {
			persist();
			reset();
		}
	}
};
