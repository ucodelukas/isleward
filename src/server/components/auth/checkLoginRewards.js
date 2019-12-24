const scheduler = require('../../misc/scheduler');
const rewardGenerator = require('../../misc/rewardGenerator');
const mail = require('../../mail/mail');

const calculateDaysSkipped = (oldTime, newTime) => {
	let daysSkipped = 1;

	if (oldTime.year === newTime.year && oldTime.month === newTime.month) { 
		//Same year and month
		daysSkipped = newTime.day - oldTime.day;
	} else if (oldTime.year === newTime.year) {
		//Same month
		let daysInMonth = scheduler.daysInMonth(oldTime.month);
		daysSkipped = (daysInMonth - oldTime.day) + newTime.day;

		for (let i = oldTime.month + 1; i < newTime.month - 1; i++) 
			daysSkipped += scheduler.daysInMonth(i);
	} else {
		//Different year and month
		const daysInMonth = scheduler.daysInMonth(oldTime.month);
		daysSkipped = (daysInMonth - oldTime.day) + newTime.day;

		for (let i = oldTime.year + 1; i < newTime.year - 1; i++)
			daysSkipped += 365;

		for (let i = oldTime.month + 1; i < 12; i++) 
			daysSkipped += scheduler.daysInMonth(i);

		for (let i = 0; i < newTime.month - 1; i++) 
			daysSkipped += scheduler.daysInMonth(i);
	}

	return daysSkipped;
};

module.exports = async (cpnAuth, data, character, cbDone) => {
	const accountInfo = cpnAuth.accountInfo;

	const time = scheduler.getTime();
	const lastLogin = accountInfo.lastLogin;
	accountInfo.lastLogin = time;

	if (
		!lastLogin ||
		(
			lastLogin.day === time.day &&
			lastLogin.month === time.month &&
			lastLogin.year === time.year
		)
	) {
		cbDone();
		return;
	}

	const streak = Math.max(1, Math.min(21, accountInfo.loginStreak));
	accountInfo.loginStreak = streak;

	const itemCount = 1 + ~~(accountInfo.loginStreak / 2);
	const rewards = rewardGenerator(itemCount);
	if (rewards.length > 0)
		rewards[0].msg = `Daily login reward for ${streak} day${(streak > 1) ? 's' : ''}:`;

	mail.sendMail(character.name, rewards, cbDone);
};
