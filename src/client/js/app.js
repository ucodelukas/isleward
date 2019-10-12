/* global require */
window.require = requirejs;

require.config({
	baseUrl: '',
	waitSeconds: 120,
	paths: {
		socket: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.slim',
		jquery: 'https://code.jquery.com/jquery-3.4.1.slim.min',
		text: 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
		html: 'plugins/html',
		css: 'https://cdnjs.cloudflare.com/ajax/libs/require-css/0.1.10/css.min',
		main: 'js/main',
		helpers: 'js/misc/helpers',
		particles: 'plugins/pixi.particles.min',
		pixi: 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.3/pixi.min',
		howler: 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.1.2/howler.core.min'
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
