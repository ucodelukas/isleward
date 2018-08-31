define([
	'particles',
	'js/rendering/particleDefaults',
	'js/rendering/shaders/outline'
], function (
	pixiParticles,
	particleDefaults,
	shaderOutline
) {
	return {
		renderer: null,
		stage: null,

		emitters: [],

		lastTick: null,

		init: function (options) {
			this.r = options.r;
			this.renderer = options.renderer;
			this.stage = options.stage;
			this.lastTick = Date.now();
		},

		buildEmitter: function (config) {
<<<<<<< HEAD
			let options = $.extend(true, {}, particleDefaults, config);

			let emitter = new PIXI.particles.Emitter(this.r.layers.particles, ['images/particles.png'], options);
=======
			var obj = config.obj;
			delete config.obj;
			var options = $.extend(true, {}, particleDefaults, config);

			var emitter = new PIXI.particles.Emitter(this.r.layers.particles, ['images/particles.png'], options);
			emitter.obj = obj;
>>>>>>> 555-new-dungeon
			emitter.emit = true;

			this.emitters.push(emitter);

			return emitter;
		},

		destroyEmitter: function (emitter) {
			emitter.emit = false;
		},

		update: function () {
<<<<<<< HEAD
			let renderer = this.r;
			let now = Date.now();
=======
			var renderer = this.r;
			var now = Date.now();
>>>>>>> 555-new-dungeon

			let emitters = this.emitters;
			let eLen = emitters.length;
			for (let i = 0; i < eLen; i++) {
				let e = emitters[i];

<<<<<<< HEAD
				let visible = null;
				let destroy = !e.emit;
=======
				var visible = null;
				var destroy = (
					(!e.emit) &&
					(e.obj.destroyed)
				);
>>>>>>> 555-new-dungeon
				if (destroy) {
					if (e.particleCount > 0) {
						visible = renderer.isVisible(e.spawnPos.x, e.spawnPos.y);
						if (visible)
							destroy = false;
					}
				}

				if (destroy) {
					emitters.splice(i, 1);
					e.destroy();
					e = null;

					i--;
					eLen--;
					continue;
				}

				if (visible === null)
					visible = renderer.isVisible(e.spawnPos.x, e.spawnPos.y);
				if (!visible)
					continue;

<<<<<<< HEAD
				let r = e.update((now - this.lastTick) * 0.001);
				r.forEach(function (rr) {
					if (e.blendMode === 'overlay')
=======
				var r = e.update((now - this.lastTick) * 0.001);
				r.forEach(function (rr) {
					if (e.blendMode == 'overlay')
>>>>>>> 555-new-dungeon
						rr.pluginName = 'picture';
				}, this);
			}

			this.lastTick = now;
		}
	};
});
