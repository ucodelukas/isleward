module.exports = {
	'cult leader': {
		'1': {
			msg: [{
				msg: `Is there anything I can help you with today?`,
				options: [1.1, 1.2, 1.3, 1.4]
			}],
			options: {
				'1.1': {
					msg: `I'd like to browse your wares.`,
					goto: 'tradeBuy'
				},
				'1.2': {
					msg: `I have some items to sell.`,
					goto: 'tradeSell'
				},
				'1.3': {
					msg: `I want to buy something back.`,
					goto: 'tradeBuyback'
				},
				'1.4': {
					msg: `I have some crystals for you.`,
					prereq: function(obj) {
						var crystals = obj.inventory.items.find(i => (i.name == 'Digested Crystal'));
						return !!crystals;
					},
					goto: 'giveCrystals'
				}
			}
		},
		tradeBuy: {
			cpn: 'trade',
			method: 'startBuy',
			args: [{
				targetName: 'cult leader'
			}]
		},
		tradeSell: {
			cpn: 'trade',
			method: 'startSell',
			args: [{
				targetName: 'cult leader'
			}]
		},
		tradeBuyback: {
			cpn: 'trade',
			method: 'startBuyback',
			args: [{
				targetName: 'cult leader'
			}]
		},
		giveCrystals: {
			msg: [{
				msg: `The Akarei thank you.`,
				options: [1.1, 1.2, 1.3]
			}],
			method: function(obj) {
				var inventory = obj.inventory;
				var crystals = inventory.items.find(i => (i.name == 'Digested Crystal'));
				inventory.destroyItem(crystals.id);
			}
		}
	}
};