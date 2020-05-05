module.exports = {
	type: 'sound',

	sound: null,
	volume: 0,
	minDistance: 10,
	fadeInOut: false,

	simplify: function () {
		const { sound, volume, minDistance, fadeInOut } = this;

		return {
			type: 'sound',
			sound,
			volume,
			minDistance,
			fadeInOut
		};
	}
};
