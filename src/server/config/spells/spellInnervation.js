define([

], function (

) {
	return {
		type: 'innervation',

		cdMax: 0,
		manaCost: 5,

		duration: 10,

		aura: true,
		active: false,

		effects: {},

		cast: function (action) {
			this.active = !this.active;

			return true;
		},

		update: function () {
			var active = this.active;

			if (active)
				this.updateActive();
			else
				this.updateInactive();
		},

		updateActive: function () {
			var o = this.obj;
			var amount = (o.stats.values.hpMax / 100) * this.values.percentage;

			var party = o.social.party || [];
			var members = [o.serverId, ...party];
			var effects = this.effects;
			var objects = o.instance.objects.objects;

			var range = this.auraRange;

			members.forEach(function (m) {
				var effect = effects[m];

				var obj = objects.find(o => (o.serverId === m));
				if (!obj)
					return;

				var distance = Math.max(Math.abs(o.x - obj.x), Math.abs(o.y - obj.y));
				if (distance > range) {
					if (effect) {
						delete effects[m];
						obj.effects.removeEffect(effect);
					}

					return;
				}

				if (effect)
					return;

				effects[obj.serverId] = obj.effects.addEffect({
					type: 'regenHp',
					amount: amount,
					caster: this.obj,
					ttl: -1
				});
			}, this);
		},

		updateInactive: function () {
			var o = this.obj;
			var effects = this.effects;
			var objects = o.instance.objects.objects;

			Object.keys(effects).forEach(function (o) {
				var effect = effects[m];
				if (!effect)
					return;

				var obj = objects.find(o => (o.serverId === m));
				if (!obj) {
					delete effects[m];
					return;
				}

				obj.effects.removeEffect(effect);
			}, this);
		}
	};
});
