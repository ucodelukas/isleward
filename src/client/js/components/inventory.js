define([
	'js/system/events'
], function (
	events
) {
	return {
		type: 'inventory',

		items: [],

		init: function (blueprint) {
			events.emit('onGetItems', this.items);
		},
		extend: function (blueprint) {
			var rerender = false;

			if (blueprint.destroyItems) {
				rerender = true;
				events.emit('onDestroyItems', blueprint.destroyItems);
			}

			if (blueprint.getItems) {
				var items = this.items;
				var newItems = blueprint.getItems || [];
				var nLen = newItems.length;

				for (var i = 0; i < nLen; i++) {
					var nItem = newItems[i];
					var nId = nItem.id;

					var findItem = items.find(function (item) {
						return (item.id == nId);
					});
					if (findItem) {
						if (!rerender) {
							rerender = (
								(findItem.pos != nItem.pos) ||
								(findItem.eq != nItem.eq) ||
								(findItem.quantity != nItem.quantity)
							);
						}

						for (var p in findItem) {
							delete findItem[p];
						}

						$.extend(true, findItem, nItem);

						newItems.splice(i, 1);
						i--;
						nLen--;
					} else {
						rerender = true;
						nItem.isNew = true;
					}
				}

				this.items.push.apply(this.items, blueprint.getItems || []);

				events.emit('onGetItems', this.items, rerender);
			}
		},

		equipItemErrors: function (item) {
			var errors = [];
			var stats = this.obj.stats.values;

			var playerLevel = (stats.originalLevel || stats.level);
			if (item.level > playerLevel)
				errors.push('level');

			if ((item.requires) && (stats[item.requires[0].stat] < item.requires[0].value))
				errors.push('stats');

			if (item.factions) {
				if (item.factions.some(function (f) {
						return f.noEquip;
					}))
					errors.push('faction');
			}

			return errors;
		},

		canEquipItem: function (item) {
			return (this.equipItemErrors(item).length == 0);
		}
	};
});
