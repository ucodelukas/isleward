define([
	'howler',
	'js/misc/physics',
	'js/system/events',
	'js/config',
	'js/system/globals'
], function (
	howler,
	physics,
	events,
	config,
	globals
) {
	const globalScopes = ['ui'];

	return {
		sounds: [],

		muted: false,

		init: function () {
			events.on('onToggleAudio', this.onToggleAudio.bind(this));
			events.on('onPlaySound', this.playSound.bind(this));

			const { clientConfig: { sounds: loadSounds } } = globals;

			Object.entries(loadSounds).forEach(([ scope, soundList ]) => {
				soundList.forEach(({ name: soundName, file }) => {
					this.addOtherSound(scope, soundName, file);
				});
			});

			this.onToggleAudio(config.playAudio);
		},

		//Fired when a character rezones
		// 'scope' is the new zone name
		unload: function (newScope) {
			const { sounds } = this;

			for (let i = 0; i < sounds.length; i++) {
				const { scope, sound } = sounds[i];

				if (!globalScopes.includes(scope) && scope !== newScope) {
					if (sound)
						sound.unload();
					sounds.splice(i, 1);
					i--;
				}
			}
		},

		playSound: function (soundName) {
			const soundEntry = this.sounds.find(s => s.name === soundName);
			if (!soundEntry)
				return;

			soundEntry.sound.play();
		},

		update: function (x, y) {
			this.sounds.forEach(s => {
				let volume;

				if (!s.w) {
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
					volume = 0.3 * dist;
				} else if (physics.isInPolygon(x, y, s.area)) 
					volume = 0.3;
				else {
					let distance = physics.distanceToPolygon([x, y], s.area);
					if (distance > 10) {
						if (s.sound)
							s.sound.volume(0);
						return;
					}

					let dist = 10 - distance;
					dist = (dist * dist) / 100;
					volume = 0.3 * dist;
				}

				if (!s.sound) {
					//eslint-disable-next-line no-undef
					s.sound = new Howl({
						src: ['audio/' + s.file],
						autoplay: true,
						loop: true,
						volume: 0
					});

					if (this.muted) 
						s.sound.mute(true);
				}

				if (!this.muted) 
					s.sound.volume(volume * s.volume);
			});
		},

		addSound: function (scope, file, volume, x, y, w, h, area) {
			if (!area && w) {
				area = [
					[x, y],
					[x + w, y],
					[x + w, y + h],
					[x, y + h]
				];
			}

			const sound = {
				file,
				x,
				y,
				w,
				h,
				volume,
				area,
				sound: null,
				scope
			};

			this.sounds.push(sound);
		},

		addOtherSound: function (scope, soundName, file) {
			//eslint-disable-next-line no-undef
			const sound = new Howl({
				src: [file],
				volume: 1
			});

			const soundEntry = {
				name: soundName,
				file,
				sound,
				scope: 'ui'
			};

			this.sounds.push(soundEntry);
		},

		onToggleAudio: function (isAudioOn) {
			this.muted = !isAudioOn;

			this.sounds.forEach(s => {
				if (!s.sound)
					return;

				s.sound.mute(this.muted);
			});

			if (!window.player)
				return;
			
			const { player: { x, y } } = window;

			this.update(x, y);
		}
	};
});
