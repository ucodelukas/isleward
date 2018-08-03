define([
	'howler'
], function (
	howler
) {
	return {
		sounds: [],

		init: function (zone) {
			this.unload();

			if (zone !== 'fjolarok')
				return;

			this.addSound('fire.ogg', 123, 123);
			this.addSound('stream.ogg', 107, 69);
			this.addSound('wind.ogg', 176, 104);
		},

		unload: function () {
			this.sounds.forEach(function (s) {
				if (s.sound)
					s.sound.unload();
			});

			this.sounds = [];
		},

		update: function (x, y) {
			this.sounds.forEach(function (s) {
				let dx = Math.abs(s.x - x);
				if (dx > 10) {
					if (s.sound)
						s.sound.volume(0);
					return;
				}
				let dy = Math.abs(s.y - y);
				if (dy > 10) {
					if (s.sound)
						s.sound.volume(0);
					return;
				}

				let dist = 10 - Math.max(dx, dy);
				dist = (dist * dist) / 100;
				let volume = 0.3 * dist;

				if (!s.sound) {
					//eslint-disable-next-line no-undef
					s.sound = new Howl({
						src: ['audio/' + s.file],
						autoplay: true,
						loop: true,
						volume: 0
					});
				}

				s.sound.volume(volume);
			});
		},

		addSound: function (file, x, y) {
			let sound = {
				file: file,
				x: x,
				y: y,
				sound: null
			};

			this.sounds.push(sound);
		}
	};
});
