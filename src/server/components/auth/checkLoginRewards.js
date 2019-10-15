const scheduler = require('../../misc/scheduler');
const loginRewards = require('../../config/loginRewards');
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

	const daysSkipped = calculateDaysSkipped(lastLogin, time);
	if (daysSkipped === 1) 
		accountInfo.loginStreak++;
	else 
		accountInfo.loginStreak -= (daysSkipped - 1);

	accountInfo.loginStreak = Math.min(1, Math.max(21, accountInfo.loginStreak));

	const rewards = loginRewards.generate(accountInfo.loginStreak);
	mail.sendMail(character.name, rewards, cbDone);
};
