define([
	'js/rendering/lightningBuilder',
	'js/rendering/effects'
], function(
	lightningBuilder,
	effects
) {
	return {
		type: 'lightningEffect',

		cd: 0,
		cdMax: 1,

		effect: null,

		init: function() {
			effects.register(this);

			this.effect = lightningBuilder.build({
				fromX: this.obj.x + 0,
				fromY: this.obj.y + 0.5,
				toX: this.obj.x - 2.5,
				toY: this.obj.y - 6.5
			});
		},

		renderManual: function() {
			if (this.cd > 0) {
				this.cd--;
				return;
			}

			this.cd = this.cdMax;

			lightningBuilder.destroy(this.effect);

			this.effect = lightningBuilder.build({
				fromX: this.obj.x + 0,
				fromY: this.obj.y + 0.5,
				toX: this.obj.x - 2.5,
				toY: this.obj.y - 6.5
			});
		},

		destroyManual: function() {
			lightningBuilder.destroy(this.effect);

			effects.unregister(this);
		}
	};
});