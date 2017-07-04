define([
	
], function(
	
) {
	return {
		init: function() {
			var mob = this.instance.objects.objects.find(m => (m.id == this.mobId));
			var states = mob.dialogue.states;

			this.addStates(states, this.dialogue.add || {});
			this.removeStates(states, this.dialogue.remove || {});
		},

		addStates: function(dialogue, states) {
			for (var s in states) {
				var source = states[s];
				var target = dialogue[s];
				if (!target) {
					dialogue[s] = source;
					continue;
				}

				for (var o in source) {
					target.msg[0].options.push(o);
					target.options[o] = source[o];
				}
			}
		},

		removeStates: function(dialogue, states) {

		}
	};
});