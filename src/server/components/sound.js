module.exports = {
	type: 'sound',

	sound: null,
	volume: 0,
	minDistance: 10,
	fadeInOut: false,
	defaultMusic: false,

	simplify: function () {
		const { sound, volume, minDistance, fadeInOut, defaultMusic } = this;

		return {
			type: 'sound',
			sound,
			volume,
			minDistance,
			fadeInOut,
			defaultMusic
		};
	}
};
