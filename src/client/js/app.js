/* global require */
window.require = requirejs;

require.config({
	baseUrl: '',
	waitSeconds: 120,
	paths: {
		socket: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.slim',
		jquery: 'https://code.jquery.com/jquery-3.4.1.slim.min',
		text: 'plugins/text',
		html: 'plugins/html',
		css: 'plugins/css',
		main: 'js/main',
		helpers: 'js/misc/helpers',
		particles: 'plugins/pixi.particles',
		//picture: 'plugins/pixi.picture',
		pixi: 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.3/pixi.min',
		howler: 'plugins/howler.min'
	},
	shim: {
		howler: {
			exports: 'howl'
		},
		socket: {
			exports: 'io'
		},
		jquery: {
			exports: '$'
		},
		helpers: {
			deps: [
				'jquery'
			]
		},
		pixi: {
			exports: 'PIXI'
		},
		particles: {
			deps: [
				'pixi'
			]
		},
		/*picture: {
			deps: [
				'pixi'
			]
		},*/
		main: {
			deps: [
				'helpers',
				'js/input'
			]
		}
	}
});

require([
	'main'
], function (
	main
) {
	main.init();
});
