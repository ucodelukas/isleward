define([
	'js/sound/sound'
], function (
	soundManager
) {
	return {
		type: 'sound',

		sound: null,
		volume: 0,

		init: function () {
			const { obj: { zoneId, x, y, width, height, area }, sound, volume, minDistance, fadeInOut, defaultMusic } = this;

			soundManager.addSoundFromConfig({
				scope: zoneId,
				file: sound,
				volume, 
				x, 
				y, 
				w: width, 
				h: height, 
				area,
				minDistance,
				fadeInOut,
				defaultMusic
			});
		}
	};
});
