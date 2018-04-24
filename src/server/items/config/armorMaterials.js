define([

], function (

) {
	return {
		plate: {
			attrRequire: 'str',
			statMult: {
				armor: 1
			}
		},
		leather: {
			attrRequire: 'dex',
			statMult: {
				armor: 0.6
			}
		},
		cloth: {
			attrRequire: 'int',
			statMult: {
				armor: 0.35
			}
		}
	};
});
