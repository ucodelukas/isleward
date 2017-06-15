module.exports = {
	'cult leader': {
		'1': {
			msg: [{
				msg: `Is there anything I can help you with today?`,
				options: [1.1, 1.2, 1.3]
			}],
			options: {
				'1.1': {
					msg: `I'd like to browse your wares.`,
					goto: 'tradeBuy'
				},
				'1.2': {
					msg: `I have some items to sell`,
					goto: 'tradeSell'
				},
				'1.3': {
					msg: `I want to buy something back`,
					goto: 'tradeBuyback'
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
		}
	}
};