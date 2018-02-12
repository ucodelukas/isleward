require.config({
	baseUrl: '',
	waitSeconds: 120,
	paths: {
		'jquery': '../../src/client/plugins/jquery.min',
	},
	shim: {
		'jquery': {
			exports: '$'
		}
	}
});

require([
	'../../src/client/js/misc/helpers',
	'jquery',
	'js/main'
], function (
	helpers,
	jQuery,
	main
) {
	main.init();
});
