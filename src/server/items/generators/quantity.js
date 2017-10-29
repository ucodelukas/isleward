define([
	
], function(
	
) {
	return {
		generate: function(item, blueprint) {
			var qty = blueprint.quantity;

			if (!qty)
				return;

			if (qty instanceof Array)
				item.quantity = qty[0] + ~~(Math.random() * (qty[1] - qty[0]));
			else
				item.quantity = qty;
		}
	};
});