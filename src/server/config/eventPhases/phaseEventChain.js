define([

], function (

) {
	return {
		config: null,
		state: -1,
		cd: 0,
		repeat: 0,

		init: function () {
			this.update();
		},

		update: function () {
			if (this.cd == 0) {
				if (this.state < this.config.length - 1) {
					this.state++;
					var stateConfig = this.config[this.state];

					if (stateConfig.repeat) {
						if (!stateConfig.oldRepeat)
							stateConfig.oldRepeat = stateConfig.repeat;

						stateConfig.repeat--;
					}

					this.cd = (stateConfig.delay instanceof Array) ? stateConfig.delay[stateConfig.oldRepeat - stateConfig.repeat - 1] : stateConfig.delay;
					this.events[stateConfig.type].call(this, stateConfig);

					if (stateConfig.repeat > 0)
						this.state--;
					else
						stateConfig.repeat = stateConfig.oldRepeat;

					//Sometimes (Like when we make a mob attackable, then check if they're alive in a new phase), the next phase doesn't 
					// trigger soon enough. So if there's no delay, make sure to switch phases asap.
					if (!this.cd)
						this.end = true;
				} else
					this.end = true;
			} else
				this.cd--;
		},

		events: {
			mobTalk: function (config) {
				var mob = this.instance.objects.objects.find(o => (o.id == config.id));
				var text = (config.text instanceof Array) ? config.text[config.oldRepeat - config.repeat - 1] : config.text;

				if (config.zone) {
					this.instance.syncer.queue('onGetMessages', {
						messages: {
							class: 'q4',
							message: mob.name + ': ' + text
						}
					});
				} else {
					mob.addComponent('chatter');
					mob.syncer.set(false, 'chatter', 'msg', text);
				}
			},
			addComponents: function (config) {
				var objects = this.instance.objects.objects;

				var components = config.components;
				if (!components.push)
					components = [components];
				var cLen = components.length;

				var mobs = config.mobs;
				if (!mobs.push)
					mobs = [mobs];
				var mLen = mobs.length;

				for (var i = 0; i < mLen; i++) {
					var mob = objects.find(o => (o.id == mobs[i]));
					for (var j = 0; j < cLen; j++) {
						var c = components[j];
						mob.addComponent(c.type, components[j]);
					}
				}
			},
			removeComponents: function (config) {
				var objects = this.instance.objects.objects;

				var components = config.components;
				if (!components.push)
					components = [components];
				var cLen = components.length;

				var mobs = config.mobs;
				if (!mobs.push)
					mobs = [mobs];
				var mLen = mobs.length;

				for (var i = 0; i < mLen; i++) {
					var mob = objects.find(o => (o.id == mobs[i]));
					for (var j = 0; j < cLen; j++) {
						mob.removeComponent(components[j]);
					}
				}
			}
		}
	};
});
