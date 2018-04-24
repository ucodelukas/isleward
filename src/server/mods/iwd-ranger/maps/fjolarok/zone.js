define([

], function (

) {
	return {
		mobs: {
			finn: {
				cron: '0 */4 * * *',
				lifetime: 1717,
				walkDistance: 0,

				rare: {
					chance: 100,
					count: 1,
					sheetName: 'server/mods/iwd-ranger/images/mobs.png',
					cell: 0,
					attackable: false,
					name: 'Finn Elderbow'
				}
			}
		},

		objects: {
			"finn's stash": {
				name: '',
				cron: '0 */4 * * *',
				lifetime: 1717,

				properties: {
					cpnChest: {},
					cpnInventory: {
						items: [{
							name: 'Broken Elderbow',
							spritesheet: 'server/mods/iwd-ranger/images/items.png',
							sprite: [0, 0],
							noSalvage: true
						}]
					}
				}
			},

			talkfinn: {
				properties: {
					cpnNotice: {
						actions: {
							enter: {
								cpn: 'dialogue',
								method: 'talk',
								args: [{
									targetName: 'finn elderbow'
								}]
							},
							exit: {
								cpn: 'dialogue',
								method: 'stopTalk'
							}
						}
					}
				}
			}
		}
	};
});
