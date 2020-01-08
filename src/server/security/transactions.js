let lastId = 0;
const list = [];

const complete = id => {
	list.spliceWhere(l => l === id);
};

const register = () => {
	console.log('reg');
	const nextId = ++lastId;
	list.push(nextId);

	return complete.bind(null, nextId);
};

const returnWhenDone = async () => {
	console.log('check');
	if (!list.length)
		return;

	return new Promise(res => {
		const checker = () => {
			if (!list.length) {
				console.log('ok');
				res();

				return;
			}

			console.log('nope');

			setTimeout(checker, 100);
		};

		checker();
	});
};

module.exports = {
	register,
	returnWhenDone	
};
