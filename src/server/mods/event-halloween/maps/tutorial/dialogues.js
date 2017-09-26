define([

], function(

) {
	return {
		hermit: {
			'1': {
				msg: [{
					msg: `What? Oh...what are you doing here?`,
					options: [1.1]
				}],
				options: {
					'1.1': {
						msg: `Me? What are YOU doing in the middle of the wilderness?`,
						goto: 2
					}
				}
			}
		}
	};
});