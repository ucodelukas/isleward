define([

], function (

) {
	return {
		generate: function (item, blueprint) {
			if (!blueprint.effects)
				return;

			item.effects = blueprint.effects.map(function (e) {
				var rolls = e.rolls;
				var newRolls = {};
				for (var p in rolls) {
					var isInt = (p.indexOf('i_') == 0);
					var fieldName = p.replace('i_', '');

					var range = rolls[p];
					var value = range[0] + (Math.random() * (range[1] - range[0]));
					if (isInt)
						value = ~~value;

					newRolls[fieldName] = value;
				}

				return {
					type: e.type,
					rolls: newRolls
				};
			});
		}
	};
});
