define([
	'howler',
	'js/misc/physics'
], function (
	howler,
	physics
) {
	return {
		sounds: [],

		init: function (zoneId) {
			this.unload(zoneId);
		},

		unload: function (zoneId) {
			this.sounds.forEach(function (s) {
				if ((s.sound) && (s.zoneId != zoneId))
					s.sound.unload();
			});

			this.sounds.spliceWhere(function (s) {
				return (s.zoneId != zoneId);
			});
		},

		update: function (x, y) {
			this.sounds.forEach(function (s) {
				var volume = 1;
				if (!s.w) {
					var dx = Math.abs(s.x - x);
					if (dx > 10) {
						if (s.sound)
							s.sound.volume(0);
						return;
					}
					var dy = Math.abs(s.y - y);
					if (dy > 10) {
						if (s.sound)
							s.sound.volume(0);
						return;
					}

					var dist = 10 - Math.max(dx, dy);
					dist = (dist * dist) / 100;
					volume = 0.3 * dist;
				} else {
					if (!s.area) {
						var inside = (!((x < s.x) || (y < s.y) || (x >= s.x + s.w) || (y >= s.y + s.h)));
						if (!inside) {
							if (s.sound)
								s.sound.volume(0);
							return;
						}
					} else {
						var inside = physics.isInPolygon(x, y, s.area);
						if (!inside) {
							if (s.sound)
								s.sound.volume(0);
							return;
						}
					}
				}

				if (!s.sound) {
					s.sound = new Howl({
						src: ['audio/' + s.file],
						autoplay: true,
						loop: true,
						volume: 0
					});
				}

				s.sound.volume(volume * s.volume);
			});
		},

		addSound: function (zoneId, file, volume, x, y, w, h, area) {
			var sound = {
				file: file,
				x: x,
				y: y,
				w: w,
				h: h,
				volume: volume,
				area: area,
				sound: null,
				zoneId: zoneId
			};

			this.sounds.push(sound);
		}
	};
});
