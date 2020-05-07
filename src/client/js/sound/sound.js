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
	const minDistance = 10;
	const globalVolume = 0.3;
	const fadeDuration = 3000;

	return {
		sounds: [],

		muted: false,

		init: function () {
			events.on('onToggleAudio', this.onToggleAudio.bind(this));
			events.on('onPlaySound', this.playSound.bind(this));

			const { clientConfig: { sounds: loadSounds } } = globals;

			Object.entries(loadSounds).forEach(([ scope, soundList ]) => {
				soundList.forEach(({ name: soundName, file }) => {
					this.addSound({
						name: soundName,
						file,
						scope: 'ui',
						autoLoad: true
					});
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

		playSoundHelper: function (soundEntry, volume) {
			const { sound } = soundEntry;

			volume *= globalVolume;

			if (!sound) {
				const { file, loop } = soundEntry;

				soundEntry.sound = this.loadSound(file, loop, true, volume);

				return;
			}

			if (sound.playing()) {
				if (sound.volume() === volume)
					return;

				sound.volume(volume);
			} else {
				sound.volume(1);
				sound.play();
			}
		},

		playMusicHelper: function (soundEntry) {
			const { sound } = soundEntry;

			if (!sound) {
				const { file, loop } = soundEntry;

				soundEntry.sound = this.loadSound(file, loop, true, globalVolume);

				return;
			}

			if (sound.playing())
				return;

			sound.volume(0);
			sound.play();
			sound.fade(0, globalVolume, fadeDuration);
		},

		stopSoundHelper: function (soundEntry) {
			const { sound, music } = soundEntry;

			if (!sound || !sound.playing())
				return;

			if (music)
				sound.fade(sound.volume(), 0, fadeDuration);
			else
				sound.stop();
		},

		updateSounds: function (playerX, playerY) {
			this.sounds.forEach(s => {
				const { x, y, area, music, scope } = s;

				if (music || scope === 'ui')
					return;

				let distance = 0;

				if (!area) {
					let dx = Math.abs(x - playerX);
					let dy = Math.abs(y - playerY);
					distance = Math.max(dx, dy);
				} else if (!physics.isInPolygon(playerX, playerY, area))
					distance = physics.distanceToPolygon([playerX, playerY], area);
				
				if (distance > minDistance) {
					this.stopSoundHelper(s);

					return;
				}

				//Exponential fall-off
				const volume = s.volume * (1 - (Math.pow(distance, 2) / Math.pow(minDistance, 2)));
				this.playSoundHelper(s, volume);
			});
		},

		updateMusic: function (playerX, playerY) {
			const sounds = this.sounds;

			const areaMusic = sounds.filter(s => s.music && s.area);
			const currentMusic = areaMusic.find(s => physics.isInPolygon(playerX, playerY, s.area));
			
			const defaultMusic = sounds.find(s => s.music && s.defaultMusic);

			if (!currentMusic) {
				if (defaultMusic)
					this.playMusicHelper(defaultMusic);

				const activeMusic = sounds.filter(s => s.music && s !== defaultMusic && s.sound && s.sound.playing());
				activeMusic.forEach(s => this.stopSoundHelper(s));
			} else {
				if (defaultMusic)
					this.stopSoundHelper(defaultMusic);

				if (currentMusic)
					this.playMusicHelper(currentMusic);
			}
		},

		update: function (playerX, playerY) {
			this.updateSounds(playerX, playerY);
			this.updateMusic(playerX, playerY);
		},

		addSound: function (
			{ name: soundName, scope, file, volume = 1, x, y, w, h, area, music, defaultMusic, autoLoad, loop }
		) {
			if (!area && w) {
				area = [
					[x, y],
					[x + w, y],
					[x + w, y + h],
					[x, y + h]
				];
			}

			let sound = null;
			if (autoLoad)
				sound = this.loadSound(file, loop);

			if (music)
				volume = 0;

			const soundEntry = {
				name: soundName,
				sound,
				scope,
				file,
				loop,
				x,
				y,
				volume,
				area,
				music,
				defaultMusic
			};

			this.sounds.push(soundEntry);
		},

		loadSound: function (file, loop = false, autoplay = false, volume = 1) {
			//eslint-disable-next-line no-undef
			const sound = new Howl({
				src: [file],
				volume,
				loop,
				autoplay
			});

			return sound;
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
