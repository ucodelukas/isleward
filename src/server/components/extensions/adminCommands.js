define([
	
], function(
	
) {
	return {
		roleLevel: null,

		init: function(blueprint) {
			this.roleLevel = blueprint.roleLevel;
		},

		onBeforeChat: function(msg) {
			console.log(msg.message);
			msg.ignore = true;
		}
	};
});