define([
	'items/config/slots'
], function(
	slots
) {
	return {
		slot: null,

		type: 'loot',

		build: function() {
			var slotNames = slots.slots
				.filter(s => (s != 'tool'));

			if (!this.slot) {
				this.slot = slotNames[~~(Math.random() * slotNames.length)];
				this.slotName = this.slot[0].toUpperCase() + this.slot.substr(1);
			} else if (!slotNames.some(s => (s == this.slot)))
				return false;
				
			this.description = 'Loot 1x ' + this.slotName + ' slot item';

			return true;
		},

		events: {
			afterLootMobItem: function(item) {
				if ((this.obj.zoneName != this.zoneName) || (item.slot != this.slot))
					return;

				this.ready();
			}
		}
	};
});