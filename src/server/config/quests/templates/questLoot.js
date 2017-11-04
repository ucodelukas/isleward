define([
	'items/config/slots'
], function (
	slots
) {
	return {
		slot: null,
		quality: 0,

		type: 'loot',

		build: function () {
			var slotNames = slots.slots
				.filter(s => (s != 'tool'));

			if (this.slot) {
				if (!slotNames.some(s => (s == this.slot)))
					this.slot = null;
			}

			if (!this.slot) {
				if (Math.random() < 0.2) {
					this.quality = 1 + ~~(Math.random() * 2);
					this.slotName = '';

					if (this.quality == 1) {
						var roll = ~~(Math.random() * 2);
						if (roll == 0)
							this.slotName = 'Magic Armor'
						else
							this.slotName = 'Magic Accessory';

						this.slot = ([
							[
								'head',
								'chest',
								'hands',
								'waist',
								'legs',
								'feet'
							],
							[
								'trinket',
								'neck',
								'finger'
							]
						])[roll];
					} else {
						this.slotName = 'Rare Equipment';
						this.slot = slotNames;
					}

					this.name = 'Purveyor of Rarities';
					this.description = 'Loot 1x ' + this.slotName;
				} else {
					this.slot = slotNames[~~(Math.random() * slotNames.length)];
					this.slotName = this.slot[0].toUpperCase() + this.slot.substr(1);
					this.description = 'Loot 1x ' + this.slotName + ' slot item';
				}
			}

			return true;
		},

		events: {
			afterLootMobItem: function (item) {
				if (this.obj.zoneName != this.zoneName)
					return;
				else if ((this.quality) && (item.quality != this.quality))
					return;
				else if ((this.slot.indexOf) && (this.slot.indexOf(item.slot) == -1))
					return
				else if ((!this.slot.indexOf) && (this.slot != item.slot))
					return;

				this.ready();
			}
		}
	};
});
