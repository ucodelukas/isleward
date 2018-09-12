module.exports = {
	events: {
		onGetText: function (item) {
			let rolls = item.effects.find(e => (e.type === 'reduceRuneManaReserve')).rolls;

			return `Reduces the mana reserved by ${rolls.rune} by ${rolls.amount}%`;
		},

		onBeforeReserveMana: function (item, reserveEvent) {
			let rolls = item.effects.find(e => (e.type === 'reduceRuneManaReserve')).rolls;

			if (rolls.rune.toLowerCase() !== reserveEvent.spell.toLowerCase())
				return;

			reserveEvent.reservePercent = Math.max(0, reserveEvent.reservePercent - rolls.amount);
		},

		afterEquipItem: function (item) {
			let rolls = item.effects.find(e => (e.type === 'reduceRuneManaReserve')).rolls;
			if (!rolls)
				return;

			let spell = this.spellbook.spells.find(s => s.active && s.name === rolls.rune);
			if (!spell)
				return;

			let spellReserve = spell.manaReserve.percentage;

			this.stats.addStat('manaReservePercent', -Math.min(spellReserve, rolls.amount));
		},

		afterUnequipItem: function (item) {
			let rolls = item.effects.find(e => (e.type === 'reduceRuneManaReserve')).rolls;
			if (!rolls)
				return;

			let spell = this.spellbook.spells.find(s => s.active && s.name === rolls.rune);
			if (!spell)
				return;

			let spellReserve = spell.manaReserve.percentage;

			let stats = this.stats;
			let newReserve = stats.manaReservePercent + Math.max(0, spellReserve - rolls.amount) - spellReserve;

			stats.addStat('manaReservePercent', Math.min(spellReserve, rolls.amount));
			if (newReserve < 0)
				this.spellbook.removeSpellById(spell.id);
		}
	}
};
