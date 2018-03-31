define([

], function (

) {
	return {
		sheetId: '',

		roles: [{
			username: 'admin',
			level: 10,
			messagestyle: 'color-blueA',
			messageprefix: '(dev) ',
			skins: ['*'],
			items: [{
				type: 'key',
				name: 'Key to the world',
				sprite: [2, 0],
				keyId: 'world'
			}]
		}]
	};
});
