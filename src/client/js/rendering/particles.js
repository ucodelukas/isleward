define([
	'particles',
	'js/rendering/particleDefaults',
	'js/rendering/shaders/outline'
], function(
	pixiParticles,
	particleDefaults,
	shaderOutline
) {
	return {
		renderer: null,
		stage: null,

		emitters: [],

		lastTick: null,

		init: function(options) {
			this.r = options.r;
			this.renderer = options.renderer;
			this.stage = options.stage;
			this.lastTick = Date.now();
		},

		buildEmitter: function(config) {
			var options = $.extend(true, {}, particleDefaults, config);

			var emitter = new PIXI.particles.Emitter(this.r.layers.particles, ['images/particles.png'], options);
			emitter.emit = true;

			this.emitters.push(emitter);

			return emitter;
		},

		destroyEmitter: function(emitter) {
			emitter.emit = false;
		},

		update: function() {
			var renderer = this.r;
			var now = Date.now();

			var emitters = this.emitters;
			var eLen = emitters.length;
			for (var i = 0; i < eLen; i++) {
				var e = emitters[i];

				var destroy = ((!e.emit) && (e.particleCount == 0));

				if (destroy) {
					emitters.splice(i, 1);
					e.destroy();
					e = null;

					i--;
					eLen--;
					continue;
				} 

				if (!renderer.isVisible(e.spawnPos.x, e.spawnPos.y))
					continue;

				var r = e.update((now - this.lastTick) * 0.001);
				r.forEach(function(rr) {
					if (e.blendMode == 'overlay')
						rr.pluginName = 'picture';
				}, this);
			}

			this.lastTick = now;
		}
	};
});