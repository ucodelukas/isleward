define([

], function (

) {
	const config = {
		showNames: true,
		showQuests: 'on',
		showEvents: true,
		playAudio: true,
		qualityIndicators: 'off'
	};

	const valueChains = {
		showQuests: ['on', 'minimal', 'off'],
		qualityIndicators: ['corner', 'border', 'background', 'off']
	};

	const getNextValue = key => {
		const currentValue = config[key];
		const chain = valueChains[key];
		const currentIndex = chain.indexOf(currentValue);

		const nextValue = chain[(currentIndex + 1) % chain.length];

		return nextValue;
	};

	const getKeyName = key => {
		return `iwd_opt_${key.toLowerCase()}`;
	};

	config.set = (key, value) => {
		config[key] = value;

		window.localStorage.setItem(getKeyName(key), config[key]);
	};

	config.toggle = key => {
		if (valueChains[key])
			config[key] = getNextValue(key);
		else
			config[key] = !config[key];

		window.localStorage.setItem(getKeyName(key), config[key]);
	};

	const loadValue = key => {
		const keyName = getKeyName(key);
		const { [keyName]: currentValue = '{unset}' } = localStorage;

		if (currentValue === '{unset}')
			return;

		const morphedValue = valueChains[key] ? currentValue : (currentValue === 'true');
		config[key] = morphedValue;
	};

	Object.keys(config).forEach(key => loadValue(key) );

	return config;
});
