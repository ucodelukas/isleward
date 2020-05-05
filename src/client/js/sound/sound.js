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

		update: function (playerX, playerY) {
			this.sounds.forEach(s => {
				const { x, y, w, area, sound, minDistance, fadeInOut } = s;

				let volume;

				if (!w) {
					let dx = Math.abs(x - playerX);
					if (dx >= minDistance) {
						if (sound)
							sound.volume(0);
						return;
					}
					let dy = Math.abs(y - playerY);
					if (dy >= minDistance) {
						if (sound)
							sound.volume(0);
						return;
					}

					let dist = minDistance - Math.max(dx, dy);
					dist = (dist * dist) / Math.pow(minDistance, 2);
					volume = 0.3 * dist;
				} else if (physics.isInPolygon(playerX, playerY, area))
					volume = 0.3;
				else {
					let distance = physics.distanceToPolygon([playerX, playerY], area);
					if (distance >= minDistance) {
						if (sound) {
							if (fadeInOut)
								sound.fade(sound.volume(), 0, 3000);
							else
								sound.volume(0);
						}
						
						return;
					}

					let dist = minDistance - distance;
					dist = (dist * dist) / Math.pow(minDistance, 2);
					volume = 0.3 * dist;
				}

				if (!sound) {
					const file = s.file.includes('server') ? s.file : `audio/${s.file}`;
					//eslint-disable-next-line no-undef
					s.sound = new Howl({
						src: [file],
						autoplay: true,
						loop: true,
						volume: 0
					});

					if (this.muted) 
						s.sound.mute(true);
				}

				if (this.muted)
					return;

				const oldVolume = s.sound.volume();
				const newVolume = volume * s.volume;
				const volumeChanged = newVolume !== oldVolume;

				if (volumeChanged) {
					if (fadeInOut)
						s.sound.fade(oldVolume, newVolume, 3000);
					else
						s.sound.volume(newVolume);
				}
			});
		},

		addSound: function (scope, file, volume, x, y, w, h, area) {
			this.addSoundFromConfig({ scope, file, volume, x, y, w, h, area });
		},

		addSoundFromConfig: function ({ scope, file, volume, x, y, w, h, area, minDistance, fadeInOut }) {
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
				scope,
				minDistance,
				fadeInOut
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
