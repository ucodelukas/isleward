define([

], function (

) {
	return {
		type: 'aura',

		cdMax: 0,
		manaCost: 0,

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

		unlearn: function () {
			this.updateInactive();
		},

		onAfterSimplify: function (values) {
			delete values.effects;
		},

		updateActive: function () {
			var o = this.obj;
			var amount = 0;
			if (this.name == 'Innervation')
				amount = ~~((o.stats.values.hpMax / 100) * this.values.regenPercentage);
			else
				amount = this.values.regenPercentage || this.values.chance;

			var party = (o.social || {}).party || [];
			var members = [o.serverId, ...party];
			var effects = this.effects;
			var objects = o.instance.objects.objects;

			var range = this.auraRange;

			members.forEach(function (m) {
				var effect = effects[m];

				var obj = objects.find(o => (o.serverId === m));
				if (!obj) {
					if (effect)
						delete effects[m];

					return;
				}

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

				if (!obj.effects) {
					console.log('No Effects ', +obj.name);
					return;
				}

				effects[obj.serverId] = obj.effects.addEffect({
					type: this.effect,
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

			Object.keys(effects).forEach(function (m) {
				var effect = effects[m];
				if (!effect)
					return;

				var obj = objects.find(o => (o.serverId == m));
				if (!obj) {
					delete effects[m];
					return;
				}

				obj.effects.removeEffect(effect);
				delete effects[m];
			}, this);
		}
	};
});
