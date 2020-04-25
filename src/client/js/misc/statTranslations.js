define([
	'../system/globals'
], function (
	globals
) {
	const { clientConfig: { statTranslations } } = globals;

	return {
		translate: function (stat) {
			return statTranslations[stat];
		}
	};
});
