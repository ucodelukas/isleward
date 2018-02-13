require.config({
	baseUrl: '',
	waitSeconds: 120,
	paths: {
		'jquery': 'plugins/jquery.min',
		'text': 'plugins/text',
		'html': 'plugins/html',
		'css': 'plugins/css'
	},
	shim: {
		'jquery': {
			exports: '$'
		}
	}
});

require([
	'js/helpers',
	'jquery',
	'js/main'
], function (
	helpers,
	jQuery,
	main
) {
	main.init();
});
