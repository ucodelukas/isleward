module.exports = {
	type: 'frenzy',
	newCd: 0,

	events: {
		beforeSetSpellCooldown: function (msg, spell) {
			if (!spell.auto)
				return;

			msg.cd = this.newCd;
		}
	}
};
