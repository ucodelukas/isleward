define([

], function(

) {
	return {
		'the pumpkin sailor': {
			'1': {
				msg: [{
					msg: `Yo!`,
					options: [1.3, 1.4, 1.5]
				}],
				options: {
					'1.3': {
						msg: `Want buy thing!`,
						goto: 'tradeBuy'
					},
					'1.4': {
						msg: `I have some items you might be interested in.`,
						goto: 'tradeSell'
					},
					'1.5': {
						msg: `I changed my mind, I want to buy something back.`,
						goto: 'tradeBuyback'
					}
				}
			},
			tradeBuy: {
				cpn: 'trade',
				method: 'startBuy',
				args: [{
					targetName: 'the pumpkin sailor'
				}]
			},
			tradeSell: {
				cpn: 'trade',
				method: 'startSell',
				args: [{
					targetName: 'the pumpkin sailor'
				}]
			},
			tradeBuyback: {
				cpn: 'trade',
				method: 'startBuyback',
				args: [{
					targetName: 'the pumpkin sailor'
				}]
			}
		}
	};
});