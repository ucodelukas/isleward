define([
	
], function(
	
) {
	return {
		type: 'frenzy',

		events: {
			beforeSetSpellCooldown: function(msg, spell) {
				msg.cd = 0;
			}
		}
	};
});