define([

], function (

) {
	return {
		slots: [
			'head',
			'neck',
			'chest',
			'hands',
			'finger',
			'waist',
			'legs',
			'feet',
			'trinket',
			'oneHanded',
			'twoHanded',
			'offHand',
			'tool'
		],

		chance: {
			head: 85,
			neck: 45,
			chest: 100,
			hands: 90,
			finger: 40,
			waist: 80,
			legs: 100,
			feet: 90,
			trinket: 35,
			oneHanded: 60,
			twoHanded: 60,
			offHand: 40,
			tool: 0
		},

		armorMult: {
			head: 0.2,
			neck: 0,
			chest: 0.4,
			hands: 0.1,
			finger: 0,
			waist: 0,
			legs: 0.2,
			feet: 0.1,
			trinket: 0,
			oneHanded: 0,
			twoHanded: 0,
			offHand: 0,
			tool: 0
		},

		getRandomSlot: function (exclude) {
			var chances = [];
			for (var c in this.chance) {
				if (c == exclude)
					continue;

				var rolls = this.chance[c];
				for (var i = 0; i < rolls; i++) {
					chances.push(c);
				}
			}

			return chances[~~(Math.random() * chances.length)];
		}
	};
});
