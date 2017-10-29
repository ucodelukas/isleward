define([

], function (

) {
	return {
		type: 'frenzy',
		newCd: 0,

		events: {
			beforeSetSpellCooldown: function (msg, spell) {
				msg.cd = this.newCd;
			}
		}
	};
});
