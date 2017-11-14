define([

], function (

) {
	return {
		'father giftybags': {
			'1': {
				msg: [{
					msg: `Soul's greeting to you.`,
					options: [1.1, 1.2, 1.3, 1.4]
				}],
				options: {
					'1.1': {
						msg: `Who are you?`,
						goto: '2'
					},
					'1.2': {
						msg: `Have you found anything worth selling?`,
						goto: 'tradeBuy'
					},
					'1.3': {
						msg: `I have some items you might have use for..`,
						goto: 'tradeSell'
					},
					'1.4': {
						msg: `I sold you something by accident.`,
						goto: 'tradeBuyback'
					}
				}
			},
			'2': {
				msg: [{
					msg: `Most call me the Pumpkin Sailor. Some call me the Sailor of Souls. You can call me either.`,
					options: [2.1]
				}],
				options: {
					'2.1': {
						msg: `Souls? What kind of souls?`,
						goto: '3'
					}
				}
			},
			'3': {
				msg: [{
					msg: `Why, human souls! The sea claims without mercy and once in its cold grasp, few ever escape. I do what I can to gather the few I can track down; store them in these jars here.`,
					options: [3.1]
				}],
				options: {
					'3.1': {
						msg: `Then what?`,
						goto: '4'
					}
				}
			},
			'4': {
				msg: [{
					msg: `Well, a soul wants to return home; to be at rest. Once ashore, they are free to find their final resting place.`,
					options: [4.1]
				}],
				options: {
					'4.1': {
						msg: `How do they find their way back?`,
						goto: '5'
					}
				}
			},
			'5': {
				msg: [{
					msg: `Their loved ones put out pumpkins, carved with their family runes. The souls simply look for something familiar. Unfortunately, they are easily fooled too.`,
					options: [5.1]
				}],
				options: {
					'5.1': {
						msg: `Who would fool them?`,
						goto: '6'
					}
				}
			},
			'6': {
				msg: [{
					msg: `I am not without enemies. There are those who would display forged runes; clever replications meant to lure and trap souls. Lord Squash, is one such. A foul creature; powerful and fearful.`,
					options: []
				}],
				options: {

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
